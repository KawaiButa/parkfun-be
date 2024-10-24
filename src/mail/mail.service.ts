import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { User } from "./../user/user.entity";
import { ConfigService } from "@nestjs/config";
import * as dayjs from "dayjs";
import { PaymentRecord } from "src/paymentRecord/paymentRecord.entity";
import { Booking } from "src/booking/booking.entity";
import { Partner } from "src/partner/partner.entity";
@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService
  ) {}
  async sendUserConfirmation(user: User, token: string, password?: string) {
    const url = `${this.configService.get("FRONTEND_URL")}/verify?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: "Welcome to Nice App! Confirm your Email",
      template: "./mailConfirmation",
      context: {
        name: user.name,
        url,
        email: user.email,
        password,
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
        parkingSlot: booking.parkingSlot.id + " - " + booking.parkingSlot.name,
        price: booking.amount,
        fee: booking.fee,
        total: booking.amount + booking.fee,
        services: booking.services.map(({ name, description }) => ({ name, description, price: 0 })),
        receiptUrl: paymentRecord.receiptUrl,
        paymentUrl: `${this.configService.get("FRONTEND_URL")}/payment/${paymentRecord.id}`,
        startTime: dayjs(booking.startAt).format("DD-MM-YYYY HH:mm A"),
        endTime: dayjs(booking.endAt).format("DD-MM-YYYY HH:mm A"),
      },
    });
  }
  async sendBookingRequest(booking: Booking, partner: Partner) {
    const user = booking.user;
    await this.mailerService.sendMail({
      to: partner.user.email,
      subject: "Request for booking location " + booking.parkingSlot.parkingLocation.name,
      template: "./bookingRequest",
      context: {
        user,
        partnerName: partner.user.name,
        location: booking.parkingSlot.parkingLocation.name + " - " + booking.parkingSlot.name,
        bookingDate: dayjs(booking.createAt).format("DD-MM-YYYY HH:mm A"),
        services: booking.services.map(({ name, description }) => ({ name, description, price: 0 })),
        startTime: dayjs(booking.startAt).format("DD-MM-YYYY HH:mm A"),
        endTime: dayjs(booking.endAt).format("DD-MM-YYYY HH:mm A"),
        processingUrl: `${this.configService.get("FRONTEND_URL")}/partner/booking/${booking.id}`,
      },
    });
  }
  async sendBookingConfirm(booking: Booking) {
    const user = booking.user;
    await this.mailerService.sendMail({
      to: user.email,
      subject: "Booking confirmed for " + booking.parkingSlot.parkingLocation.name,
      template: "./bookingConfirm",
      context: {
        user,
        bookingId: booking.id,
        partnerName: booking.parkingSlot.parkingLocation.partner.user.name,
        parkingLocation: booking.parkingSlot.parkingLocation.name,
        parkingSlot: booking.parkingSlot.id + " - " + booking.parkingSlot.name,
        bookingUrl: `${this.configService.get("FRONTEND_URL")}/booking/${booking.id}`,
        bookingDate: dayjs(booking.createAt).format("DD-MM-YYYY HH:mm A"),
        services: booking.services.map(({ name, description }) => ({ name, description, price: 0 })),
        startTime: dayjs(booking.startAt).format("DD-MM-YYYY HH:mm A"),
        endTime: dayjs(booking.endAt).format("DD-MM-YYYY HH:mm A"),
      },
    });
  }
  async sendBookingReject(booking: Booking) {
    const user = booking.user;
    await this.mailerService.sendMail({
      to: user.email,
      subject: "Booking rejected for " + booking.parkingSlot.parkingLocation.name,
      template: "./bookingReject",
      context: {
        user,
        bookingId: booking.id,
        parkingLocation: booking.parkingSlot.parkingLocation.name,
        parkingSlot: booking.parkingSlot.id + " - " + booking.parkingSlot.name,
        bookingDate: dayjs(booking.createAt).format("DD-MM-YYYY HH:mm A"),
        services: booking.services.map(({ name, description }) => ({ name, description, price: 0 })),
        startTime: dayjs(booking.startAt).format("DD-MM-YYYY HH:mm A"),
        endTime: dayjs(booking.endAt).format("DD-MM-YYYY HH:mm A"),
      },
    });
  }

  async sendCompleteBookingRequest(booking: Booking) {
    const user = booking.user;
    await this.mailerService.sendMail({
      to: booking.parkingSlot.parkingLocation.partner.user.email,
      subject: "Checkout request for " + booking.parkingSlot.parkingLocation.name,
      template: "./completeBookingRequest",
      context: {
        user,
        bookingId: booking.id,
        parkingLocation: booking.parkingSlot.parkingLocation.name,
        parkingSlot: booking.parkingSlot.id + " - " + booking.parkingSlot.name,
        bookingDate: dayjs(booking.createAt).format("DD-MM-YYYY HH:mm A"),
        services: booking.services.map(({ name, description }) => ({ name, description, price: 0 })),
        startTime: dayjs(booking.startAt).format("DD-MM-YYYY HH:mm A"),
        endTime: dayjs(booking.endAt).format("DD-MM-YYYY HH:mm A"),
        proccessUrl: `${this.configService.get("FRONTEND_URL")}/partner/booking/${booking.id}`,
      },
    });
  }
}
