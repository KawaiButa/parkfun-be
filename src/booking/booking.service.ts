import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FindOptionsWhere, Repository } from "typeorm";
import { Booking, BookingStatus } from "./booking.entity";
import { CreateBookingDto } from "./dtos/createBooking.dto";
import { UserService } from "src/user/user.service";
import { ParkingSlotService } from "src/parkingSlot/parkingSlot.service";
import { ParkingServiceService } from "src/parkingService/parkingService.service";
import { InjectRepository } from "@nestjs/typeorm";
import { PageOptionsDto } from "src/utils/dtos/pageOption.dto";
import { PageMetaDto } from "src/utils/dtos/pageMeta.dto";
import { PageDto } from "src/utils/dtos/page.dto";
import { SearchBookingDto } from "./dtos/searchBooking.dto";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import * as dayjs from "dayjs";

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private userService: UserService,
    private parkingSlotService: ParkingSlotService,
    private parkingServiceService: ParkingServiceService
  ) {}

  async getAll(
    id: number,
    searchBookingDto: SearchBookingDto,
    pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<Booking>> {
    const user = await this.userService.getOne(id);
    const queryBuilder = this.bookingRepository.createQueryBuilder("booking");
    queryBuilder
      .innerJoinAndSelect(ParkingSlot, "parkingSlot", "booking.parkingSlotId = parkingSlot.id ")
      .innerJoinAndSelect(ParkingLocation, "parkingLocation", "parkingSlot.parkingLocationId = parkingLocation.id");
    if (user.role.name === "partner")
      queryBuilder.where("parkingLocation.partnerId = :partnerId", { partnerId: user.partner.id });

    if (user.role.name === "user") queryBuilder.where("booking.userId = :userId", { userId: user.id });
    const { status, fromAt, priceStartAt, priceEndAt } = searchBookingDto;
    if (status) queryBuilder.andWhere("booking.status = :status", { status });
    if (fromAt) queryBuilder.andWhere("booking.startAt >= :fromAt", { fromAt });
    if (priceStartAt) queryBuilder.andWhere("booking.amount >= :priceStartAt", { priceStartAt });
    if (priceEndAt) queryBuilder.andWhere("booking.amount <= :priceEndAt", { priceEndAt });
    const { take, skip } = pageOptionsDto;
    queryBuilder.orderBy("booking.createAt", "DESC");
    queryBuilder.skip(skip).take(take);

    const [data, itemCount] = await queryBuilder.getManyAndCount();
    const metaDto = new PageMetaDto({ pageOptionsDto, itemCount });
    return new PageDto(data, metaDto);
  }
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
    if (dayjs(startAt).isAfter(endAt)) throw new BadRequestException("The startAt must be before endAt");
    const [user, parkingSlot, services] = await Promise.all([
      this.userService.getOne(userId),
      this.parkingSlotService.findOne(parkingSlotId),
      Promise.all(serviceIds.map(async (serviceId) => this.parkingServiceService.getOne(serviceId))),
    ]);
    if (!user) throw new NotFoundException("User not found");
    if (!parkingSlot) throw new NotFoundException("Parking slot not found");
    const [fee, amount] = await Promise.all([
      this.parkingSlotService.calculateFee(parkingSlotId),
      this.parkingSlotService.calculateAmount(parkingSlotId, createBookingDto.startAt, createBookingDto.endAt),
    ]);
    const booking = this.bookingRepository.create({
      ...createBookingDto,
      user,
      parkingSlot,
      services,
      startAt,
      endAt,
      fee,
      amount,
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
  findOneBy(param: FindOptionsWhere<Booking>) {
    return this.bookingRepository.findOne({ where: param });
  }
}
