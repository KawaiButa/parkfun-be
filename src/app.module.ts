import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "@hapi/joi";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { PartnerModule } from "./partner/partner.module";
import { ParkingLocationModule } from "./parkinglocation/parkingLocation.module";
import { PartnerTypeModule } from "./partnerType/partnerType.module";
import { RoleModule } from "./role/role.module";
import { ParkingSlotModule } from "./parkingSlot/parkingSlot.module";
import { ParkingServiceModule } from "./parkingService/parkingService.module";
import { PaymentMethodModule } from "./paymentMethod/paymentMethod.module";
import { PricingOptionModule } from "./pricingOption/pricingOption.module";
import { BookingModule } from "./booking/booking.module";
import { PaymentModule } from "./payment/payment.module";
import { PaymentRecordModule } from "./paymentRecord/paymentRecord.module";
import { StatisticModule } from "./statistics/statistics.module";
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PORT: Joi.number(),
        IS_PRODUCTION: Joi.boolean().required(),
        STRIPE_SECRET_KEY: Joi.string(),
        STRIPE_CURRENCY: Joi.string(),
        FRONTEND_URL: Joi.string(),
        STRIPE_WEBHOOK_SECRET: Joi.string(),
      }),
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    PartnerModule,
    ParkingLocationModule,
    RoleModule,
    PartnerTypeModule,
    ParkingSlotModule,
    ParkingServiceModule,
    PaymentMethodModule,
    PricingOptionModule,
    BookingModule,
    PaymentRecordModule,
    PaymentModule,
    StatisticModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
