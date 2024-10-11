import { Controller, Get } from "@nestjs/common";
import { PartnerTypeService } from "./partnerType.service";

@Controller("partner-type")
export class PartnerTypeController {
  constructor(private readonly partnerTypeService: PartnerTypeService) {}
  @Get()
  getAll() {
    return this.partnerTypeService.getAll();
  }
}
