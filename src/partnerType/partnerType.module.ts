import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PartnerType } from "./partnerType.entity";
import { PartnerTypeService } from "./partnerType.service";
import { PartnerTypeController } from "./partnerType.controller";

@Module({
  imports: [TypeOrmModule.forFeature([PartnerType])],
  providers: [PartnerTypeService],
  controllers: [PartnerTypeController],
  exports: [PartnerTypeService],
})
export class PartnerTypeModule {}
