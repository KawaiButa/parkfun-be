import { Module } from "@nestjs/common";
import { ParkingSlotService } from "./parkingSlot.service";
import { ParkingSlotController } from "./parkingSlot.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ParkingSlot } from "./parkingSlot.entity";
import { ParkingSlotTypeModule } from "src/parkingSlotType/parkingSlotType.module";
import { ImageModule } from "src/image/image.module";
import { ParkingLocationModule } from "src/parkinglocation/parkingLocation.module";

@Module({
  imports: [ParkingSlotTypeModule, ParkingLocationModule, ImageModule, TypeOrmModule.forFeature([ParkingSlot])],
  controllers: [ParkingSlotController],
  providers: [ParkingSlotService],
  exports: [ParkingSlotService],
})
export class ParkingSlotModule {}
