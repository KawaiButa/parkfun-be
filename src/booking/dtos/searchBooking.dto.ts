import { IsOptional, IsNumber, IsDate, ValidateIf } from "class-validator";
import { BookingStatus } from "../booking.entity";

export class SearchBookingDto {
  @IsOptional()
  @IsNumber()
  status?: BookingStatus;

  @IsOptional()
  @IsDate()
  fromAt: Date;

  @ValidateIf((obj) => obj.priceEndAt)
  @IsOptional()
  @IsNumber()
  priceStartAt: number;

  @ValidateIf((obj) => obj.priceStartAt)
  @IsOptional()
  @IsNumber()
  priceEndAt: number;
}
