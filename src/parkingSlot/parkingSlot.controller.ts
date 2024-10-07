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
  async create(@Body() createParkingSlotDto: CreateParkingSlotDto, @Req() request: Request & { user: User }) {
    const { user } = request;
    if (!user.partner) return await this.parkingSlotService.create(createParkingSlotDto);
    return await this.parkingSlotService.create(createParkingSlotDto, user.partner.id);
  }

  @Get()
  async findAll(@Req() request: Request & { user: User }) {
    const { user } = request;
    if (!user.partner) return await this.parkingSlotService.findAll();
    return await this.parkingSlotService.findAll(user.partner.id);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.parkingSlotService.findOne(+id);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return await this.parkingSlotService.remove(+id);
  }
}
