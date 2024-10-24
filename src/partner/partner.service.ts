import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreatePartnerDto } from "./dto/createPartner.dto";
import { UpdatePartnerDto } from "./dto/updatePartner.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, FindOptionsWhere, Like, Repository } from "typeorm";
import { Partner } from "./partner.entity";
import { PartnerTypeService } from "src/partnerType/partnerType.service";
import { UserService } from "src/user/user.service";
import * as bcrypt from "bcrypt";
import { PageDto } from "src/utils/dtos/page.dto";
import { PageOptionsDto } from "src/utils/dtos/pageOption.dto";
import { isKeyOf } from "src/utils/utils";
import { PageMetaDto } from "src/utils/dtos/pageMeta.dto";
import { SearchPartnerDto } from "./dto/searchPartner.dto";
import { set } from "lodash";
import { MailService } from "src/mail/mail.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner) private readonly partnerRepository: Repository<Partner>,
    private readonly partnerTypeService: PartnerTypeService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private dataSource: DataSource
  ) {}
  async create(createPartnerDto: CreatePartnerDto) {
    const queyrRunner = this.dataSource.createQueryRunner();
    queyrRunner.connect();
    queyrRunner.startTransaction();
    try {
      const partnerType = await this.partnerTypeService.get({ id: createPartnerDto.typeId });
      const hashedPassword = await bcrypt.hash(createPartnerDto.password, 10);
      const user = await this.userService.create({ ...createPartnerDto, password: hashedPassword, role: "partner" });
      const partner = this.partnerRepository.create({
        ...createPartnerDto,
        type: partnerType,
        user,
      });
      const verificationToken = this.jwtService.sign(
        { id: user.id, email: user.email },
        {
          secret: this.configService.get("MAIL_VERFICATION_SECRET"),
          expiresIn: +this.configService.get("MAIL_VERFICATION_EXPIRES"),
        }
      );
      await this.mailService.sendUserConfirmation(user, verificationToken, createPartnerDto.password);
      await this.partnerRepository.save(partner);
      return partner;
    } catch (err) {
      await queyrRunner.rollbackTransaction();
      throw err;
    } finally {
      queyrRunner.release();
    }
  }

  async findAll(searchPartnerDto: SearchPartnerDto, pageOptionsDto: PageOptionsDto): Promise<PageDto<Partner>> {
    const { skip, take, orderBy, order } = pageOptionsDto;
    const { field, keyword, typeId } = searchPartnerDto;

    const where: FindOptionsWhere<Partner> = {
      type: { id: typeId },
    };
    if (field && isKeyOf<Partner>(field)) set(where, field, Like(`%${keyword}%`));
    if (!isKeyOf<Partner>(orderBy)) throw new BadRequestException("The orderBy parameter must be a key in partner.");
    const [data, count] = await this.partnerRepository.findAndCount({
      where,
      skip,
      take,
      order: {
        [orderBy]: order,
      },
      relations: {
        type: true,
        user: true,
      },
    });
    const itemCount = count;
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
    if (!partnerEntity) throw new NotFoundException("Partner not found");
    const partner = await this.partnerRepository.preload({
      ...partnerEntity,
      ...data,
      type: partnerType,
      user: { ...partnerEntity.user, name, phoneNumber },
    });
    const updateResult = this.partnerRepository.save(partner);
    return updateResult;
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
