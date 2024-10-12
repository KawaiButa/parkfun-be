import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Req, Query } from "@nestjs/common";
import { ParkingLocationService } from "./parkingLocation.service";
import { CreateParkingLocationDto } from "./dtos/createParkingLocation.dto";
import { UpdateParkingLocationDto } from "./dtos/updateParkingLocation.dto";
import { AuthGuard } from "@nestjs/passport";
import RolesGuard from "src/role/role.guard";
import { User } from "src/user/user.entity";
import { SearchParkingLocationDto } from "./dtos/searchParkingLocation.dto";

@Controller("parking-location")
export class ParkingLocationController {
  constructor(private readonly parkingLocationService: ParkingLocationService) {}

  @Post()
  @UseGuards(AuthGuard("jwt"), RolesGuard("admin", "partner"))
  create(
    @Body() createParkingLocationDto: CreateParkingLocationDto,
    @Request() { user }: Request & { user: { id: number; email: string; role: string } }
  ) {
    return this.parkingLocationService.create(user.id, createParkingLocationDto);
  }
  @Get()
  @UseGuards(RolesGuard())
  findAll(@Req() request: Request & { user: User }, @Query() query: SearchParkingLocationDto) {
    const { user } = request;
    if (!user) return this.parkingLocationService.search(query);
    if (!user.partner) return this.parkingLocationService.findAll();
    return this.parkingLocationService.findAll(user.partner.id);
  }

  @Get(":id")
  @UseGuards(RolesGuard("admin", "partner"))
  findOne(@Param("id") id: string, @Req() request: Request & { user: User }) {
    const { user } = request;
    if (!user) return this.parkingLocationService.findOne(+id);
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
  @UseGuards(RolesGuard("admin", "partner"))
  remove(@Param("id") id: string, @Req() request: Request & { user: User }) {
    const { user } = request;
    if (user.role.name === "admin") return this.parkingLocationService.remove(+id);
    return this.parkingLocationService.remove(+id, user.partner.id);
  }
}
