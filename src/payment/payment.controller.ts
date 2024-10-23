import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
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
import { BookingService } from "src/booking/booking.service";
import { ParkingSlotService } from "src/parkingSlot/parkingSlot.service";
import { BookingStatus } from "src/booking/booking.entity";
@Controller("/payment")
export class PaymentController {
  constructor(
    private paymentRecordService: StripePaymentService,
    private bookingService: BookingService,
    private parkingSlotService: ParkingSlotService
  ) {}
  @Post()
  @UseGuards(AuthGuard("jwt"), RolesGuard("user", "admin"))
  book(@Body() bookingDto: BookingDto, @Req() request: Request & { user: { id: number; role: string } }) {
    const { user } = request;
    if (!user) {
      throw new UnauthorizedException("You are not logged in");
    }
    return this.paymentRecordService.booking(bookingDto, user.id);
  }
  @Post("/webhook")
  async handleEvent(@Headers("stripe-signature") signature: string, @Req() request: Request) {
    if (!signature) {
      throw new BadRequestException("Missing stripe-signature header");
    }
    const event = request.body as unknown as Stripe.Event;
    if (event.type === "charge.succeeded") return this.paymentRecordService.complete(event);

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
