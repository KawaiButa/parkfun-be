import { Module } from "@nestjs/common";
import { PartnerController } from "./partner.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Partner } from "./partner.entity";
import { PartnerTypeModule } from "src/partnerType/partnerType.module";
import { UserModule } from "src/user/user.module";
import { RoleModule } from "src/role/role.module";
import { PartnerService } from "./partner.service";

@Module({
  imports: [PartnerTypeModule, RoleModule, UserModule, TypeOrmModule.forFeature([Partner])],
  controllers: [PartnerController],
  providers: [PartnerService],
  exports: [PartnerService],
})
export class PartnerModule {}
