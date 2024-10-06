import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ParkingService } from "./parkingSerivce.entity";
import { ParkingSerivceService } from "./parkingService.service";

@Module({
  imports: [TypeOrmModule.forFeature([ParkingService])],
  providers: [ParkingSerivceService],
  exports: [ParkingSerivceService],
})
export class ParkingServiceModule {}
