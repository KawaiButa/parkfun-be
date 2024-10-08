import { PartialType } from "@nestjs/mapped-types";
import { Partner } from "../partner.entity";

export class UpdatePartnerDto extends PartialType(Partner) {}
