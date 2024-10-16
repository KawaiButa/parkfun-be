import { IsDate, IsEnum, ValidateIf } from "class-validator";
import { Period } from "src/utils/enums";

export class StatisticsDateDto {
  @IsEnum(Period)
  period: Period = Period.MONTH;

  @IsDate()
  @ValidateIf((obj) => obj.endAt && obj.period === Period.MONTH)
  startAt: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  @IsDate()
  @ValidateIf((obj) => obj.startAt && obj.period === Period.MONTH)
  endAt: Date = new Date();
}
