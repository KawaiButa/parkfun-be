import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from "@nestjs/common";
import { PartnerService } from "./partner.service";
import { CreatePartnerDto } from "./dto/createPartner.dto";
import { UpdatePartnerDto } from "./dto/updatePartner.dto";
import { PageOptionsDto } from "src/utils/dtos/pageOption.dto";
import RolesGuard from "src/role/role.guard";
import { SearchPartnerDto } from "./dto/searchPartner.dto";

@Controller("partner")
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  @UseGuards(RolesGuard("admin"))
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnerService.create(createPartnerDto);
  }

  @Get()
  // @UseGuards(RolesGuard("admin"))
  findAll(@Query() pageOptionsDto: PageOptionsDto, @Query() searchPartnerDto: SearchPartnerDto) {
    return this.partnerService.findAll(searchPartnerDto, pageOptionsDto);
  }

  @Get(":id")
  findOne(@Param("id") id: number) {
    return this.partnerService.findOneById(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updatePartnerDto: UpdatePartnerDto) {
    return this.partnerService.update(+id, updatePartnerDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard("admin"))
  remove(@Param("id") id: string) {
    return this.partnerService.delete(+id);
  }
}
