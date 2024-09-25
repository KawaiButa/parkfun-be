import { IsAlpha, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsAlpha()
  @IsNotEmpty()
  name: string;
}
