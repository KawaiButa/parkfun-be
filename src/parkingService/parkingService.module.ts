import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ParkingService } from "./parkingSerivce.entity";
import { ParkingSerivceService } from "./parkingService.service";
import { ParkingServiceController } from "./parkingService.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ParkingService])],
  providers: [ParkingSerivceService],
  controllers: [ParkingServiceController],
  exports: [ParkingSerivceService],
})
export class ParkingServiceModule {}
