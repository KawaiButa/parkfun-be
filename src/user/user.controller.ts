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
  async getAll() {
    return await this.userService.getAll();
  }

  @Get(":id")
  async getBy(@Param("id") id: number) {
    return await this.userService.getOne(id);
  }
  @Post()
  async create(@Body() body: CreateUserDto) {
    return await this.userService.create(body);
  }

  @Patch(":id")
  async update(@Param("id") id: number, @Body() body: UpdateUserDto) {
    return await this.userService.update(id, body);
  }

  @Delete(":id")
  async delete(@Param("id") id: number) {
    await this.userService.delete(id);
  }
}
