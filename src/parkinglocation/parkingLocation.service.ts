import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateParkingLocationDto } from "./dtos/createParkingLocation.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { ParkingLocation } from "./parkingLocation.entity";
import { PricingOptionService } from "src/pricingOption/pricingOption.service";
import { PaymentMethodService } from "src/paymentMethod/paymentMethod.service";
import { PartnerService } from "src/partner/partner.service";

@Injectable()
export class ParkingLocationService {
  constructor(
    @InjectRepository(ParkingLocation) private parkingLocationRepository: Repository<ParkingLocation>,
    private pricingOptionService: PricingOptionService,
    private paymentMethodService: PaymentMethodService,
    private partnerService: PartnerService,
    private dataSource: DataSource
  ) {}
  async create(createParkingLocationDto: CreateParkingLocationDto) {
    const { pricingOptionId, paymentMethodId } = createParkingLocationDto;
    const pricingOption = await this.pricingOptionService.get(pricingOptionId);
    const paymentMethod = await this.paymentMethodService.get(paymentMethodId);

    const parkingLocation = this.parkingLocationRepository.create({
      ...createParkingLocationDto,
      pricingOption,
      paymentMethod,
    });
    return await this.parkingLocationRepository.save(parkingLocation);
  }

  async findAll() {
    return await this.parkingLocationRepository.find({
      relations: {
        partner: true,
        paymentMethod: true,
        pricingOption: true,
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

  async update(id: number, updateData: Partial<Omit<ParkingLocation, "id">>) {
    const updateResult = await this.parkingLocationRepository.update(id, updateData);
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
