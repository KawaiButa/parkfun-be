import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PricingOption } from "./pricingOption.entity";
import { PricingOptionService } from "./pricingOption.service";

@Module({
  imports: [TypeOrmModule.forFeature([PricingOption])],
  providers: [PricingOptionService],
  exports: [PricingOptionService],
})
export class PricingOptionModule {}
