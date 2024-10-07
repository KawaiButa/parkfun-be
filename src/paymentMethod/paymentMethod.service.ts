import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentMethod } from "./paymentMethod.entity";
import { Repository } from "typeorm";

@Injectable()
export class PaymentMethodService {
  constructor(@InjectRepository(PaymentMethod) private paymentMethodRepository: Repository<PaymentMethod>) {}

  async get(id: number): Promise<PaymentMethod> {
    return await this.paymentMethodRepository.findOne({ where: { id } });
  }

  async getBy(param: Partial<PaymentMethod>): Promise<PaymentMethod> {
    return await this.paymentMethodRepository.findOne({ where: param });
  }

  async getAll(): Promise<PaymentMethod[]> {
    return await this.paymentMethodRepository.find();
  }
}
