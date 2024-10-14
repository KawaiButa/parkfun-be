import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ParkingService } from "./parkingService.entity";
import { ParkingServiceController } from "./parkingService.controller";
import { ParkingServiceService } from "./parkingService.service";

@Module({
  imports: [TypeOrmModule.forFeature([ParkingService])],
  providers: [ParkingServiceService],
  controllers: [ParkingServiceController],
  exports: [ParkingServiceService],
})
export class ParkingServiceModule {}
