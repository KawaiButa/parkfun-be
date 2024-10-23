import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
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
import { BookingDto } from "./dtos/booking.dto";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { timeToSeconds } from "src/utils/utils";
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
  async booking(bookingDto: BookingDto, userId: number) {
    try {
      const { parkingSlotId, startAt, endAt } = bookingDto;
      this.schedulerRegistry.getTimeout("" + parkingSlotId + "_pending");
      const parkingSlot = await this.parkingSlotService.findOne(parkingSlotId);
      if (!parkingSlot) throw new BadRequestException("No parking slot found");
      if (!(parkingSlot.startAt <= timeToSeconds(dayjs(startAt)) && parkingSlot.endAt >= timeToSeconds(dayjs(endAt))))
        throw new BadRequestException("Your selected time is not within the open time of the parking slot");
      const booking = await this.bookingService.findOneBy({
        parkingSlot: { id: bookingDto.parkingSlotId },
        user: { id: userId },
        status: BookingStatus.PENDING,
      });
      if (!booking) throw new ConflictException("Someone else has been booking this slot within your selected time.");
      this.schedulerRegistry.deleteTimeout("" + bookingDto.parkingSlotId + "_pending");
      await this.bookingService.update(booking.id, { status: BookingStatus.CANCELLED });
    } catch (e) {
      if (e instanceof ConflictException) throw e;
    }
    const [booking] = await Promise.all([
      this.bookingService.create(bookingDto, userId),
      this.parkingSlotService.update(bookingDto.parkingSlotId, {
        isAvailable: false,
      }),
    ]);
    const { session } = await this.charge(booking);
    this.cacheManager.set(session.customer, booking.id, { ttl: 5 * 60 } as any);
    return { clientSecret: session.client_secret };
  }
  async complete(event: Stripe.ChargeSucceededEvent) {
    const bookingId = (await this.cacheManager.get(event.data.object.customer as string)) as number;
    if (!bookingId) {
      throw new NotFoundException("Invalid session ID");
    }
    this.cacheManager.del(event.data.object.customer as string);
    const booking = await this.bookingService.getOne(bookingId);
    const parkingSlot = booking.parkingSlot;
    const paymentRecord = this.paymentRecordRepository.create({
      booking: booking,
      amount: booking.amount + booking.fee,
      isRefunded: event.data.object.refunded,
      receiptUrl: event.data.object.receipt_url,
      transactionId: event.data.object.id,
    });
    await this.paymentRecordRepository.save(paymentRecord);
    await this.bookingService.update(bookingId, {
      status: BookingStatus.COMPLETED,
      payment: paymentRecord,
    });
    this.schedulerRegistry.deleteTimeout(`${parkingSlot.id}_pending`);
    this.schedulerRegistry.addTimeout(
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
    this.schedulerRegistry.addTimeout(
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
