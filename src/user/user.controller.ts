import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "./dtos/createUser.dto";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dtos/updateUser.dto";
import { AuthGuard } from "@nestjs/passport";
import RolesGuard from "src/role/role.guard";
@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  @UseGuards(AuthGuard("jwt"), RolesGuard("admin"))
  getAll() {
    return this.userService.getAll();
  }

  @Get("/debug-sentry")
  getError() {
    throw new Error("My first Sentry error!");
  }

  @Get(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard())
  getBy(@Param("id") id: number) {
    return this.userService.getOne(id);
  }
  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Patch(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard())
  update(@Param("id") id: number, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard("admin"))
  delete(@Param("id") id: number) {
    this.userService.delete(id);
  }
}
