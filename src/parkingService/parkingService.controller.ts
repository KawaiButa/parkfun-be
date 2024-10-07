import { Controller, Get } from "@nestjs/common";
import { ParkingSerivceService } from "./parkingService.service";

@Controller("parking-service")
export class ParkingServiceController {
  constructor(private parkingServiceService: ParkingSerivceService) {}

  @Get()
  async getAll() {
    return await this.parkingServiceService.getAll();
  }
}
