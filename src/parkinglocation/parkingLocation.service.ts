import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateParkingLocationDto } from "./dtos/createParkingLocation.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, QueryFailedError, Repository } from "typeorm";
import { ParkingLocation } from "./parkingLocation.entity";
import { PricingOptionService } from "src/pricingOption/pricingOption.service";
import { PaymentMethodService } from "src/paymentMethod/paymentMethod.service";
import { Partner } from "src/partner/partner.entity";
import { User } from "src/user/user.entity";
import { UpdateParkingLocationDto } from "./dtos/updateParkingLocation.dto";
import { SearchParkingLocationDto } from "./dtos/searchParkingLocation.dto";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { omitBy, isUndefined } from "lodash";
@Injectable()
export class ParkingLocationService {
  constructor(
    @InjectRepository(ParkingLocation) private parkingLocationRepository: Repository<ParkingLocation>,
    private pricingOptionService: PricingOptionService,
    private paymentMethodService: PaymentMethodService,
    private dataSource: DataSource
  ) {}
  async search(searchParkingLocationDto: SearchParkingLocationDto) {
    const {
      lat,
      lng,
      services,
      startAt,
      endAt,
      radius,
      priceEndAt = 10000,
      priceStartAt = 0,
      ...query
    } = searchParkingLocationDto;
    const filteredQuery = omitBy(query, isUndefined);
    let queryBuilder = this.parkingLocationRepository
      .createQueryBuilder("parkingLocation")
      .innerJoinAndSelect("parkingLocation.parkingSlots", "parkingSlot");

    queryBuilder = queryBuilder
      .andWhere(`parkingSlot.price BETWEEN ${priceStartAt} AND ${priceEndAt}`)
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select("parkingSlot2.id")
          .from(ParkingSlot, "parkingSlot2")
          .where(filteredQuery)
          .getQuery();
        return "parkingSlot.id IN " + subQuery;
      });
    if (startAt && endAt) {
      const limmitedStartAt = startAt % 86400;
      const limitedEndAt = endAt & 86400;
      queryBuilder = queryBuilder
        .where(
          "(timeRange.givenStartTime <= timeRange.givenEndTime AND :startAt >= timeRange.givenStartTime AND :endAt <= timeRange.givenEndTime)",
          { startAt: limmitedStartAt, endAt: limitedEndAt }
        )
        .orWhere(
          "(timeRange.givenStartTime > timeRange.givenEndTime AND (:startAt >= timeRange.givenStartTime OR :endAt <= timeRange.givenEndTime))",
          { startAt: limmitedStartAt, endAt: limitedEndAt }
        );
    }
    if (services) {
      const serviceIds = services.split("-");
      queryBuilder = queryBuilder
        .leftJoinAndSelect("parkingSlot.services", "service")
        .where("service.id IN (:...serviceIds)", { serviceIds });
    }
    queryBuilder = queryBuilder
      .innerJoinAndSelect("parkingLocation.images", "images")
      .innerJoinAndSelect("parkingLocation.partner", "partner")
      .innerJoinAndSelect("partner.user", "user")
      .innerJoinAndSelect("parkingSlot.type", "type");
    const data = await queryBuilder.getMany();
    if (lat && lng && radius) {
      const filteredData = data.filter((parkingLocation) => {
        const distance = this.calculateDistance({ lat, lng }, { lat: parkingLocation.lat, lng: parkingLocation.lng });
        if (distance > radius) return false;
        return true;
      });
      return filteredData;
    }
    return data;
  }
  async create(userId: number, createParkingLocationDto: CreateParkingLocationDto) {
    const { pricingOptionId, paymentMethodId, images } = createParkingLocationDto;
    const [pricingOption, paymentMethod] = await Promise.all([
      this.pricingOptionService.get(pricingOptionId),
      this.paymentMethodService.get(paymentMethodId),
    ]);
    const partner = await this.dataSource
      .createQueryBuilder(Partner, "partner")
      .innerJoinAndSelect(User, "user", "user.partnerId = partner.id")
      .where("user.id = :userId", { userId })
      .getOne();
    const parkingLocation = this.parkingLocationRepository.create({
      ...createParkingLocationDto,
      pricingOption,
      paymentMethod,
      images: images.map((image) => ({
        url: image,
      })),
      partner,
    });
    return await this.parkingLocationRepository.save(parkingLocation);
  }

  async findAll(partnerId?: number) {
    if (!partnerId)
      return this.parkingLocationRepository.find({
        relations: {
          partner: true,
          paymentMethod: true,
          pricingOption: true,
          images: true,
          parkingSlots: true,
        },
      });
    return await this.parkingLocationRepository.find({
      where: { partner: { id: partnerId } },
      relations: {
        partner: true,
        paymentMethod: true,
        pricingOption: true,
        images: true,
        parkingSlots: true,
      },
    });
  }

  async findOne(id: number, partnerId?: number) {
    if (!partnerId)
      return await this.parkingLocationRepository.findOne({
        relations: {
          partner: true,
          paymentMethod: true,
          pricingOption: true,
          parkingSlots: {
            parkingLocation: false,
            services: true,
          },
        },
        where: { id },
      });
    return await this.parkingLocationRepository.findOne({
      relations: {
        partner: true,
        paymentMethod: true,
        pricingOption: true,
        images: true,
      },
      where: { id, partner: { id: partnerId } },
    });
  }

  async update(id: number, updateData: UpdateParkingLocationDto) {
    const { paymentMethodId, pricingOptionId, ...data } = updateData;
    const paymentMethodEntity = await this.paymentMethodService.get(paymentMethodId);
    const pricingOptionEntity = await this.pricingOptionService.get(pricingOptionId);
    const updateResult = await this.parkingLocationRepository.save({
      ...data,
      id,
      paymentMethod: paymentMethodEntity,
      pricingOption: pricingOptionEntity,
    });
    if (updateResult) {
      return updateResult;
    } else {
      throw new NotFoundException("Parking location not found");
    }
  }

  async remove(id: number, partnerId?: number) {
    try {
      if (partnerId) {
        const parkingLocation = await this.findOne(id, partnerId);
        if (!parkingLocation) {
          throw new NotFoundException("Parking location not found");
        }
      }
      const deleteResult = await this.parkingLocationRepository.delete(id);
      if (deleteResult.affected) {
        return "Successfully delete parking location";
      } else {
        throw new NotFoundException("Parking location not found");
      }
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new BadRequestException(
          "Parking location still associated with some parking slot. Please delete associated parking slot first"
        );
      } else throw err;
    }
  }
  calculateDistance = (point1: { lng: number; lat: number }, point2: { lng: number; lat: number }): number => {
    const dx = point2.lng - point1.lng;
    const dy = point2.lat - point1.lat;
    const a =
      Math.sin(dy / 2) * Math.sin(dy / 2) +
      Math.cos(point1.lat) * Math.cos(point2.lat) * Math.sin(dx / 2) * Math.sin(dx / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c;
  };
}
