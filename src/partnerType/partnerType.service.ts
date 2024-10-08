import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PartnerType } from "./partnerType.entity";
import { Repository } from "typeorm";
import { CreatePartnerTypeDto } from "./dto/createPartnerType.dto";

@Injectable()
export class PartnerTypeService {
  constructor(@InjectRepository(PartnerType) private readonly partnerTypeRepository: Repository<PartnerType>) {}

  async get(param: Partial<PartnerType>) {
    return this.partnerTypeRepository.findOne({ where: param });
  }

  async create(createPartnerTypeDto: CreatePartnerTypeDto) {
    return this.partnerTypeRepository.save(this.partnerTypeRepository.create(createPartnerTypeDto));
  }
}
