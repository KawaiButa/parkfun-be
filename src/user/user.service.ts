import { Injectable } from "@nestjs/common";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}
  async createUser({ name, email, password }: { name: string; email: string; password: string }): Promise<User> {
    const user = await this.userRepository.create({
      name,
      email,
      password,
    });
    return await this.userRepository.save(user);
  }
}
