import { IsNotEmpty, IsString } from "class-validator";

export class LoginWithGoogleDto {
  @IsString()
  @IsNotEmpty()
  credential: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;
}
