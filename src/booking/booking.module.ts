import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "./booking.entity";
import { BookingService } from "./booking.service";
import { UserModule } from "src/user/user.module";
import { ParkingSlotModule } from "src/parkingSlot/parkingSlot.module";
import { ParkingServiceModule } from "src/parkingService/parkingService.module";

@Module({
  imports: [UserModule, ParkingSlotModule, ParkingServiceModule, TypeOrmModule.forFeature([Booking])],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
