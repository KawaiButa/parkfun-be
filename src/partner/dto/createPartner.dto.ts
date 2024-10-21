import { OmitType } from "@nestjs/mapped-types";
import { IsNumber, IsOptional, IsString, IsUrl } from "class-validator";
import { CreateUserDto } from "src/user/dtos/createUser.dto";

export class CreatePartnerDto extends OmitType(CreateUserDto, ["role"]) {
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  typeId: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  image?: string;
}
