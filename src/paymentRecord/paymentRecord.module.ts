import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import StripePaymentService from "./stripe.service";
import { UserModule } from "src/user/user.module";
import { PaymentRecordController } from "./paymentRecord.controller";
import { BookingModule } from "src/booking/booking.module";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [ConfigModule, UserModule, BookingModule, CacheModule.register()],
  providers: [StripePaymentService],
  controllers: [PaymentRecordController],
  exports: [StripePaymentService],
})
export class PaymentRecordModule {}
