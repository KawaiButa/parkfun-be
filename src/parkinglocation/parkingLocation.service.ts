import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateParkingLocationDto } from "./dtos/createParkingLocation.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { ParkingLocation } from "./parkingLocation.entity";
import { PricingOptionService } from "src/pricingOption/pricingOption.service";
import { PaymentMethodService } from "src/paymentMethod/paymentMethod.service";
import { Partner } from "src/partner/partner.entity";
import { User } from "src/user/user.entity";
import { UpdateParkingLocationDto } from "./dtos/updateParkingLocation.dto";

@Injectable()
export class ParkingLocationService {
  constructor(
    @InjectRepository(ParkingLocation) private parkingLocationRepository: Repository<ParkingLocation>,
    private pricingOptionService: PricingOptionService,
    private paymentMethodService: PaymentMethodService,
    private dataSource: DataSource
  ) {}
  async create(userId: number, createParkingLocationDto: CreateParkingLocationDto) {
    const { pricingOptionId, paymentMethodId, images } = createParkingLocationDto;
    const pricingOption = await this.pricingOptionService.get(pricingOptionId);
    const paymentMethod = await this.paymentMethodService.get(paymentMethodId);
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
    return await this.parkingLocationRepository.find({
      where: { partner: { id: partnerId } },
      relations: {
        partner: true,
        paymentMethod: true,
        pricingOption: true,
        images: true,
        parkingSlot: true,
      },
    });
  }

  async findOne(id: number) {
    return await this.parkingLocationRepository.findOne({
      relations: {
        partner: true,
        paymentMethod: true,
        pricingOption: true,
      },
      where: { id },
    });
  }

  async update(id: number, updateData: UpdateParkingLocationDto) {
    const { images } = updateData;
    const imagesEntity = images.map((image) => ({ url: image }));
    const updateResult = await this.parkingLocationRepository.update(id, { ...updateData, images: imagesEntity });
    if (updateResult.affected) {
      return await this.parkingLocationRepository.findOne({ where: { id } });
    } else {
      throw new NotFoundException("Parking location not found");
    }
  }

  async remove(id: number) {
    const deleteResult = await this.parkingLocationRepository.delete(id);
    if (deleteResult.affected) {
      return "Successfully delete parking location";
    } else {
      throw new NotFoundException("Parking location not found");
    }
  }
}
