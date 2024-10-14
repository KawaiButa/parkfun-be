import { Controller, Get } from "@nestjs/common";
import { ParkingServiceService } from "./parkingService.service";

@Controller("parking-service")
export class ParkingServiceController {
  constructor(private parkingServiceService: ParkingServiceService) {}

  @Get()
  getAll() {
    return this.parkingServiceService.getAll();
  }
}
