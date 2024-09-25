import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dtos/signup.dto";
import { LoginDto } from "login.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post("register")
  register(@Body() signUpDto: SignUpDto) {
    return this.authService.register(signUpDto);
  }

  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
