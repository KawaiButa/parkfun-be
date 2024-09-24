import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDto } from "./dtos/user.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly registerService: AuthService) {}
  @Post("register")
  async register(@Body() registerBody: CreateUserDto) {
    return await this.registerService.register(registerBody);
  }
}
