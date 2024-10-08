import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "./role.entity";
import { CreateRoleDto } from "./dtos/creatRole.dto";

@Injectable()
export class RoleService {
  constructor(@InjectRepository(Role) private readonly roleRepository: Repository<Role>) {}
  async create(createRoleDto: CreateRoleDto) {
    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }
  async getOneBy(param: Partial<Role>) {
    return await this.roleRepository.findOneBy(param);
  }
  async getAll() {
    return await this.roleRepository.find();
  }
}
