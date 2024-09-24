import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { RegisterDto } from "./dtos/register.dto";
import { DataSource, Repository } from "typeorm";
import { Account } from "src/account/entities/account.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { ROLE } from "src/enums/role";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "src/auth/constants";
import { PostgresErrorCode } from "src/database/constraints";
import { UserAlreadyExistException } from "./exceptions/userExisted.exception";

@Injectable()
export class RegisterService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource
  ) {}
  async register(registerDto: RegisterDto) {
    const isDuplicated = await this.accountRepository.countBy({ email: registerDto.email });
    if (isDuplicated) throw new ConflictException(`An account with email ${registerDto.email} has already existed`);
    const queryRunner = this.dataSource.createQueryRunner();
    const accountProptotype = this.accountRepository.create(registerDto);
    const user = this.userRepository.create({ ...registerDto, account: accountProptotype, role: ROLE.USER });
    queryRunner.connect();
    queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(User, user);
    } catch (err) {
      console.log(err);
      queryRunner.rollbackTransaction();
      if (err?.code === PostgresErrorCode.UniqueViolation) {
        throw new UserAlreadyExistException();
      }
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
    const {
      account: { email },
      id,
      role,
      ...props
    } = user;
    const token = this.jwtService.sign(
      { id, role },
      {
        secret: jwtConstants.secret,
      }
    );
    return { token, data: { ...props, email } };
  }
}
