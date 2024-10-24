import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BookingService } from "src/booking/booking.service";
import { UserService } from "src/user/user.service";
import Stripe from "stripe";
import { Booking, BookingStatus } from "src/booking/booking.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentRecord, PaymentRecordStatus } from "../paymentRecord/paymentRecord.entity";
import { Repository } from "typeorm";
import { SchedulerRegistry } from "@nestjs/schedule";
import * as dayjs from "dayjs";
import { ParkingSlotService } from "src/parkingSlot/parkingSlot.service";
import { MailService } from "src/mail/mail.service";
import { BookingDto } from "./dtos/booking.dto";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
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
    private schedulerRegistry: SchedulerRegistry,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    this.schedulerRegistry.addTimeout(
      "" + booking.id + "_pending",
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
    this.cacheManager.set(customerId, booking.id, { ttl: 5 * 60 } as any);
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
              currency: this.configService.get("STRIPE_CURRENCY"),
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
        payment_intent_data: {
          capture_method: "manual",
          description: `Booking for ${booking.parkingSlot.name} from ${dayjs(booking.startAt).format("YYYY-MM-DD HH:mm A")} to ${dayjs(booking.endAt).format("YYYY-MM-DD HH:mm A")}`,
        },
      }),
      booking,
    };
  }
  async booking(bookingDto: BookingDto, userId: number) {
    try {
      const { parkingSlotId } = bookingDto;
      this.schedulerRegistry.getTimeout(`${parkingSlotId}_${bookingDto.startAt}_pending`);
    } catch (e) {
      if (e instanceof ConflictException) throw e;
    }
    const booking = await this.bookingService.create(bookingDto, userId);
    const { session } = await this.charge(booking);
    return { clientSecret: session.client_secret };
  }
  async completePayment(event: Stripe.ChargeSucceededEvent) {
    //Check if the user is booking the same parking slot
    const bookingId = (await this.cacheManager.get(event.data.object.customer as string)) as number;
    if (!bookingId) {
      throw new NotFoundException("Invalid session ID");
    }
    this.cacheManager.del(event.data.object.customer as string);
    const booking = await this.bookingService.getOne(bookingId);
    const parkingSlot = booking.parkingSlot;
    const paymentIndent = event.data.object.payment_intent;
    let paymentIndentId;
    if (typeof paymentIndent === "string") paymentIndentId = paymentIndent;
    else paymentIndentId = paymentIndent.id;
    //Change the payment record to hold status
    const paymentRecord = this.paymentRecordRepository.create({
      booking: booking,
      amount: booking.amount + booking.fee,
      isRefunded: event.data.object.refunded,
      receiptUrl: event.data.object.receipt_url,
      transactionId: paymentIndentId,
      status: PaymentRecordStatus.HOLDING,
    });
    await this.paymentRecordRepository.save(paymentRecord);
    //Change the booking to hold status
    await this.bookingService.update(bookingId, {
      status: BookingStatus.HOLDING,
      payment: paymentRecord,
    });
    //Delete pending timeout
    this.schedulerRegistry.deleteTimeout(`${booking.id}_pending`);
    //Start holding timeout - Timeout 30 minutes before booking.
    this.schedulerRegistry.addTimeout(
      `${booking.id}_holding`,
      setTimeout(
        () => {
          this.bookingService.update(booking.id, { status: BookingStatus.CANCELLED });
        },
        this.getMillisecondsBetweenDates(new Date(), dayjs(booking.startAt).subtract(30, "minutes").toDate())
      )
    );
    await this.mailService.sendBookingRequest(booking, parkingSlot.parkingLocation.partner);
    return booking;
  }
  async refund(paymentRecordId: number) {
    const paymentRecord = await this.paymentRecordRepository.findOne({ where: { id: paymentRecordId } });
    if (!paymentRecord) throw new NotFoundException("Payment record not found");
    if (paymentRecord.status === PaymentRecordStatus.CAPTURED) throw new ForbiddenException("Payment already captured");
    if (paymentRecord.isRefunded) throw new ForbiddenException("Payment already refunded");
    const refund = await this.stripe.paymentIntents.cancel(paymentRecord.transactionId);
    paymentRecord.isRefunded = true;
    await this.paymentRecordRepository.update(paymentRecordId, {
      isRefunded: true,
      status: PaymentRecordStatus.REFUNDED,
    });
    return refund;
  }

  async capture(paymentRecordId: number) {
    const paymentRecord = await this.paymentRecordRepository.findOne({
      where: { id: paymentRecordId },
      relations: {
        booking: {
          user: true,
          parkingSlot: {
            parkingLocation: {
              partner: true,
            },
          },
          services: true,
        },
      },
    });
    if (!paymentRecord) throw new NotFoundException("Payment record not found");
    if (paymentRecord.status === PaymentRecordStatus.CAPTURED) throw new ForbiddenException("Payment already captured");
    if (paymentRecord.isRefunded) throw new ForbiddenException("Payment already refunded");
    const capture = await this.stripe.paymentIntents.capture(paymentRecord.transactionId);
    paymentRecord.status = PaymentRecordStatus.CAPTURED;
    await this.paymentRecordRepository.update(paymentRecordId, { status: PaymentRecordStatus.CAPTURED });
    this.mailService.sendReceipt(paymentRecord);
    return capture;
  }
  getMillisecondsBetweenDates(date1, date2) {
    const d1 = dayjs(date1);
    const d2 = dayjs(date2);
    return Math.abs(d2.diff(d1));
  }
}
