import { Test, TestingModule } from "@nestjs/testing";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "src/user/user.entity";
import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import { Partner } from "src/partner/partner.entity";
import { Booking } from "src/booking/booking.entity";
import { StatisticService } from "./statistics.service";
import { Period } from "src/utils/enums";

describe("StatisticService", () => {
  let service: StatisticService;
  let userRepository: Repository<User>;
  let bookingRepository: Repository<Booking>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ParkingLocation),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Partner),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Booking),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<StatisticService>(StatisticService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
  });

  describe("getStatistics", () => {
    it("should return statistics", async () => {
      jest.spyOn(service, "getNewCustomersCount").mockResolvedValue(10);
      jest.spyOn(service, "getNewParkingLocationsCount").mockResolvedValue(5);
      jest.spyOn(service, "getNewPartnersCount").mockResolvedValue(3);
      jest.spyOn(service, "getBookingsCount").mockResolvedValue(20);
      jest.spyOn(service, "getTotalIncome").mockResolvedValue(1000);

      const result = await service.getStatistics(new Date("2023-01-01"), new Date("2023-01-31"));

      expect(result).toEqual({
        newCustomersCount: 10,
        newParkingLocationsCount: 5,
        newPartnersCount: 3,
        bookingsCount: 20,
        totalIncome: 1000,
      });
    });
  });

  describe("getCustomerData", () => {
    it("should return customer data grouped by the given period", async () => {
      const mockData = [{ period: "2023-01-01", amount: 5 }];
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockData),
      };

      jest.spyOn(userRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as any);

      const result = await service.getCustomerData(new Date("2023-01-01"), new Date("2023-01-31"), Period.DAY);

      expect(result).toEqual([
        { label: "New user by date", data: mockData },
        { label: "Total user by date", data: [{ period: "2023-01-01", amount: 5 }] },
      ]);
    });
  });

  describe("getBookingsData", () => {
    it("should return booking data grouped by the given period", async () => {
      const mockData = [{ period: "2023-01-01", amount: 10 }];
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockData),
      };

      jest.spyOn(bookingRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as any);

      const result = await service.getBookingsData(new Date("2023-01-01"), new Date("2023-01-31"), Period.DAY);

      expect(result).toEqual([
        { label: "New bookings", data: mockData },
        { label: "Total bookings", data: [{ period: "2023-01-01", amount: 10 }] },
      ]);
    });
  });

  describe("getTotalIncome", () => {
    it("should return total income between given dates", async () => {
      const mockIncome = { totalIncome: "1500" };
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockIncome),
      };

      jest.spyOn(bookingRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as any);

      const result = await service.getTotalIncome(new Date("2023-01-01"), new Date("2023-01-31"));

      expect(result).toEqual(1500);
    });
  });
});
