import { IsEmail, IsNumberString, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsNumberString()
  phoneNumber?: string;

  @IsString()
  role: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  image?: string;
}
