import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Query } from "@nestjs/common";
import { ParkingSlotService } from "./parkingSlot.service";
import { CreateParkingSlotDto } from "./dtos/createParkingSlot.dto";
import { AuthGuard } from "@nestjs/passport";
import RolesGuard from "src/role/role.guard";
import { User } from "src/user/user.entity";
import { PageOptionsDto } from "src/utils/dtos/pageOption.dto";

@Controller("parking-slot")
export class ParkingSlotController {
  constructor(private readonly parkingSlotService: ParkingSlotService) {}

  @Post()
  @UseGuards(RolesGuard("admin", "partner"))
  create(@Body() createParkingSlotDto: CreateParkingSlotDto, @Req() request: Request & { user: User }) {
    const { user } = request;
    if (!user.partner) return this.parkingSlotService.create(createParkingSlotDto);
    return this.parkingSlotService.create(createParkingSlotDto, user.partner.id);
  }

  @Get()
  @UseGuards(RolesGuard())
  findAll(@Req() request: Request & { user: User }, @Query() pageQuery: PageOptionsDto) {
    const { user } = request;
    if (!user || !user.partner) return this.parkingSlotService.findAll(pageQuery);
    return this.parkingSlotService.findAll(pageQuery, user.partner.id);
  }

  @Get(":id")
  @UseGuards(RolesGuard())
  findOne(@Param("id") id: string) {
    return this.parkingSlotService.findOne(+id);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard("admin", "partner"))
  remove(@Param("id") id: string) {
    return this.parkingSlotService.remove(+id);
  }
}
