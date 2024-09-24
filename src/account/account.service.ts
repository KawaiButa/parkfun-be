import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "./entities/account.entity";
import { DataSource, Repository } from "typeorm";
import { CreateAccountDto } from "./dto/createAccount.dto";
import { UpdateAccountDto } from "./dto/updateAccount.dto";

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private dataSource: DataSource
  ) {}
  create(createAccountDto: CreateAccountDto) {
    return this.accountRepository.save(createAccountDto);
  }

  async findAll(): Promise<Account[]> {
    return this.accountRepository.find();
  }

  async findOne(id: number) {
    const account = await this.accountRepository.findOneBy({ id: id });
    if (!account) throw new NotFoundException(`Account with id ${id} not found`);
    return account;
  }

  async update(id: number, updateAccountDto: UpdateAccountDto) {
    const account = await this.accountRepository.findOneBy({ id });
    if (!account) throw new NotFoundException(`Account with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    queryRunner.startTransaction();
    try {
      queryRunner.manager.update(Account, id, { ...updateAccountDto, id });
    } catch (err) {
      console.log(err);
      queryRunner.rollbackTransaction();
      throw err;
    } finally {
      queryRunner.release();
    }
  }

  async remove(id: number) {
    const account = await this.accountRepository.findOneBy({ id });
    if (!account) throw new NotFoundException(`Account with id ${id} cannot be not found`);
    await this.accountRepository.delete(id);
    return `Account with id ${id} was removed successfully`;
  }
}
