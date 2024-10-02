import { Injectable } from "@nestjs/common";
import { PricingOption } from "./pricingOption.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class PricingOptionService {
  constructor(@InjectRepository(PricingOption) private pricingOptionRepository: Repository<PricingOption>) {}
  async get(id: number): Promise<PricingOption> {
    return await this.pricingOptionRepository.findOne({ where: { id } });
  }
  async getBy(param: Partial<PricingOption>): Promise<PricingOption> {
    return await this.pricingOptionRepository.findOne({ where: param });
  }
}
