import { IsEmail, IsNotEmpty, IsNumberString, IsString, ValidateIf } from "class-validator";
import { Match } from "src/decorators/match";

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match<SignUpDto>("password")
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateIf((value) => !!value.phoneNumber)
  @IsNumberString()
  phoneNumber?: string;
}
