import { IsOptional, IsString } from "class-validator";
import { AnyOf } from "src/decorators/anyOf";

@AnyOf(["name", "email", "phoneNumber"])
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  image?: string;
}
