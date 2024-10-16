import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentRecord } from "./paymentRecord.entity";
import { Module } from "@nestjs/common";
import { PaymentRecordController } from "./paymentRecord.controller";
import { PaymentRecordService } from "./paymenRecord.service";

@Module({
  imports: [TypeOrmModule.forFeature([PaymentRecord])],
  controllers: [PaymentRecordController],
  providers: [PaymentRecordService],
})
export class PaymentRecordModule {}
