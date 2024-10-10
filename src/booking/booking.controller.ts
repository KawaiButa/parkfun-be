import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { BookingService } from "./book.service";
import { CreateBookingDto } from "./dtos/createBookingDto";
import { AuthGuard } from "@nestjs/passport";
import RolesGuard from "src/role/role.guard";

@Controller("booking")
@UseGuards(AuthGuard("jwt"), RolesGuard("admin", "partner", "user"))
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }
}
