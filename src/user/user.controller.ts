import { Body, Controller, Get, Patch, Request, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dtos/updateUser.dto";
import JwtAuthenticationGuard from "src/auth/jwt.guard";
import { User } from "./user.entity";

@Controller("user")
@UseGuards(JwtAuthenticationGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get("/me")
  async getMe(@Request() request: Request & { user: User }) {
    return request.user;
  }

  @Patch("/me")
  async updateMe(@Body() updateDto: UpdateUserDto, @Request() { user: { id } }: Request & { user: User }) {
    return this.userService.update(id, updateDto);
  }
}
