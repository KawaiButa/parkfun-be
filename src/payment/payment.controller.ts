import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { BookingDto } from "./dtos/booking.dto";
import { AuthGuard } from "@nestjs/passport";
import RolesGuard from "src/role/role.guard";
import StripePaymentService from "./stripe.service";
import Stripe from "stripe";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { BookingService } from "src/booking/booking.service";
import { ParkingSlotService } from "src/parkingSlot/parkingSlot.service";
import { BookingStatus } from "src/booking/booking.entity";
import { SchedulerRegistry } from "@nestjs/schedule";
@Controller("/payment")
export class PaymentController {
  constructor(
    private paymentRecordService: StripePaymentService,
    private bookingService: BookingService,
    private parkingSlotService: ParkingSlotService,
    private schedulerRegistry: SchedulerRegistry,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}
  @Post()
  @UseGuards(AuthGuard("jwt"), RolesGuard("user", "admin"))
  async book(@Body() bookingDto: BookingDto, @Req() request: Request & { user: { id: number; role: string } }) {
    const { user } = request;
    if (!user) {
      throw new UnauthorizedException("You are not logged in");
    }
    try {
      this.schedulerRegistry.getTimeout("" + bookingDto.parkingSlotId + "_pending");
      const booking = await this.bookingService.findOneBy({
        parkingSlot: { id: bookingDto.parkingSlotId },
        user: { id: user.id },
        status: BookingStatus.PENDING,
      });
      if (!booking) throw new ConflictException("Someone else has been booking this slot within your selected time.");
      this.schedulerRegistry.deleteTimeout("" + bookingDto.parkingSlotId + "_pending");
      await this.bookingService.update(booking.id, { status: BookingStatus.CANCELLED });
    } catch (e) {
      if (e instanceof ConflictException) throw e;
    }
    const [booking] = await Promise.all([
      this.bookingService.create(bookingDto, user.id),
      this.parkingSlotService.update(bookingDto.parkingSlotId, {
        isAvailable: false,
      }),
    ]);
    const { session } = await this.paymentRecordService.charge(booking);
    this.cacheManager.set(session.customer, booking.id, { ttl: 5 * 60 } as any);
    return { clientSecret: session.client_secret };
  }
  @Post("/webhook")
  async handleEvent(@Headers("stripe-signature") signature: string, @Req() request: Request) {
    if (!signature) {
      throw new BadRequestException("Missing stripe-signature header");
    }
    const event = request.body as unknown as Stripe.Event;
    if (event.type === "charge.succeeded") {
      const bookingId = (await this.cacheManager.get(event.data.object.customer as string)) as number;
      if (!bookingId) {
        throw new NotFoundException("Invalid session ID");
      }
      this.cacheManager.del(event.data.object.customer as string);
      return this.paymentRecordService.complete(bookingId, event);
    }
    return event;
  }
  @Get("/fee/:parkingSlotId")
  async getFee(@Req() request: Request, @Param("parkingSlotId") parkingSlotId: number) {
    return this.parkingSlotService.calculateFee(parkingSlotId);
  }
  @Get("resume/:bookingId")
  @UseGuards(AuthGuard("jwt"), RolesGuard("user", "admin"))
  async getResume(
    @Param("bookingId") bookingId: number,
    @Req() request: Request & { user: { id: number; role: string } }
  ) {
    const { user } = request;
    if (!user) {
      throw new UnauthorizedException("You are not logged in");
    }

    const booking = await this.bookingService.getOne(bookingId);
    if (booking.status !== BookingStatus.PENDING) throw new ConflictException("The booking is not pending");
    if (booking.user.id !== user.id) throw new ConflictException("You do not have permission to continue this booking");
    return this.paymentRecordService.charge(booking);
  }
}
