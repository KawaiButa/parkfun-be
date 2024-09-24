import { Body, Controller, Post, Res } from "@nestjs/common";
import { RegisterService } from "./register.service";
import { RegisterDto } from "./dtos/register.dto";
import { Response } from "express";

@Controller("register")
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}
  @Post()
  async register(@Body() registerBody: RegisterDto, @Res() res: Response) {
    const { token, data } = await this.registerService.register(registerBody);
    res.status(201);
    res.cookie("token", token);
    res.json(data);
  }
}
