import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { PartnerService } from "./partner.service";
import { CreatePartnerDto } from "./dto/createPartner.dto";
import { UpdatePartnerDto } from "./dto/updatePartner.dto";

@Controller("partner")
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  async create(@Body() createPartnerDto: CreatePartnerDto) {
    return await this.partnerService.create(createPartnerDto);
  }

  @Get()
  async findAll() {
    return await this.partnerService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    return await this.partnerService.findOneById(id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updatePartnerDto: UpdatePartnerDto) {
    return await this.partnerService.update(+id, updatePartnerDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Query("deleteUser") deleteUser: boolean) {
    return await this.partnerService.remove(+id, deleteUser);
  }
}
