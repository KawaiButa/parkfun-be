import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateParkingSlotDto } from "./dtos/createParkingSlot.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, FindOptionsWhere, Repository } from "typeorm";
import { ParkingSlot } from "./parkingSlot.entity";
import { ParkingSlotTypeService } from "src/parkingSlotType/parkingSlotType.service";
import { ParkingService } from "src/parkingService/parkingService.entity";
import { ParkingLocationService } from "src/parkinglocation/parkingLocation.service";
import { Image } from "src/image/image.entity";
import { PageOptionsDto } from "src/utils/dtos/pageOption.dto";
import { PageDto } from "src/utils/dtos/page.dto";
import { PageMetaDto } from "src/utils/dtos/pageMeta.dto";

@Injectable()
export class ParkingSlotService {
  constructor(
    @InjectRepository(ParkingSlot) private parkingSlotRepository: Repository<ParkingSlot>,
    private parkingSlotTypeService: ParkingSlotTypeService,
    private parkingLocationService: ParkingLocationService,
    private dataSource: DataSource
  ) {}

  async create(createSlotData: CreateParkingSlotDto, partnerId?: number) {
    const { parkingSlotTypeId, parkingLocationId, parkingServiceIds, images, space } = createSlotData;
    const parkingSlotTypeEntity = await this.parkingSlotTypeService.getOne(parkingSlotTypeId);
    if (!parkingSlotTypeEntity) throw new BadRequestException("Invalid slot type");
    const parkingLocationEntity = await this.parkingLocationService.findOne(parkingLocationId);
    if (partnerId && parkingLocationEntity.partner.id !== partnerId)
      throw new NotFoundException("Cannot found the parking location");
    if (!parkingLocationEntity) throw new BadRequestException("Unable to find the location");
    const queryRunner = this.dataSource.createQueryRunner();
    const parkingServices = await queryRunner.manager.find(ParkingService, {
      where: parkingServiceIds.map((parkingServiceId) => ({ id: parkingServiceId })),
    });
    const parkingSlots = this.parkingSlotRepository.create(
      Array.from(Array(space)).map(() => ({
        ...createSlotData,
        parkingLocation: parkingLocationEntity,
        type: parkingSlotTypeEntity,
        services: parkingServices,
        images: images.map((e) => queryRunner.manager.create(Image, { url: e })),
        isAvailable: true,
      }))
    );
    return await this.parkingSlotRepository.save(parkingSlots);
  }

  async findAll(pageOptionsDto: PageOptionsDto, partnerId?: number): Promise<PageDto<ParkingSlot>> {
    const { take, skip, orderBy, order } = pageOptionsDto;
    const where: FindOptionsWhere<ParkingSlot> = {};
    if (partnerId) {
      where.parkingLocation = { partner: { id: partnerId } };
    }
    const data = await this.parkingSlotRepository.find({
      where: {
        parkingLocation: {
          partner: { id: partnerId },
        },
      },
      relations: {
        type: true,
        services: true,
        images: true,
        parkingLocation: {
          paymentMethod: true,
        },
      },
      order: {
        [orderBy as keyof ParkingSlot]: order,
      },
      take,
      skip,
    });

    const itemCount = data.length;
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return { data, meta: pageMetaDto };
  }

  async findOne(id: number, partnerId?: number) {
    if (!partnerId)
      return await this.parkingSlotRepository.findOne({
        where: { id },
        relations: {
          type: true,
          services: true,
          images: true,
          parkingLocation: {
            partner: true,
            paymentMethod: true,
            pricingOption: true,
          },
        },
      });
    return await this.parkingSlotRepository.findOne({
      where: { id, parkingLocation: { partner: { id: partnerId } } },
      relations: {
        type: true,
        services: true,
        images: true,
        parkingLocation: {
          partner: true,
          paymentMethod: true,
          pricingOption: true,
        },
      },
    });
  }

  remove(id: number) {
    return this.parkingSlotRepository.delete(id);
  }
}
