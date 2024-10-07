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
    if (!partnerId)
      return this.parkingLocationRepository.find({
        relations: {
          partner: true,
          paymentMethod: true,
          pricingOption: true,
          images: true,
          parkingSlot: true,
        },
      });
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

  async findOne(id: number, partnerId?: number) {
    if (!partnerId)
      return await this.parkingLocationRepository.findOne({
        relations: {
          partner: true,
          paymentMethod: true,
          pricingOption: true,
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

  async remove(id: number) {
    try {
      const deleteResult = await this.parkingLocationRepository.delete(id);
      if (deleteResult.affected) {
        return "Successfully delete parking location";
      } else {
        throw new NotFoundException("Parking location not found");
      }
    } catch (err) {
      if (err instanceof QueryFailedError) {
        console.log(err.message);
        throw new BadRequestException(
          "Parking location still associated with some parking slot. Please delete associated parking slot first"
        );
      } else throw err;
    }
  }
}
