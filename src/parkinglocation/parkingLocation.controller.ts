import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Req } from "@nestjs/common";
import { ParkingLocationService } from "./parkingLocation.service";
import { CreateParkingLocationDto } from "./dtos/createParkingLocation.dto";
import { UpdateParkingLocationDto } from "./dtos/updateParkingLocation.dto";
import { AuthGuard } from "@nestjs/passport";
import RolesGuard from "src/role/role.guard";
import { User } from "src/user/user.entity";

@Controller("parking-location")
@UseGuards(AuthGuard("jwt"), RolesGuard("admin", "partner"))
export class ParkingLocationController {
  constructor(private readonly parkingLocationService: ParkingLocationService) {}

  @Post()
  create(
    @Body() createParkingLocationDto: CreateParkingLocationDto,
    @Request() { user }: Request & { user: { id: number; email: string; role: string } }
  ) {
    return this.parkingLocationService.create(user.id, createParkingLocationDto);
  }

  @Get()
  findAll(@Req() request: Request & { user: User }) {
    const { user } = request;
    if (!user.partner) return this.parkingLocationService.findAll();
    return this.parkingLocationService.findAll(user.partner.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Req() request: Request & { user: User }) {
    const { user } = request;
    if (user.role.name === "admin") return this.parkingLocationService.findOne(+id);
    return this.parkingLocationService.findOne(+id, user.partner.id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateParkingLocationDto: UpdateParkingLocationDto) {
    return this.parkingLocationService.update(+id, {
      ...updateParkingLocationDto,
    });
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.parkingLocationService.remove(+id);
  }
}
