import { Controller, Get, Param } from "@nestjs/common";
import { PaymentRecordService } from "./paymenRecord.service";

@Controller("payment-record")
export class PaymentRecordController {
  constructor(private paymentRecordService: PaymentRecordService) {}

  @Get("/:id/")
  getById(@Param("id") id: string) {
    return this.paymentRecordService.getOne(+id);
  }
}
