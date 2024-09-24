import { Body, Controller, Post } from "@nestjs/common";
import { RegisterService } from "./register.service";
import { RegisterDto } from "./dtos/register.dto";

@Controller("register")
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}
  @Post()
  async register(@Body() registerBody: RegisterDto): Promise<string> {
    return await this.registerService.register(registerBody);
  }
}
