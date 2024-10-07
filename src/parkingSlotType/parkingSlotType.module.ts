import { TypeOrmModule } from "@nestjs/typeorm";
import { ParkingSlotType } from "./parkingSlotType.entity";
import { ParkingSlotTypeService } from "./parkingSlotType.service";
import { Module } from "@nestjs/common";
import { ParkingSlotTypeController } from "./parkingSlotType.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ParkingSlotType])],
  providers: [ParkingSlotTypeService],
  controllers: [ParkingSlotTypeController],
  exports: [ParkingSlotTypeService],
})
export class ParkingSlotTypeModule {}
