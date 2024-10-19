import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";

export class SearchPartnerDto {
  @IsOptional()
  @IsString()
  field?: string;

  @ValidateIf((obj) => obj.field)
  @IsString()
  @IsNotEmpty()
  keyword?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  typeId?: number;
}
