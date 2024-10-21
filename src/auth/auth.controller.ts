import { Body, Controller, Get, HttpCode, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dtos/signup.dto";
import { LoginDto } from "./dtos/login.dto";
import { LoginWithGoogleDto } from "./dtos/loginWithGoogle.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post("/register")
  register(@Body() signUpDto: SignUpDto) {
    return this.authService.register(signUpDto);
  }

  @Post("login")
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Post("/google")
  @HttpCode(200)
  loginWithGoogle(@Body() loginWithGoogleDto: LoginWithGoogleDto) {
    return this.authService.loginWithGoogle(loginWithGoogleDto);
  }

  @Get("/verify")
  @HttpCode(200)
  verifyUser(@Query("token") token: string) {
    return this.authService.verifyUser(token);
  }
}
