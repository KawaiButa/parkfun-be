import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BookingService } from "src/booking/booking.service";
import { UserService } from "src/user/user.service";
import Stripe from "stripe";
import { BookingDto } from "./dtos/booking.dto";
import { BookingStatus } from "src/booking/booking.entity";
@Injectable()
export default class StripePaymentService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private bookingService: BookingService
  ) {
    this.stripe = new Stripe(configService.get("STRIPE_SECRET_KEY"));
  }
  async createCustomer(name: string, email: string) {
    return this.stripe.customers.create({
      name,
      email,
    });
  }
  async charge(bookingDto: BookingDto, userId: number) {
    const booking = await this.bookingService.create(bookingDto, userId);
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
              unit_amount: booking.amount * 100,
            },
            quantity: 1,
          },
        ],
        customer: customerId,
        mode: "payment",
        return_url: `${this.configService.get("FRONTEND_URL")}/home/map`,
      }),
      booking,
    };
  }
  async complete(bookingId: number) {
    const booking = await this.bookingService.update(bookingId, {
      status: BookingStatus.COMPLETED,
    });
    return booking;
  }
}
