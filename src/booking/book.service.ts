import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Booking, BookingStatus } from "./booking.entity";
import { CreateBookingDto } from "./dtos/createBookingDto";
import { ParkingSlotService } from "src/parkingSlot/parkingSlot.service";

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly parkingSlotService: ParkingSlotService
  ) {}

  async create(bookingRequest: CreateBookingDto): Promise<Booking> {
    const { services, parkingSlotId } = bookingRequest;
    const parkingSlot = await this.parkingSlotService.findOne(parkingSlotId);
    const serviceEntity = parkingSlot.services.filter(({ id }) => services.includes(id));
    const bookingEntity = this.bookingRepository.create({
      ...bookingRequest,
      services: serviceEntity,
      parkingSlot,
      status: BookingStatus.PENDING_PAYMENT,
    });
    return await this.bookingRepository.save(bookingEntity);
  }
}
