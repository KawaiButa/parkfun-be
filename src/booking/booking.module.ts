import { Module } from "@nestjs/common";
import { BookingController } from "./booking.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "./booking.entity";
import { ParkingSlotModule } from "src/parkingSlot/parkingSlot.module";
import { BookingService } from "./book.service";

@Module({
  imports: [ParkingSlotModule, TypeOrmModule.forFeature([Booking])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
