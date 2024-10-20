import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Brackets,
  DataSource,
  FindOptionsRelations,
  FindOptionsWhere,
  Like,
  QueryFailedError,
  Repository,
} from "typeorm";
import { PricingOptionService } from "src/pricingOption/pricingOption.service";
import { PaymentMethodService } from "src/paymentMethod/paymentMethod.service";
import { Partner } from "src/partner/partner.entity";
import { User } from "src/user/user.entity";
import { omitBy, isUndefined, set, map, omit, groupBy, uniq } from "lodash";
import { CreateParkingLocationDto } from "./dtos/createParkingLocation.dto";
import { SearchParkingLocationDto } from "./dtos/searchParkingLocation.dto";
import { UpdateParkingLocationDto } from "./dtos/updateParkingLocation.dto";
import { ParkingLocation } from "./parkingLocation.entity";
import { PageDto } from "src/utils/dtos/page.dto";
import { PageOptionsDto } from "src/utils/dtos/pageOption.dto";
import { PageMetaDto } from "src/utils/dtos/pageMeta.dto";
import * as dayjs from "dayjs";
import { isKeyOf } from "src/utils/utils";
import { Booking } from "src/booking/booking.entity";
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
  ): Promise<PageDto<ParkingLocation & { distance: number; minPrice: number }>> {
    const {
      lat,
      lng,
      services,
      startAt = dayjs(),
      endAt = dayjs().add(30, "minutes"),
      width = 200,
      length = 200,
      height = 200,
      radius = 10,
      priceStartAt = 0,
      priceEndAt = 10000,
      orderBy = "distance",
      ...query
    } = searchParkingLocationDto;
    const { skip = 0, take = 20 } = pageOptionsDto;
    const filteredQuery = omitBy(query, isUndefined);
    const queryBuilder = this.parkingLocationRepository
      .createQueryBuilder("parkingLocation")
      .innerJoin("parkingLocation.parkingSlots", "parkingSlot", "parkingSlot.deleteAt IS NULL")
      .innerJoin(Booking, "booking", "booking.parkingSlotId = parkingSlot.id")
      .innerJoin("parkingSlot.services", "service")
      .innerJoinAndSelect("parkingLocation.images", "image", "image.deleteAt IS NULL")
      .innerJoin("parkingLocation.partner", "partner", "partner.deleteAt IS NULL")
      .innerJoin("partner.user", "user", "user.deleteAt IS NULL")
      .innerJoin("parkingSlot.type", "type", "type.deleteAt IS NULL")
      .select([
        `DISTINCT parkingLocation.id AS "id"`,
        `parkingLocation.name AS "name"`,
        `parkingLocation.address AS "address"`,
        `parkingLocation.description AS "description"`,
        `parkingLocation.lat AS "lat"`,
        `parkingLocation.lng AS "lng"`,
        `parkingLocation.access AS "access"`,
        `parkingLocation.createAt AS "createAt"`,
        `parkingLocation.deleteAt AS "deleteAt"`,
        `parkingLocation.partnerId AS "partnerId"`,
        `parkingLocation.paymentMethodId AS "paymentMethodId"`,
        `parkingLocation.pricingOptionId AS "pricingOptionId"`,
        `parkingSlot.id AS "parkingSlotId"`,
        `image.url AS image`,
        `parkingSlot.price AS "minPrice"`,
      ])
      .addSelect(
        `earth_distance(ll_to_earth(parkingLocation.lat, parkingLocation.lng),ll_to_earth(:lat, :lng)) / 1000 AS distance`
      );
    if (services) {
      const serviceIds = services.split("-");
      queryBuilder.where("service.id IN (:...serviceIds)", { serviceIds });
    }
    if (lat && lng && radius) {
      queryBuilder.andWhere(
        "(earth_distance(ll_to_earth(parkingLocation.lat, parkingLocation.lng), ll_to_earth(:lat, :lng)) / 1000) < :radius",
        {
          lat,
          lng,
          radius,
        }
      );
    }
    queryBuilder
      .andWhere(
        new Brackets((qb) => {
          qb.where(" :startAt >= parkingSlot.startAt AND :endAt <= parkingSlot.endAt").orWhere(
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
              startAt: this.timeToSeconds(dayjs(startAt)),
              endAt: this.timeToSeconds(dayjs(startAt).add(24, "hours")),
            }
          );
        })
      )
      .andWhere("booking.startAt NOT BETWEEN :bookingStartAt AND :bookingEndAt", {
        bookingStartAt: startAt.toISOString(),
        bookingEndAt: endAt.toISOString(),
      })
      .andWhere("parkingSlot.length >= :length", { length })
      .andWhere("parkingSlot.height >= :height", { height })
      .andWhere("parkingSlot.height >= :width", { width })
      .andWhere("parkingSlot.price BETWEEN :priceStartAt AND :priceEndAt", {
        priceStartAt: priceStartAt,
        priceEndAt: priceEndAt,
      })
      .andWhere(filteredQuery)
      .skip(skip)
      .take(take)
      .orderBy(orderBy, "ASC");
    queryBuilder.setParameters({
      lat,
      lng,
      radius,
    });
    const combineParkedLocations = (data) => {
      const groupedData = groupBy(data, "id");
      return map(groupedData, (group) => ({
        ...omit(group[0], "image"),
        images: uniq(group.map(({ image }) => image)),
        parkingSlotIds: uniq(group.map(({ parkingSlotId }) => parkingSlotId)),
      })) as Array<ParkingLocation & { distance: number; minPrice: number; parkingSlotIds: number[] }>;
    };

    const data = await queryBuilder.getRawMany();
    const combinedData = combineParkedLocations(data);
    const itemCount = combinedData.length;
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(combinedData, pageMetaDto);
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

  async findAll(props: { searchDto: SearchParkingLocationDto; pageOptionsDto: PageOptionsDto; partnerId?: number }) {
    const relations = {
      partner: true,
      paymentMethod: true,
      pricingOption: true,
      images: true,
      parkingSlots: true,
    };
    const { skip, take, orderBy, order } = props.pageOptionsDto;
    const { field, keyword } = props.searchDto;

    const where: FindOptionsWhere<ParkingLocation> = {
      partner: { id: props.partnerId },
    };
    if (field && isKeyOf<ParkingLocation>(field)) set(where, field, Like(`%${keyword}%`));
    const data = await this.parkingLocationRepository.find({
      where,
      take,
      skip,
      relations,
      order: {
        [orderBy]: order,
      },
    });
    const dataWithPrice: (ParkingLocation & { minPrice: number })[] = data.map((parkingLocation) => {
      const minPrice = parkingLocation.parkingSlots.reduce(
        (minPrice, { price: priceB }) => (minPrice < priceB ? minPrice : priceB),
        1000
      );
      return { ...parkingLocation, minPrice };
    });
    const itemCount = dataWithPrice.length;
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto: props.pageOptionsDto });
    return new PageDto(dataWithPrice, pageMetaDto);
  }

  async findOne(id: number, partnerId?: number) {
    const relations: FindOptionsRelations<ParkingLocation> = {
      partner: true,
      paymentMethod: true,
      pricingOption: true,
      images: true,
      parkingSlots: true,
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
  timeToSeconds = (time: dayjs.Dayjs) => {
    const hours = time.hour();
    const minutes = time.minute();
    const seconds = time.second();
    return hours * 3600 + minutes * 60 + seconds;
  };
}
