import { TypeOrmModule } from "@nestjs/typeorm";
import { ParkingSlotType } from "./parkingSlotType.entity";
import { ParkingSlotTypeService } from "./parkingSlotType.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [TypeOrmModule.forFeature([ParkingSlotType])],
  providers: [ParkingSlotTypeService],
  exports: [ParkingSlotTypeService],
})
export class ParkingSlotTypeModule {}
