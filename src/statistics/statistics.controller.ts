import { Controller, Get, Query } from "@nestjs/common";
import { StatisticService } from "./statistics.service";
import { StatisticsDateDto } from "./dtos/statisticDate.dto";

@Controller("statistics")
export class StatisticController {
  constructor(private statisticService: StatisticService) {}

  @Get()
  async getAllStatistics(@Query() dateQuery: StatisticsDateDto) {
    const { startAt, endAt } = dateQuery;
    return this.statisticService.getStatistics(startAt, endAt);
  }

  @Get("users")
  async getCustomerData(@Query() dateQuery: StatisticsDateDto) {
    const { startAt, endAt, period } = dateQuery;
    return this.statisticService.getCustomerData(startAt, endAt, period);
  }

  @Get("parking-locations")
  async getParkingLocationData(@Query() dateQuery: StatisticsDateDto) {
    const { startAt, endAt, period } = dateQuery;
    return this.statisticService.getParkingLocationData(startAt, endAt, period);
  }

  @Get("partners")
  async getPartnerData(@Query() dateQuery: StatisticsDateDto) {
    const { startAt, endAt, period } = dateQuery;
    return this.statisticService.getPartnerData(startAt, endAt, period);
  }

  @Get("incomes")
  async getIncome(@Query() dateQuery: StatisticsDateDto) {
    const { startAt, endAt, period } = dateQuery;
    return this.statisticService.getIncome(startAt, endAt, period);
  }

  @Get("bookings")
  async getBookings(@Query() dataQuery: StatisticsDateDto) {
    const { startAt, endAt, period } = dataQuery;
    return this.statisticService.getBookingsData(startAt, endAt, period);
  }
}
