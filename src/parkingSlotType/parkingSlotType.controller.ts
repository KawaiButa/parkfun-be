import { Controller, Get } from "@nestjs/common";
import { ParkingSlotTypeService } from "./parkingSlotType.service";

@Controller("parking-slot-type")
export class ParkingSlotTypeController {
  constructor(private parkingSlotTypeService: ParkingSlotTypeService) {}

  @Get()
  async getAll() {
    return await this.parkingSlotTypeService.getAll();
  }
}
