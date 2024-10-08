import { Module } from "@nestjs/common";
import { ParkingLocationService } from "./parkingLocation.service";
import { ParkingLocationController } from "./parkingLocation.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ParkingLocation } from "./parkingLocation.entity";
import { PaymentMethodModule } from "src/paymentMethod/paymentMethod.module";
import { PricingOptionModule } from "src/pricingOption/pricingOption.module";
import { PartnerModule } from "src/partner/partner.module";

@Module({
  imports: [TypeOrmModule.forFeature([ParkingLocation]), PaymentMethodModule, PricingOptionModule, PartnerModule],
  controllers: [ParkingLocationController],
  providers: [ParkingLocationService],
})
export class ParkingLocationModule {}
