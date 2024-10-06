import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { ParkingSlotService } from "./parkingSlot.service";
import { CreateParkingSlotDto } from "./dtos/createParkingSlot.dto";

@Controller("parking-slot")
export class ParkingSlotController {
  constructor(private readonly parkingSlotService: ParkingSlotService) {}

  @Post()
  create(@Body() createParkingSlotDto: CreateParkingSlotDto) {
    return this.parkingSlotService.create(createParkingSlotDto);
  }

  @Get()
  findAll() {
    return this.parkingSlotService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.parkingSlotService.findOne(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.parkingSlotService.remove(+id);
  }
}
