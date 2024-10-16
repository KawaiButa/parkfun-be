import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { User } from "src/user/user.entity";
import { Partner } from "src/partner/partner.entity";
import { Booking, BookingStatus } from "src/booking/booking.entity";
import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import { Period } from "src/utils/enums";

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ParkingLocation)
    private parkingLocationRepository: Repository<ParkingLocation>,
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>
  ) {}

  async getStatistics(fromDate: Date, toDate: Date) {
    return {
      newCustomersCount: await this.getNewCustomersCount(fromDate, toDate),
      newParkingLocationsCount: await this.getNewParkingLocationsCount(fromDate, toDate),
      newPartnersCount: await this.getNewPartnersCount(fromDate, toDate),
      bookingsCount: await this.getBookingsCount(fromDate, toDate),
      totalIncome: await this.getTotalIncome(fromDate, toDate),
    };
  }

  async getCustomerData(fromDate: Date, toDate: Date, period: Period): Promise<any> {
    const query1 = this.userRepository
      .createQueryBuilder("user")
      .select(
        `DATE_TRUNC('${period}', user.createAt AT TIME ZONE 'UTC') as period,
    COUNT(*) as amount`
      )
      .groupBy(`DATE_TRUNC('${period}', user.createAt AT TIME ZONE 'UTC')`)
      .orderBy("period", "ASC");
    const labels = ["New user by date", "Total user by date"];
    const results = [await query1.getRawMany()];
    let sum = 0;
    results.push(
      results[0].map(({ period, amount }) => {
        sum = sum + +amount;
        return { period, amount: sum };
      })
    );
    return results.map((query, index) => ({ label: labels[index], data: query }));
  }

  async getParkingLocationData(fromDate: Date, toDate: Date, period: Period): Promise<any> {
    const results = [
      await this.parkingLocationRepository
        .createQueryBuilder("parkingLocation")
        .select(
          `
          DATE_TRUNC('${period}', parkingLocation.createAt AT TIME ZONE 'UTC') as period,
          COUNT(*) as amount
          `
        )
        .groupBy(`DATE_TRUNC('${period}', parkingLocation.createAt AT TIME ZONE 'UTC')`)
        .orderBy("period", "ASC")
        .getRawMany(),
    ];
    const labels = ["New parking location", "Total parking location"];
    let sum = 0;
    results.push(
      results[0].map(({ period, amount }) => {
        sum = sum + +amount;
        return { period, amount: sum };
      })
    );
    return results.map((query, index) => ({ label: labels[index], data: query }));
  }

  async getPartnerData(fromDate: Date, toDate: Date, period: Period): Promise<any> {
    const results = [
      await this.partnerRepository
        .createQueryBuilder("partner")
        .select(
          `
          DATE_TRUNC('${period}', partner.createAt AT TIME ZONE 'UTC') as period,
          COUNT(*) as amount
          `
        )
        .groupBy(`DATE_TRUNC('${period}', partner.createAt AT TIME ZONE 'UTC')`)
        .orderBy("period", "ASC")
        .getRawMany(),
    ];
    const labels = ["New partner", "Total partner"];
    let sum = 0;
    results.push(
      results[0].map(({ period, amount }) => {
        sum = sum + +amount;
        return { period, amount: sum };
      })
    );
    return results.map((query, index) => ({ label: labels[index], data: query }));
  }

  async getBookingsData(fromDate: Date, toDate: Date, period: Period): Promise<any> {
    const results = [
      await this.bookingRepository
        .createQueryBuilder("booking")
        .select(
          `
        DATE_TRUNC('${period}', booking.createAt AT TIME ZONE 'UTC') as period,
        COUNT(*) as amount
        `
        )
        .groupBy(`DATE_TRUNC('${period}', booking.createAt AT TIME ZONE 'UTC')`)
        .getRawMany(),
    ];
    const labels = ["New bookings", "Total bookings"];
    let sum = 0;
    results.push(
      results[0].map(({ period, amount }) => {
        sum = sum + +amount;
        return { period, amount: sum };
      })
    );
    return results.map((query, index) => ({ label: labels[index], data: query }));
  }

  async getIncome(fromDate: Date, toDate: Date, period: Period): Promise<any> {
    const results = [
      await this.bookingRepository
        .createQueryBuilder("booking")
        .select(`SUM(booking.amount) as amount, DATE_TRUNC('${period}', booking.createAt AT TIME ZONE 'UTC') as period`)
        .groupBy(`DATE_TRUNC('${period}', booking.createAt AT TIME ZONE 'UTC')`)
        .getRawMany(),
    ];
    const labels = ["Income", "Total income"];
    let sum = 0;
    results.push(
      results[0].map(({ period, amount }) => {
        sum = sum + +amount;
        return { period, amount: sum };
      })
    );
    return results.map((query, index) => ({ label: labels[index], data: query }));
  }

  private async getNewCustomersCount(startDate: Date, endDate: Date): Promise<number> {
    return this.userRepository.count({
      where: {
        createAt: Between(startDate, endDate),
        role: { name: "user" },
      },
    });
  }

  private async getNewParkingLocationsCount(startDate: Date, endDate: Date): Promise<number> {
    return this.parkingLocationRepository.count({
      where: {
        createAt: Between(startDate, endDate),
      },
    });
  }

  private async getNewPartnersCount(startDate: Date, endDate: Date): Promise<number> {
    return this.partnerRepository.count({
      where: {
        createAt: Between(startDate, endDate),
      },
    });
  }

  private async getBookingsCount(startDate: Date, endDate: Date): Promise<number> {
    return this.bookingRepository.count({
      where: {
        createAt: Between(startDate, endDate),
        status: BookingStatus.COMPLETED,
      },
    });
  }

  private async getTotalIncome(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.bookingRepository
      .createQueryBuilder("booking")
      .select("SUM(booking.amount)", "totalIncome")
      .where("booking.createAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .getRawOne();
    return +result.totalIncome || 0;
  }

  cumulativeSum(numbers) {
    const result = new Array(numbers.length);
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
      sum += numbers[i];
      result[i] = sum;
    }
    return result;
  }
}
