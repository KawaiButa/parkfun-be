import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { User } from "./../user/user.entity";
import { ConfigService } from "@nestjs/config";
import * as dayjs from "dayjs";
import { PaymentRecord } from "src/paymentRecord/paymentRecord.entity";

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService
  ) {}
  async sendUserConfirmation(user: User, token: string) {
    const url = `${this.configService.get("FRONTEND_URL")}/verify?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: "Welcome to Nice App! Confirm your Email",
      template: "./mailConfirmation",
      context: {
        name: user.name,
        url,
      },
    });
  }
  async sendReceipt(paymentRecord: PaymentRecord) {
    const booking = paymentRecord.booking;
    const user = booking.user;
    await this.mailerService.sendMail({
      to: booking.user.email,
      subject: "Receipt for booking " + booking.id,
      template: "./paymentReceipt",
      context: {
        name: user.name,
        parkingLocation: booking.parkingSlot.parkingLocation.name,
        parkingSlot: booking.parkingSlot.name,
        price: booking.amount,
        fee: booking.fee,
        total: booking.amount + booking.fee,
        services: booking.services.map(({ name }) => ({ name, price: 0 })),
        receiptUrl: paymentRecord.receiptUrl,
        paymentUrl: `${this.configService.get("FRONTEND_URL")}/payment/${paymentRecord.id}`,
        startTime: dayjs(booking.startAt).format("dd-MM-YYYYY HH:mm a"),
        endTime: dayjs(booking.endAt).format("dd-MM-YYYYY HH:mm a"),
      },
    });
  }
}
