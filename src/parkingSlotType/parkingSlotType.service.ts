import { InjectRepository } from "@nestjs/typeorm";
import { ParkingSlotType } from "./parkingSlotType.entity";
import { Repository } from "typeorm";

export class ParkingSlotTypeService {
  constructor(@InjectRepository(ParkingSlotType) private parkingSlotTypeRepository: Repository<ParkingSlotType>) {}

  async getAll() {
    return await this.parkingSlotTypeRepository.find();
  }

  async getOne(id: number) {
    return await this.parkingSlotTypeRepository.findOne({
      where: { id },
    });
  }
}
