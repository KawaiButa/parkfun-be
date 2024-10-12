import { IsBoolean, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";

export class SearchParkingLocationDto {
  @IsNumber()
  @IsOptional()
  public lat?: number;

  @IsNumber()
  @IsOptional()
  public lng?: number;

  @ValidateIf((obj) => obj.lat && obj.lng)
  @IsNumber()
  @IsOptional()
  public radius?: number;

  @IsOptional()
  @IsNumber()
  public startAt?: number;

  @IsOptional()
  @IsNumber()
  public endAt?: number;

  @IsOptional()
  @IsBoolean()
  public isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  public priceStartAt?: number;

  @IsOptional()
  @IsNumber()
  public priceEndAt?: number;

  @IsOptional()
  @IsNumber()
  public width?: number;

  @IsOptional()
  @IsNumber()
  public length?: number;

  @IsOptional()
  @IsNumber()
  public height?: number;

  @IsOptional()
  @IsNumber()
  public type?: number;

  @IsOptional()
  @IsString()
  public services?: string;
}
