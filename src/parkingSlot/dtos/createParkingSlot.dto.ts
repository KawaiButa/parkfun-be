import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString, IsUrl } from "class-validator";

export class CreateParkingSlotDto {
  @IsNumber()
  @IsNotEmpty()
  parkingLocationId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  parkingSlotTypeId: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  width: number;

  @IsNumber()
  @IsNotEmpty()
  length: number;

  @IsNumber()
  @IsNotEmpty()
  height: number;

  @IsNumber()
  startAt: number;

  @IsNumber()
  endAt: number;

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  images: string[];

  @IsArray()
  @IsNumber({}, { each: true })
  parkingServiceIds: number[];

  @IsNumber()
  @IsNotEmpty()
  space: number;
}
