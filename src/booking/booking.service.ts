import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { Booking, BookingStatus } from "./booking.entity";
import { CreateBookingDto } from "./dtos/createBooking.dto";
import { UserService } from "src/user/user.service";
import { ParkingSlotService } from "src/parkingSlot/parkingSlot.service";
import { ParkingServiceService } from "src/parkingService/parkingService.service";
import { InjectRepository } from "@nestjs/typeorm";
import { addSecondsToToday } from "src/utils/utils";

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private userService: UserService,
    private parkingSlotService: ParkingSlotService,
    private parkingServiceService: ParkingServiceService
  ) {}

  async getOne(id: number) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: {
        user: true,
        parkingSlot: true,
        services: true,
      },
    });
    if (!booking) throw new NotFoundException("Cannot find the booking with id " + id);
    return booking;
  }
  async create(createBookingDto: CreateBookingDto, userId: number) {
    const { parkingSlotId, serviceIds, startAt, endAt } = createBookingDto;
    const [user, parkingSlot, services] = await Promise.all([
      this.userService.getOne(userId),
      this.parkingSlotService.findOne(parkingSlotId),
      Promise.all(serviceIds.map(async (serviceId) => this.parkingServiceService.getOne(serviceId))),
    ]);
    if (!user) throw new NotFoundException("User not found");
    if (!parkingSlot) throw new NotFoundException("Parking slot not found");
    const booking = this.bookingRepository.create({
      ...createBookingDto,
      user,
      parkingSlot,
      services,
      startAt: addSecondsToToday(startAt),
      endAt: addSecondsToToday(endAt),
      status: BookingStatus.PENDING,
    });
    return await this.bookingRepository.save(booking);
  }
  async update(bookingId: number, data: Partial<Omit<Booking, "id">>) {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException("Cannot find the booking");
    await this.bookingRepository.update(bookingId, data);
    return await this.bookingRepository.findOne({ where: { id: bookingId } });
  }
}
