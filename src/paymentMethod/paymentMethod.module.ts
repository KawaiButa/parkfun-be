import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentMethodService } from "./paymentMethod.service";
import { Module } from "@nestjs/common";
import { PaymentMethod } from "./paymentMethod.entity";
import { PaymentMethodController } from "./paymentMethod.controller";

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod])],
  providers: [PaymentMethodService],
  controllers: [PaymentMethodController],
  exports: [PaymentMethodService],
})
export class PaymentMethodModule {}
