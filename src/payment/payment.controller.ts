import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Inject,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { BookingDto } from "./dtos/booking.dto";
import { User } from "src/user/user.entity";
import { AuthGuard } from "@nestjs/passport";
import RolesGuard from "src/role/role.guard";
import StripePaymentService from "./stripe.service";
import Stripe from "stripe";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
@Controller("/payment")
export class PaymentController {
  constructor(
    private paymentRecordService: StripePaymentService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}
  @Post()
  @UseGuards(AuthGuard("jwt"), RolesGuard("user", "admin"))
  async book(@Body() bookingDto: BookingDto, @Req() request: Request & { user: User }) {
    const { user } = request;
    if (!user) {
      throw new UnauthorizedException("You are not logged in");
    }
    const { session, booking } = await this.paymentRecordService.charge(bookingDto, user.id);
    await this.cacheManager.set(session.customer as string, booking.id, {
      ttl: 60 * 60 * 24, // 1 day
    });
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
      return await this.paymentRecordService.complete(bookingId, event);
    }
    return event;
  }
}
