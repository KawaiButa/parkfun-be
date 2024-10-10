import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class SearchParkingSlotDto {
  @IsNumber()
  parkingLocationId: string;

  @IsOptional()
  @IsNumber()
  startAt?: number;

  @IsOptional()
  @IsNumber()
  endAt?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  priceStartAt?: number;

  @IsOptional()
  @IsNumber()
  priceEndAt?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  length?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  type?: number;

  @IsOptional()
  @IsString()
  services?: string;
}
