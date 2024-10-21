import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import StripePaymentService from "./stripe.service";
import { UserModule } from "src/user/user.module";
import { PaymentController } from "./payment.controller";
import { BookingModule } from "src/booking/booking.module";
import { CacheModule } from "@nestjs/cache-manager";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentRecord } from "src/paymentRecord/paymentRecord.entity";
import { ParkingSlotModule } from "src/parkingSlot/parkingSlot.module";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [
    ConfigModule,
    UserModule,
    BookingModule,
    ParkingSlotModule,
    MailModule,
    CacheModule.register(),
    TypeOrmModule.forFeature([PaymentRecord]),
  ],
  providers: [StripePaymentService],
  controllers: [PaymentController],
  exports: [StripePaymentService],
})
export class PaymentModule {}
