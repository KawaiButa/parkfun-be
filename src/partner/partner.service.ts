import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreatePartnerDto } from "./dto/createPartner.dto";
import { UpdatePartnerDto } from "./dto/updatePartner.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Partner } from "./partner.entity";
import { PartnerTypeService } from "src/partnerType/partnerType.service";
import { UserService } from "src/user/user.service";
import * as bcrypt from "bcrypt";
import { PageDto } from "src/utils/dtos/page.dto";
import { PageOptionsDto } from "src/utils/dtos/pageOption.dto";
import { isKeyOf } from "src/utils/utils";
import { PageMetaDto } from "src/utils/dtos/pageMeta.dto";
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
      const partnerType = await this.partnerTypeService.get({ id: createPartnerDto.typeId });
      const hashedPassword = await bcrypt.hash(createPartnerDto.password, 10);
      const user = await this.userService.create({ ...createPartnerDto, password: hashedPassword });
      const partner = this.partnerRepository.create({
        ...createPartnerDto,
        type: partnerType,
        user,
      });
      await this.partnerRepository.save(partner);
      return partner;
    } catch (err) {
      await queyrRunner.rollbackTransaction();
      throw err;
    } finally {
      queyrRunner.release();
    }
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<Partner>> {
    const { skip, take, orderBy, order } = pageOptionsDto;
    if (!isKeyOf<Partner>(orderBy)) throw new BadRequestException("The orderBy parameter must be a key in partner.");
    const data = await this.partnerRepository.find({
      skip: skip,
      take: take,
      order: {
        [orderBy]: order,
      },
      relations: {
        type: true,
      },
    });
    const itemCount = data.length;
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(data, pageMetaDto);
  }

  async findOneById(id: number) {
    const partner = await this.partnerRepository.findOne({
      where: { id },
      relations: {
        user: {
          image: true,
        },
        type: true,
      },
    });
    if (!partner) {
      throw new NotFoundException("Partner not found");
    }
    return partner;
  }

  async update(id: number, updatePartnerDto: UpdatePartnerDto) {
    const { phoneNumber, typeId, name, ...data } = updatePartnerDto;
    const [partnerEntity, partnerType] = await Promise.all([
      this.partnerRepository.findOne({
        where: { id },
        relations: {
          user: true,
          type: true,
        },
      }),
      this.partnerTypeService.get({ id: typeId }),
    ]);
    const partner = await this.partnerRepository.preload({
      ...partnerEntity,
      ...data,
      type: partnerType,
      user: { ...partnerEntity.user, name, phoneNumber },
    });
    const updateResult = this.partnerRepository.save(partner);
    if (updateResult) return updateResult;
    throw new NotFoundException("Partner not found");
  }

  async delete(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    const partner = await this.partnerRepository.findOneBy({ id });
    if (!partner) throw new NotFoundException("Partner not found");
    await queryRunner.connect();
    queryRunner.startTransaction();
    try {
      await this.userService.delete(partner.user.id);
      const result = await this.partnerRepository.delete(id);
      if (!result.affected) throw new NotFoundException("Partner not found");
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
      .innerJoinAndSelect("partner.type", "type", "partner.typeId = type.id")
      .innerJoinAndSelect("partner.user", "user", "partner.id = user.partnerId")
      .innerJoinAndSelect("user.role", "role", "user.roleId = role.id");
  }
}
