import { IsNumber, IsOptional, IsString, IsUrl } from "class-validator";
import { CreateUserDto } from "src/user/dtos/createUser.dto";

export class CreatePartnerDto extends CreateUserDto {
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
