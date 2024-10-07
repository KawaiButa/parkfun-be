import { Controller, Get } from "@nestjs/common";
import { PricingOptionService } from "./pricingOption.service";

@Controller("pricing-option")
export class PricingOptionController {
  constructor(private pricingOptionService: PricingOptionService) {}

  @Get()
  async getAll() {
    return await this.pricingOptionService.getAll();
  }
}
