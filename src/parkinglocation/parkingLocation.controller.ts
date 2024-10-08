import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from "@nestjs/common";
import { ParkingLocationService } from "./parkingLocation.service";
import { CreateParkingLocationDto } from "./dtos/createParkingLocation.dto";
import { UpdateParkingLocationDto } from "./dtos/updateParkingLocation.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("parking-location")
@UseGuards(AuthGuard("jwt"))
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
  findAll() {
    return this.parkingLocationService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.parkingLocationService.findOne(+id);
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
