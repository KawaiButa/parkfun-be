import { Controller, Get } from "@nestjs/common";
import { PartnerTypeService } from "./partnerType.service";

@Controller("partner-type")
export class PartnerTypeController {
  constructor(private readonly partnerTypeService: PartnerTypeService) {}
  @Get()
  async getAll() {
    return await this.partnerTypeService.getAll();
  }
}
