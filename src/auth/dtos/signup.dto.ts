import { IsAlpha, IsEmail, IsNotEmpty, IsNumberString, IsString, ValidateIf } from "class-validator";

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsString()
  @IsAlpha()
  @IsNotEmpty()
  name: string;

  @ValidateIf((value) => !!value.phoneNumber)
  @IsNumberString()
  phoneNumber?: string;
}
