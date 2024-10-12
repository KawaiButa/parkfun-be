import { Controller, Get, Query } from "@nestjs/common";
import { PartnerTypeService } from "./partnerType.service";
import { PageOptionsDto } from "src/utils/dtos/pageOption.dto";

@Controller("partner-type")
export class PartnerTypeController {
  constructor(private readonly partnerTypeService: PartnerTypeService) {}
  @Get()
  getAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.partnerTypeService.getAll(pageOptionsDto);
  }
}
