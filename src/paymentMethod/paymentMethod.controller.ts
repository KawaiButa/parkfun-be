import { Controller, Get } from "@nestjs/common";
import { PaymentMethodService } from "./paymentMethod.service";

@Controller("payment-method")
export class PaymentMethodController {
  constructor(private paymentService: PaymentMethodService) {}

  @Get()
  async getAll() {
    return await this.paymentService.getAll();
  }
}
