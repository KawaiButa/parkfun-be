import { Injectable, NotFoundException } from "@nestjs/common";
import { CreatePartnerDto } from "./dto/createPartner.dto";
import { UpdatePartnerDto } from "./dto/updatePartner.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Partner } from "./partner.entity";
import { PartnerTypeService } from "src/partnerType/partnerType.service";
import { UserService } from "src/user/user.service";

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner) private readonly partnerRepository: Repository<Partner>,
    private readonly partnerTypeService: PartnerTypeService,
    private readonly userService: UserService,
    private dataSource: DataSource
  ) {}
  async create(createPartnerDto: CreatePartnerDto) {
    const queyrRunner = this.dataSource.createQueryRunner();
    queyrRunner.connect();
    queyrRunner.startTransaction();
    try {
      const partnerType = await this.partnerTypeService.get({ name: createPartnerDto.type });
      const user = await this.userService.create({ ...createPartnerDto });
      const partner = this.partnerRepository.create({ ...createPartnerDto, type: partnerType, user });
      await this.partnerRepository.save(partner);
      return partner;
    } catch (err) {
      await queyrRunner.rollbackTransaction();
      throw err;
    } finally {
      queyrRunner.release();
    }
  }

  async findAll() {
    return await this.getFullPartnerQuery().getMany();
  }

  async findOneById(id: number) {
    const partner = await this.getFullPartnerQuery().where("partner.id = :id", { id }).getOne();
    if (!partner) {
      throw new NotFoundException("Partner not found");
    }
    return partner;
  }

  async update(id: number, updatePartnerDto: UpdatePartnerDto) {
    const updateResult = await this.partnerRepository.update(id, updatePartnerDto);
    if (updateResult.affected) return await this.partnerRepository.findBy({ id });
    throw new NotFoundException("Partner not found");
  }

  async remove(id: number, deleteUser: boolean = false) {
    const queryRunner = this.dataSource.createQueryRunner();
    const partner = await this.partnerRepository.findOneBy({ id });
    if (!partner) throw new NotFoundException("Partner not found");
    await queryRunner.connect();
    queryRunner.startTransaction();
    try {
      const result = await this.partnerRepository.delete(id);
      if (!result.affected) throw new NotFoundException("Partner not found");
      if (deleteUser) {
        await this.userService.delete(partner.user.id);
      }
      return "Successfully delete partner";
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      queryRunner.release();
    }
  }
  getFullPartnerQuery() {
    return this.dataSource
      .createQueryBuilder(Partner, "partner")
      .innerJoinAndSelect("partner.user", "user", "partner.id = user.partnerId")
      .innerJoinAndSelect("user.role", "role", "user.roleId = role.id");
  }
}
