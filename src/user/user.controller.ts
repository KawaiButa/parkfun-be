import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "./dtos/createUser.dto";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dtos/updateUser.dto";
import { AuthGuard } from "@nestjs/passport";
import RolesGuard from "src/role/role.guard";
@Controller("user")
@UseGuards(AuthGuard("jwt"), RolesGuard("admin"))
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  getAll() {
    return this.userService.getAll();
  }

  @Get(":id")
  getBy(@Param("id") id: number) {
    return this.userService.getOne(id);
  }
  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: number, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }

  @Delete(":id")
  delete(@Param("id") id: number) {
    this.userService.delete(id);
  }
}
