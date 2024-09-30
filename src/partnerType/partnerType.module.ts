import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PartnerType } from "./partnerType.entity";
import { PartnerTypeService } from "./partnerType.service";

@Module({
  imports: [TypeOrmModule.forFeature([PartnerType])],
  providers: [PartnerTypeService],
  exports: [PartnerTypeService],
})
export class PartnerTypeModule {}
