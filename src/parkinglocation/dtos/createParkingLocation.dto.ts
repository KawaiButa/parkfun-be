import { IsAlpha, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateParkingLocationDto {
  @IsString()
  @IsAlpha()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  access: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  pricingOptionId: number;

  @IsNumber()
  @IsNotEmpty()
  paymentMethodId: number;
}
