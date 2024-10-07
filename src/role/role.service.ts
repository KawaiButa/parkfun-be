import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "./role.entity";

@Injectable()
export class RoleService {
  constructor(@InjectRepository(Role) private readonly roleRepository: Repository<Role>) {}

  async getOneBy(param: Partial<Role>) {
    return await this.roleRepository.findOneBy(param);
  }
  async getAll() {
    return await this.roleRepository.find();
  }
}
