import { PartialType } from "@nestjs/mapped-types";
import { CreateParkingSlotDto } from "./createParkingSlot.dto";

export class UpdateParkingSlotDto extends PartialType(CreateParkingSlotDto) {}
