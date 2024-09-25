import { Injectable, UnauthorizedException } from "@nestjs/common";
import { SignUpDto } from "./dtos/signup.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "src/user/user.entity";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "login.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }
    const token = this.jwtService.sign({ id: user.id });
    return { token };
  }

  async register(signUpDto: SignUpDto) {
    const { password, email, name } = signUpDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);
    const token = this.jwtService.sign({ id: user.id });
    return { token };
  }
}
