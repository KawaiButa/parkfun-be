import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class UpdateAccountDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}
