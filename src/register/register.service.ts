import { ConflictException, Injectable } from "@nestjs/common";
import { RegisterDto } from "./dtos/register.dto";
import { DataSource, Repository } from "typeorm";
import { Account } from "src/account/entities/account.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { ROLE } from "src/enums/role";

@Injectable()
export class RegisterService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource
  ) {}
  async register(registerDto: RegisterDto) {
    const isDuplicated = await this.accountRepository.countBy({ email: registerDto.email });
    if (isDuplicated) throw new ConflictException(`An account with email ${registerDto.email} has already existed`);
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    queryRunner.startTransaction();
    try {
      const account = this.accountRepository.create(registerDto);
      const user = this.userRepository.create({ ...registerDto, account, role: ROLE.USER });
      await queryRunner.manager.save(User, user);
    } catch (err) {
      console.log(err);
      queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
    return "register successful";
  }
}
