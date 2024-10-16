import { IsNumber, IsNotEmpty, IsOptional, IsArray } from "class-validator";

export class BookingDto {
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
