import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreateParkingSlotDto } from "./createParkingSlot.dto";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateParkingSlotDto extends PartialType(OmitType(CreateParkingSlotDto, ["images"])) {
  @IsBoolean()
  @IsOptional()
  isAvalable?: boolean;
}
