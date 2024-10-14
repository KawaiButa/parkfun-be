import { IsArray, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateBookingDto {
  @IsNumber()
  @IsNotEmpty()
  parkingSlotId: number;

  @IsNumber()
  @IsNotEmpty()
  startAt: number;

  @IsNumber()
  @IsNotEmpty()
  endAt: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  serviceIds: number[];

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
