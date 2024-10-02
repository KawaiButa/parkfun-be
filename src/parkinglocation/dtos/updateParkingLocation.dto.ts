import { PartialType } from "@nestjs/mapped-types";
import { CreateParkingLocationDto } from "./createParkingLocation.dto";

export class UpdateParkingLocationDto extends PartialType(CreateParkingLocationDto) {}
