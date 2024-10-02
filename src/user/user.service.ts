import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}
  async create({ name, email, password, phoneNumber }: Partial<User>): Promise<User> {
    const user = await this.userRepository.create({
      name,
      email,
      password,
      phoneNumber,
    });
    return await this.userRepository.save(user);
  }

  async update(id: number, updateDto: Partial<Omit<User, "id">>) {
    const result = await this.userRepository.update(id, updateDto);
    if (!result.affected) throw new NotFoundException("Cannot find the user");
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }
}
