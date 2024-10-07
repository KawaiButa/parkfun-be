import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PricingOption } from "./pricingOption.entity";
import { PricingOptionService } from "./pricingOption.service";
import { PricingOptionController } from "./pricingOption.controller";

@Module({
  imports: [TypeOrmModule.forFeature([PricingOption])],
  providers: [PricingOptionService],
  controllers: [PricingOptionController],
  exports: [PricingOptionService],
})
export class PricingOptionModule {}
