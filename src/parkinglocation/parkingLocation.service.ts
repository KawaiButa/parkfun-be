import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateParkingLocationDto } from "./dtos/createParkingLocation.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, DataSource, FindOptionsRelations, FindOptionsWhere, QueryFailedError, Repository } from "typeorm";
import { ParkingLocation } from "./parkingLocation.entity";
import { PricingOptionService } from "src/pricingOption/pricingOption.service";
import { PaymentMethodService } from "src/paymentMethod/paymentMethod.service";
import { Partner } from "src/partner/partner.entity";
import { User } from "src/user/user.entity";
import { UpdateParkingLocationDto } from "./dtos/updateParkingLocation.dto";
import { SearchParkingLocationDto } from "./dtos/searchParkingLocation.dto";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { omitBy, isUndefined, uniqBy } from "lodash";
@Injectable()
export class ParkingLocationService {
  constructor(
    @InjectRepository(ParkingLocation) private parkingLocationRepository: Repository<ParkingLocation>,
    private pricingOptionService: PricingOptionService,
    private paymentMethodService: PaymentMethodService,
    private dataSource: DataSource
  ) {}
  async search(searchParkingLocationDto: SearchParkingLocationDto) {
    const { lat, lng, services, radius, priceEndAt, priceStartAt, ...query } = searchParkingLocationDto;
    const filteredQuery = omitBy(query, isUndefined);
    const data = await this.dataSource
      .createQueryBuilder(ParkingSlot, "parkingSlot")
      .innerJoinAndSelect("parkingSlot.services", "service", "service.id IN (:...serviceIds)", {
        serviceIds: services.split("-"),
      })
      .where({
        ...filteredQuery,
        price: Between(priceStartAt, priceEndAt),
      })
      .innerJoinAndSelect("parkingSlot.parkingLocation", "parkingLocation")
      .innerJoinAndSelect("parkingLocation.images", "images")
      .getMany();
    const filteredData = data.filter(({ services: serviceList, parkingLocation }) => {
      const distance = this.calculateDistance({ lat, lng }, { lat: parkingLocation.lat, lng: parkingLocation.lng });
      if (distance > radius) return false;
      return serviceList.length === services.split("-").length;
    });
    const parkingLocationList = filteredData.map(({ parkingLocation }) => parkingLocation);
    return uniqBy(parkingLocationList, "id");
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
    const relations: FindOptionsRelations<ParkingLocation> = {
      partner: true,
      paymentMethod: true,
    };
    const where: FindOptionsWhere<ParkingLocation> = {
      id,
    };
    if (partnerId) {
      if (partnerId !== -1) where.partner = { id: partnerId };
      relations.pricingOption = true;
    }
    return await this.parkingLocationRepository.findOne({
      relations,
      where: { id },
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
        const isDeleable = await this.parkingLocationRepository.findOne({
          where: {
            id,
            partner: { id: partnerId },
          },
        });
        if (!isDeleable) {
          throw new NotFoundException("You are not authorized to remove this location.");
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
