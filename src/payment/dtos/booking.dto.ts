import { IsNumber, IsNotEmpty, IsOptional, IsArray, IsDate } from "class-validator";

export class BookingDto {
  @IsNumber()
  @IsNotEmpty()
  parkingSlotId: number;

  @IsDate()
  @IsNotEmpty()
  startAt: Date;

  @IsDate()
  @IsNotEmpty()
  endAt: Date;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  serviceIds: number[];

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
