import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Order } from "../enums";

export class PageOptionsDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  readonly take?: number = 10;

  @IsString()
  @IsOptional()
  orderBy?: string = "id";

  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;
  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
