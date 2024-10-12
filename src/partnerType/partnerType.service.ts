import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PartnerType } from "./partnerType.entity";
import { Repository } from "typeorm";
import { PageOptionsDto } from "src/utils/dtos/pageOption.dto";
import { Partner } from "src/partner/partner.entity";
import { isKeyOf } from "src/utils/utils";
import { PageDto } from "src/utils/dtos/page.dto";
import { PageMetaDto } from "src/utils/dtos/pageMeta.dto";

@Injectable()
export class PartnerTypeService {
  constructor(@InjectRepository(PartnerType) private readonly partnerTypeRepository: Repository<PartnerType>) {}

  async get(param: Partial<PartnerType>) {
    return this.partnerTypeRepository.findOne({ where: param });
  }
  async getAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<PartnerType>> {
    const { skip, take, orderBy, order } = pageOptionsDto;
    if (!isKeyOf<PartnerType>(orderBy))
      throw new BadRequestException("The orderBy parameter must be a key in partner type");
    const data = await this.partnerTypeRepository.find({
      skip,
      take,
      order: {
        [orderBy as keyof Partner]: order,
      },
    });
    const itemCount = data.length;
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(data, pageMetaDto);
  }
}
