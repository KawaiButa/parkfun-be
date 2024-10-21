import { PartialType } from "@nestjs/mapped-types";
import { Partner } from "../partner.entity";
import { IsNumber, IsNumberString, IsString } from "class-validator";

export class UpdatePartnerDto extends PartialType(Partner) {
  @IsString()
  @IsNumberString()
  phoneNumber?: string;

  @IsNumber()
  typeId?: number;

  @IsString()
  name?: string;
}
