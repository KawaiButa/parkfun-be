import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BookingService } from "src/booking/booking.service";
import { UserService } from "src/user/user.service";
import Stripe from "stripe";
import { Booking, BookingStatus } from "src/booking/booking.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentRecord } from "../paymentRecord/paymentRecord.entity";
import { Repository } from "typeorm";
import { SchedulerRegistry } from "@nestjs/schedule";
import * as dayjs from "dayjs";
import { ParkingSlotService } from "src/parkingSlot/parkingSlot.service";
import { MailService } from "src/mail/mail.service";
@Injectable()
export default class StripePaymentService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(PaymentRecord)
    private paymentRecordRepository: Repository<PaymentRecord>,
    private configService: ConfigService,
    private userService: UserService,
    private bookingService: BookingService,
    private parkingSlotService: ParkingSlotService,
    private scheduleRegistry: SchedulerRegistry,
    private mailService: MailService
  ) {
    this.stripe = new Stripe(configService.get("STRIPE_SECRET_KEY"));
  }
  async createCustomer(name: string, email: string) {
    return this.stripe.customers.create({
      name,
      email,
    });
  }
  async charge(booking: Booking) {
    this.scheduleRegistry.addTimeout(
      "" + booking.parkingSlot.id + "_pending",
      setTimeout(
        () => {
          this.bookingService.update(booking.id, { status: BookingStatus.CANCELLED });
          this.parkingSlotService.update(booking.parkingSlot.id, { isAvailable: true });
        },
        this.getMillisecondsBetweenDates(new Date(), dayjs().add(15, "minutes"))
      )
    );
    const { user } = booking;
    if (!user) throw new NotFoundException("You are not logged in");
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.createCustomer(user.name, user.email);
      await this.userService.update(user.id, { stripeCustomerId: customer.id });
      customerId = customer.id;
    }
    return {
      session: await this.stripe.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "parkfun-booking",
              },
              unit_amount: Math.round((booking.amount + booking.fee) * 100),
            },
            quantity: 1,
          },
        ],
        customer: customerId,
        mode: "payment",
        return_url: `${this.configService.get("FRONTEND_URL")}/home/payment/${booking.id}`,
      }),
      booking,
    };
  }

  async complete(bookingId: number, event: Stripe.ChargeSucceededEvent) {
    const booking = await this.bookingService.getOne(bookingId);
    const parkingSlot = booking.parkingSlot;
    const paymentRecord = this.paymentRecordRepository.create({
      booking: booking,
      amount: booking.amount,
      isRefunded: event.data.object.refunded,
      receiptUrl: event.data.object.receipt_url,
      transactionId: event.data.object.id,
    });
    await this.paymentRecordRepository.save(paymentRecord);
    await this.bookingService.update(bookingId, {
      status: BookingStatus.COMPLETED,
      payment: paymentRecord,
    });
    this.scheduleRegistry.deleteTimeout(`${parkingSlot.id}_pending`);
    this.scheduleRegistry.addTimeout(
      `${booking.id}_start`,
      setTimeout(
        () => {
          this.parkingSlotService.update(booking.parkingSlot.id, {
            isAvailable: false,
          });
        },
        this.getMillisecondsBetweenDates(new Date(), booking.startAt)
      )
    );
    this.scheduleRegistry.addTimeout(
      `${booking.id}_end`,
      setTimeout(
        () => {
          this.parkingSlotService.update(booking.parkingSlot.id, {
            isAvailable: true,
          });
        },
        this.getMillisecondsBetweenDates(new Date(), booking.endAt)
      )
    );
    await this.mailService.sendReceipt(paymentRecord);
    return booking;
  }
  getMillisecondsBetweenDates(date1, date2) {
    const d1 = dayjs(date1);
    const d2 = dayjs(date2);
    return Math.abs(d2.diff(d1));
  }
}
