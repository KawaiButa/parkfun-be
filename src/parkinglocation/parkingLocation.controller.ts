import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Req, Query } from "@nestjs/common";
import { ParkingLocationService } from "./parkingLocation.service";
import { CreateParkingLocationDto } from "./dtos/createParkingLocation.dto";
import { UpdateParkingLocationDto } from "./dtos/updateParkingLocation.dto";
import RolesGuard from "src/role/role.guard";
import { User } from "src/user/user.entity";
import { SearchParkingLocationDto } from "./dtos/searchParkingLocation.dto";
import { PageOptionsDto } from "src/utils/dtos/pageOption.dto";
import { Partner } from "src/partner/partner.entity";

@Controller("parking-location")
export class ParkingLocationController {
  constructor(private readonly parkingLocationService: ParkingLocationService) {}

  @Post()
  @UseGuards(RolesGuard("admin", "partner"))
  create(
    @Body() createParkingLocationDto: CreateParkingLocationDto,
    @Request() { user }: Request & { user: { id: number; role: string } }
  ) {
    return this.parkingLocationService.create(user.id, createParkingLocationDto);
  }
  @Get()
  @UseGuards(RolesGuard())
  findAll(
    @Req() request: Request & { user: { role: string; id: number; partner: Partner } },
    @Query() searchQuery: SearchParkingLocationDto,
    @Query() pageOptionsDto: PageOptionsDto
  ) {
    const { user } = request;
    if (!user || user.role === "user") return this.parkingLocationService.search(searchQuery, pageOptionsDto);
    if (!user.partner) return this.parkingLocationService.findAll({ searchDto: searchQuery, pageOptionsDto });
    return this.parkingLocationService.findAll({
      searchDto: searchQuery,
      pageOptionsDto,
      partnerId: user.partner.id,
    });
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
  @UseGuards(RolesGuard("admin", "partner"))
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
