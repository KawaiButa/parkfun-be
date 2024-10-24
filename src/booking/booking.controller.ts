import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { AuthGuard } from "@nestjs/passport";
import RolesGuard from "src/role/role.guard";
import { SearchBookingDto } from "./dtos/searchBooking.dto";
import { PageOptionsDto } from "src/utils/dtos/pageOption.dto";

@Controller("/booking")
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"), RolesGuard())
  async getBookinngs(
    @Query() searchQuery: SearchBookingDto,
    @Query() pageOptions: PageOptionsDto,
    @Req() request: Request & { user: { id: number; role: string } }
  ) {
    return this.bookingService.getAll(request.user.id, searchQuery, pageOptions);
  }

  @Get("/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard("partner", "user"))
  async getBookingById(@Param("id") id: number) {
    return this.bookingService.getOne(id);
  }
  @Get("/:id/accept")
  @UseGuards(AuthGuard("jwt"), RolesGuard("partner"))
  async acceptBooking(@Param("id") id: number, @Req() request: Request & { user: { id: number; role: string } }) {
    const { user } = request;
    return this.bookingService.acceptBooking(id, user.id);
  }
  @Get("/:id/reject")
  @UseGuards(AuthGuard("jwt"), RolesGuard("partner"))
  async rejectBooking(@Param("id") id: number, @Req() request: Request & { user: { id: number; role: string } }) {
    const { user } = request;
    return this.bookingService.rejectBooking(id, user.id);
  }
  @Get("/:id/complete")
  @UseGuards(AuthGuard("jwt"), RolesGuard("user"))
  async requestComplete(@Param("id") id: number, @Req() request: Request & { user: { id: number; role: string } }) {
    const { user } = request;
    const booking = await this.bookingService.requestComplete(id, user.id);
    return booking;
  }
}
