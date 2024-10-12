import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, DataSource, FindOptionsRelations, FindOptionsWhere, QueryFailedError, Repository } from "typeorm";
import { PricingOptionService } from "src/pricingOption/pricingOption.service";
import { PaymentMethodService } from "src/paymentMethod/paymentMethod.service";
import { Partner } from "src/partner/partner.entity";
import { User } from "src/user/user.entity";
import { omitBy, isUndefined } from "lodash";
import { CreateParkingLocationDto } from "./dtos/createParkingLocation.dto";
import { SearchParkingLocationDto } from "./dtos/searchParkingLocation.dto";
import { UpdateParkingLocationDto } from "./dtos/updateParkingLocation.dto";
import { ParkingLocation } from "./parkingLocation.entity";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { PageDto } from "src/utils/dtos/page.dto";
import { PageOptionsDto } from "src/utils/dtos/pageOption.dto";
import { PageMetaDto } from "src/utils/dtos/pageMeta.dto";
import { isNumber } from "class-validator";
@Injectable()
export class ParkingLocationService {
  constructor(
    @InjectRepository(ParkingLocation) private parkingLocationRepository: Repository<ParkingLocation>,
    private pricingOptionService: PricingOptionService,
    private paymentMethodService: PaymentMethodService,
    private dataSource: DataSource
  ) {}
  async search(
    searchParkingLocationDto: SearchParkingLocationDto,
    pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<ParkingLocation>> {
    const {
      lat,
      lng,
      services,
      startAt = 0,
      endAt = 86400,
      width = 0,
      length = 0,
      height = 0,
      radius = 10,
      priceStartAt = 0,
      priceEndAt = 10000,
      ...query
    } = searchParkingLocationDto;
    const { skip, take } = pageOptionsDto;
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
    const limmitedStartAt = startAt % 86400;
    const limitedEndAt = endAt & 86400;
    queryBuilder = queryBuilder.where(
      new Brackets((qb) => {
        qb.where(" :startAt >= parkingSlot.startAt AND :endAt <= parkingSlot.endAt", {
          startAt: limmitedStartAt,
          endAt: limitedEndAt,
        }).orWhere(
          new Brackets((qb2) => {
            qb2
              .where("parkingSlot.startAt > parkingSlot.endAt")
              .andWhere(
                new Brackets((qb3) => {
                  qb3.where(":startAt >= parkingSlot.startAt").orWhere(":startAt < parkingSlot.endAt");
                })
              )
              .andWhere(
                new Brackets((qb4) => {
                  qb4.where(":endAt > parkingSlot.startAt").orWhere(":endAt <= parkingSlot.endAt");
                })
              )
              .andWhere(
                new Brackets((qb5) => {
                  qb5
                    .where(":startAt < :endAt")
                    .orWhere(":startAt >= parkingSlot.startAt")
                    .orWhere(":endAt <= parkingSlot.endAt");
                })
              );
          }),
          {
            startAt: limitedEndAt,
            endAt: 86400,
          }
        );
      })
    );

    queryBuilder = queryBuilder.andWhere("parkingSlot.width >= :width", { width });
    queryBuilder = queryBuilder.andWhere("parkingSlot.length >= :length", { length });
    queryBuilder = queryBuilder.andWhere("parkingSlot.height >= :height", { height });
    if (services) {
      const serviceIds = services.split("-");
      queryBuilder = queryBuilder
        .leftJoinAndSelect("parkingSlot.services", "service")
        .where("service.id IN (:...serviceIds)", { serviceIds });
    }
    queryBuilder = queryBuilder
      .innerJoinAndSelect("parkingLocation.images", "image")
      .innerJoinAndSelect("parkingLocation.partner", "partner")
      .innerJoinAndSelect(User, "user", "user.partnerId = partner.id")
      .innerJoinAndSelect("parkingSlot.type", "type");
    queryBuilder = queryBuilder.take(take).skip(skip);
    let data = await queryBuilder.getMany();
    if (isNumber(lat) && isNumber(lng)) {
      data = data.filter((parkingLocation) => {
        const distance = this.calculateDistance({ lat, lng }, { lat: parkingLocation.lat, lng: parkingLocation.lng });
        if (distance > radius) return false;
        return true;
      });
    }
    const itemCount = data.length;
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(data, pageMetaDto);
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

  async findAll(pageOptionsDto: PageOptionsDto, partnerId?: number) {
    const relations = {
      partner: true,
      paymentMethod: true,
      pricingOption: true,
      images: true,
      parkingSlots: true,
    };
    if (!partnerId)
      return this.parkingLocationRepository.find({
        relations,
      });
    return await this.parkingLocationRepository.find({
      where: { partner: { id: partnerId } },
      take: pageOptionsDto.take,
      skip: pageOptionsDto.skip,
      relations,
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
          throw new NotFoundException("You are not authorized to remove this parkingSlot.");
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
