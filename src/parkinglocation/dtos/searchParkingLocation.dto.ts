import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";

export class SearchParkingLocationDto {
  @IsString()
  @IsOptional()
  field?: string;

  @ValidateIf((obj) => obj.field)
  @IsString()
  keyword?: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;

  @ValidateIf((obj) => obj.lat && obj.lng)
  @IsNumber()
  @IsOptional()
  radius?: number;

  @IsOptional()
  @IsDate()
  startAt?: Date;

  @IsOptional()
  @IsDate()
  endAt?: Date;

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

  @IsOptional()
  @IsNumber()
  orderBy?: string;
}
