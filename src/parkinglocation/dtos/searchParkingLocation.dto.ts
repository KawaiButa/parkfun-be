import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class SearchParkingLocationDto {
  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  lng: number;

  @IsNotEmpty()
  @IsNumber()
  radius: number;

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
