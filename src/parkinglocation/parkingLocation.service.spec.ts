import { Test, TestingModule } from "@nestjs/testing";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ParkingLocationService } from "./parkingLocation.service";
import { ParkingLocation } from "./parkingLocation.entity";
import { PricingOptionService } from "../pricingOption/pricingOption.service";
import { PaymentMethodService } from "../paymentMethod/paymentMethod.service";
import { PartnerService } from "src/partner/partner.service";
import { Partner } from "src/partner/partner.entity";

describe("ParkingLocationService", () => {
  let service: ParkingLocationService;
  let parkingLocationRepository: Repository<ParkingLocation>;
  let pricingOptionService: PricingOptionService;
  let paymentMethodService: PaymentMethodService;
  let mockDataSource: DataSource;

  beforeEach(async () => {
    const mockQueryBuilder: Partial<SelectQueryBuilder<Partner>> = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: 1,
        name: "Test Partner",
        user: { id: 1, name: "Test User" },
      }),
    };
    mockDataSource = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      manager: {
        transaction: jest.fn().mockImplementation((cb) => cb()),
      },
    } as unknown as DataSource;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParkingLocationService,
        {
          provide: getRepositoryToken(ParkingLocation),
          useClass: Repository,
        },
        {
          provide: PricingOptionService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: PaymentMethodService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: PartnerService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ParkingLocationService>(ParkingLocationService);
    parkingLocationRepository = module.get<Repository<ParkingLocation>>(getRepositoryToken(ParkingLocation));
    pricingOptionService = module.get<PricingOptionService>(PricingOptionService);
    paymentMethodService = module.get<PaymentMethodService>(PaymentMethodService);
  });

  describe("findOne", () => {
    it("should find one parking location by ID", async () => {
      const mockId = 1;
      const mockLocation = { id: 1, name: "Test Location" } as ParkingLocation;

      jest.spyOn(parkingLocationRepository, "findOne").mockResolvedValue(mockLocation);

      const result = await service.findOne(mockId);

      expect(parkingLocationRepository.findOne).toHaveBeenCalledWith({
        relations: expect.any(Object),
        where: { id: mockId },
      });
      expect(result).toEqual(mockLocation);
    });
  });

  describe("update", () => {
    it("should update a parking location", async () => {
      const mockId = 1;
      const mockUpdateData = { name: "Updated Location", pricingOptionId: 1, paymentMethodId: 1 };
      const mockPricingOption = {
        id: 1,
        name: "fixed",
        value: 10,
        description: "This is a test pricing option decription",
        parkingLocations: [],
      };
      const mockPaymentMethod = {
        id: 1,
        name: "stripe",
        description: "Test desciption for stripe payment method",
        createAt: new Date(),
      };

      jest.spyOn(pricingOptionService, "get").mockResolvedValue(mockPricingOption);
      jest.spyOn(paymentMethodService, "get").mockResolvedValue(mockPaymentMethod);
      jest.spyOn(parkingLocationRepository, "save").mockResolvedValue({ id: mockId } as ParkingLocation);

      const result = await service.update(mockId, mockUpdateData as any);

      expect(pricingOptionService.get).toHaveBeenCalledWith(mockUpdateData.pricingOptionId);
      expect(paymentMethodService.get).toHaveBeenCalledWith(mockUpdateData.paymentMethodId);
      expect(parkingLocationRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: mockId });
    });
  });

  describe("remove", () => {
    it("should remove a parking location by ID", async () => {
      const mockId = 1;

      jest.spyOn(parkingLocationRepository, "delete").mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.remove(mockId);

      expect(parkingLocationRepository.delete).toHaveBeenCalledWith(mockId);
      expect(result).toEqual("Successfully delete parking location");
    });

    it("should throw NotFoundException if parking location not found", async () => {
      const mockId = 1;

      jest.spyOn(parkingLocationRepository, "delete").mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.remove(mockId)).rejects.toThrow("Parking location not found");
    });
  });
});
