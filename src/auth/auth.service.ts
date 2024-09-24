import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ROLE } from "src/enums/role";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "src/auth/constants";
import { PostgresErrorCode } from "src/database/constraints";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dtos/user.dto";
import { UserAlreadyExistException } from "./exceptions/userExisted.exception";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource
  ) {}
  async register(registerDto: CreateUserDto) {
    const isDuplicated = await this.userRepository.countBy({ email: registerDto.email });
    if (isDuplicated) throw new UserAlreadyExistException();
    const queryRunner = this.dataSource.createQueryRunner();
    const user = this.userRepository.create({ ...registerDto, role: ROLE.USER });
    queryRunner.connect();
    queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(User, user);
    } catch (err) {
      console.log(err);
      queryRunner.rollbackTransaction();
      if (err?.code === PostgresErrorCode.UniqueViolation) throw new UserAlreadyExistException();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
    const { id, role, ...props } = user;
    const token = this.jwtService.sign(
      { id, role },
      {
        secret: jwtConstants.secret,
      }
    );
    return { token, ...props };
  }
}
