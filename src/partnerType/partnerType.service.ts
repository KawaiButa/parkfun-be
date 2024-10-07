import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PartnerType } from "./partnerType.entity";
import { Repository } from "typeorm";

@Injectable()
export class PartnerTypeService {
  constructor(@InjectRepository(PartnerType) private readonly partnerTypeRepository: Repository<PartnerType>) {}

  async get(param: Partial<PartnerType>) {
    return this.partnerTypeRepository.findOne({ where: param });
  }
  async getAll() {
    return await this.partnerTypeRepository.find();
  }
}
