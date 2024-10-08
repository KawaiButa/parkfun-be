import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentMethodService } from "./paymentMethod.service";
import { Module } from "@nestjs/common";
import { PaymentMethod } from "./paymentMethod.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod])],
  providers: [PaymentMethodService],
  exports: [PaymentMethodService],
})
export class PaymentMethodModule {}
