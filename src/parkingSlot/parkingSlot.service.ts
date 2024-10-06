import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateParkingSlotDto } from "./dtos/createParkingSlot.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { ParkingSlot } from "./parkingSlot.entity";
import { ParkingSlotTypeService } from "src/parkingSlotType/parkingSlotType.service";
import { ParkingService } from "src/parkingService/parkingSerivce.entity";
import { ParkingLocationService } from "src/parkinglocation/parkingLocation.service";

@Injectable()
export class ParkingSlotService {
  constructor(
    @InjectRepository(ParkingSlot) private parkingSlotRepository: Repository<ParkingSlot>,
    private parkingSlotTypeService: ParkingSlotTypeService,
    private parkingLocationService: ParkingLocationService,
    private dataSource: DataSource
  ) {}

  async create(createSlotData: CreateParkingSlotDto) {
    const { parkingSlotTypeId, parkingLocationId, parkingServiceIds, images, space } = createSlotData;
    const parkingSlotTypeEntity = await this.parkingSlotTypeService.getOne(parkingSlotTypeId);
    if (!parkingSlotTypeEntity) throw new BadRequestException("Invalid slot type");
    const parkingLocationEntity = await this.parkingLocationService.findOne(parkingLocationId);
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
        images: images.map((e) => ({
          url: e,
        })),
        isAvailable: true,
      }))
    );
    const result = await this.parkingSlotRepository.insert(parkingSlots);
    if (result.generatedMaps.length != space) throw new InternalServerErrorException("Unable to create slot");
    return parkingSlots;
  }

  async findAll() {
    return await this.parkingSlotRepository.find();
  }

  findOne(id: number) {
    return this.parkingSlotRepository.find({
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
  }

  remove(id: number) {
    return this.parkingSlotRepository.delete(id);
  }
}
