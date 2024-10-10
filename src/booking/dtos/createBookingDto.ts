import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class CreateBookingDto {
  @IsNumber({}, { message: "ParkingSlotId must be a number" })
  @IsNotEmpty()
  parkingSlotId: number;

  @IsNumber({}, { message: "ParkingSlotId must be a number" })
  @IsNotEmpty()
  startAt: number;

  @IsNumber({}, { message: "ParkingSlotId must be a number" })
  @IsNotEmpty()
  endAt: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  services: number[];
}
