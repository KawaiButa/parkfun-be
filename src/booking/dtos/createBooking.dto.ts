import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateBookingDto {
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
