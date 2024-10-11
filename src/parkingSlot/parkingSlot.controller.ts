import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from "@nestjs/common";
import { ParkingSlotService } from "./parkingSlot.service";
import { CreateParkingSlotDto } from "./dtos/createParkingSlot.dto";
import { AuthGuard } from "@nestjs/passport";
import RolesGuard from "src/role/role.guard";
import { User } from "src/user/user.entity";

@Controller("parking-slot")
@UseGuards(AuthGuard("jwt"), RolesGuard("admin", "partner"))
export class ParkingSlotController {
  constructor(private readonly parkingSlotService: ParkingSlotService) {}

  @Post()
  create(@Body() createParkingSlotDto: CreateParkingSlotDto, @Req() request: Request & { user: User }) {
    const { user } = request;
    if (!user.partner) return this.parkingSlotService.create(createParkingSlotDto);
    return this.parkingSlotService.create(createParkingSlotDto, user.partner.id);
  }

  @Get()
  findAll(@Req() request: Request & { user: User }) {
    const { user } = request;
    if (!user.partner) return this.parkingSlotService.findAll();
    return this.parkingSlotService.findAll(user.partner.id);
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
