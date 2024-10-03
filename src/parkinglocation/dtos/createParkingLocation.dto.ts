import { ArrayMaxSize, ArrayMinSize, IsAlpha, IsArray, IsNotEmpty, IsNumber, IsString, IsUrl } from "class-validator";

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

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  images: string[];
}
