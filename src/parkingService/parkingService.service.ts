import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ParkingService } from "./parkingSerivce.entity";

export class ParkingSerivceService {
  constructor(@InjectRepository(ParkingService) private parkingSerivceRepository: Repository<ParkingService>) {}

  async getAll() {
    return await this.parkingSerivceRepository.find();
  }

  async getOne(id: number) {
    return await this.parkingSerivceRepository.findOne({
      where: { id },
    });
  }
}
