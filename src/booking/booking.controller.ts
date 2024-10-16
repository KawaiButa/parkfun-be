import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
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
}
