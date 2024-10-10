import { Controller, Get } from "@nestjs/common";
import { PricingOptionService } from "./pricingOption.service";

@Controller("pricing-option")
export class PricingOptionController {
  constructor(private pricingOptionService: PricingOptionService) {}

  @Get()
  getAll() {
    return this.pricingOptionService.getAll();
  }
}
