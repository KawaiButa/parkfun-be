import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentRecord } from "./paymentRecord.entity";
import { Repository } from "typeorm";

@Injectable()
export class PaymentRecordService {
  constructor(@InjectRepository(PaymentRecord) private paymentRecordRepository: Repository<PaymentRecord>) {}

  getOne(id: number) {
    return this.paymentRecordRepository.findOne({
      where: { booking: { id } },
      relations: {
        booking: {
          user: true,
          parkingSlot: true,
          services: true,
          payment: true,
        },
      },
      order: {
        createAt: "DESC",
      },
    });
  }
}
