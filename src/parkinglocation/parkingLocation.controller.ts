import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { ParkingLocationService } from "./parkingLocation.service";
import { CreateParkingLocationDto } from "./dtos/createParkingLocation.dto";
import { UpdateParkingLocationDto } from "./dtos/updateParkingLocation.dto";

@Controller("parking-location")
export class ParkingLocationController {
  constructor(private readonly parkingLocationService: ParkingLocationService) {}

  @Post()
  create(@Body() createParkingLocationDto: CreateParkingLocationDto) {
    return this.parkingLocationService.create(createParkingLocationDto);
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
    return this.parkingLocationService.update(+id, updateParkingLocationDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.parkingLocationService.remove(+id);
  }
}
