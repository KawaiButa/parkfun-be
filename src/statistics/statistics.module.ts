import { Module } from "@nestjs/common";
import { ParkingLocationModule } from "src/parkinglocation/parkingLocation.module";
import { UserModule } from "src/user/user.module";
import { StatisticController } from "./statistics.controller";
import { StatisticService } from "./statistics.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "src/booking/booking.entity";
import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import { User } from "src/user/user.entity";
import { Partner } from "src/partner/partner.entity";

@Module({
  imports: [UserModule, ParkingLocationModule, TypeOrmModule.forFeature([User, ParkingLocation, Booking, Partner])],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
