import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { PartnerService } from "./partner.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Partner } from "./partner.entity";
import { PartnerTypeService } from "../partnerType/partnerType.service";
import { UserService } from "../user/user.service";
import { DataSource, Repository } from "typeorm";
import { CreatePartnerDto } from "./dto/createPartner.dto";
import { UpdatePartnerDto } from "./dto/updatePartner.dto";
import { SearchPartnerDto } from "./dto/searchPartner.dto";
import { PageOptionsDto } from "../utils/dtos/pageOption.dto";
import { NotFoundException } from "@nestjs/common";
import { Order } from "src/utils/enums";
import { MailService } from "src/mail/mail.service";
import { ConfigService } from "@nestjs/config";

describe("PartnerService", () => {
  let service: PartnerService;
  let partnerRepository: Repository<Partner>;
  let partnerTypeService: PartnerTypeService;
  let userService: UserService;
  let dataSource: DataSource;

  const mockPartner = {
    id: 1,
    name: "Test Partner",
    type: { id: 1, name: "Test Type" },
    user: { id: 1, name: "Test User", email: "test@example.com" },
  };

  const mockPartnerRepository = {
    create: jest.fn().mockReturnValue(mockPartner),
    save: jest.fn().mockResolvedValue(mockPartner),
    findOne: jest.fn().mockResolvedValue(mockPartner),
    findOneBy: jest.fn().mockResolvedValue(mockPartner),
    findAndCount: jest.fn().mockResolvedValue([[mockPartner], 1]),
    preload: jest.fn().mockResolvedValue(mockPartner),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockPartnerTypeService = {
    get: jest.fn().mockResolvedValue({ id: 1, name: "Test Type" }),
  };

  const mockUserService = {
    create: jest.fn().mockResolvedValue({ id: 1, name: "Test User" }),
    delete: jest.fn().mockResolvedValue(true),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    }),
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoinAndSelect: jest.fn().mockReturnThis(),
    }),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mockJwtToken"),
  };

  const mockMailService = {
    sendUserConfirmation: jest.fn().mockResolvedValue(true),
  };
  const mockConfigService = {
    get: jest.fn().mockReturnValue("testConfigValue"),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        PartnerService,
        {
          provide: getRepositoryToken(Partner),
          useValue: mockPartnerRepository,
        },
        {
          provide: PartnerTypeService,
          useValue: mockPartnerTypeService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<PartnerService>(PartnerService);
    partnerRepository = module.get<Repository<Partner>>(getRepositoryToken(Partner));
    partnerTypeService = module.get<PartnerTypeService>(PartnerTypeService);
    userService = module.get<UserService>(UserService);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe("create", () => {
    it("should create a new partner successfully", async () => {
      const createPartnerDto: CreatePartnerDto = {
        name: "New Partner",
        email: "new@example.com",
        password: "password123",
        phoneNumber: "1234567890",
        typeId: 1,
        location: "Somewhere on Earth",
      };

      const result = await service.create(createPartnerDto);

      expect(result).toEqual(mockPartner);
      expect(partnerTypeService.get).toHaveBeenCalledWith({ id: createPartnerDto.typeId });
      expect(userService.create).toHaveBeenCalled();
      expect(partnerRepository.create).toHaveBeenCalled();
      expect(partnerRepository.save).toHaveBeenCalled();
    });

    it("should throw an error if creation fails", async () => {
      const createPartnerDto: CreatePartnerDto = {
        name: "New Partner",
        email: "new@example.com",
        password: "password123",
        phoneNumber: "1234567890",
        typeId: 1,
        location: "Somewhere on Earth",
      };

      jest.spyOn(partnerRepository, "save").mockRejectedValueOnce(new Error("Database error"));

      await expect(service.create(createPartnerDto)).rejects.toThrow("Database error");
    });
  });

  describe("findAll", () => {
    it("should return a page of partners", async () => {
      const searchPartnerDto: SearchPartnerDto = { field: "name", keyword: "Test", typeId: 1 };
      const pageOptionsDto: PageOptionsDto = { skip: 0, take: 10, order: Order.ASC, orderBy: "id" };

      const result = await service.findAll(searchPartnerDto, pageOptionsDto);

      expect(result.data).toEqual([mockPartner]);
      expect(result.meta.itemCount).toBe(1);
      expect(partnerRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe("findOneById", () => {
    it("should return a partner by id", async () => {
      const result = await service.findOneById(1);

      expect(result).toEqual(mockPartner);
      expect(partnerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: {
          user: {
            image: true,
          },
          type: true,
        },
      });
    });

    it("should throw NotFoundException if partner not found", async () => {
      jest.spyOn(partnerRepository, "findOne").mockResolvedValueOnce(null);

      await expect(service.findOneById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a partner successfully", async () => {
      const updatePartnerDto: UpdatePartnerDto = {
        name: "Updated Partner",
        phoneNumber: "9876543210",
        typeId: 2,
      };

      const result = await service.update(1, updatePartnerDto);

      expect(result).toEqual(mockPartner);
      expect(partnerRepository.preload).toHaveBeenCalled();
      expect(partnerRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException if partner not found", async () => {
      jest.spyOn(partnerRepository, "findOne").mockResolvedValue(undefined);
      await expect(service.update(0, { name: "Updated Partner" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("should delete a partner successfully", async () => {
      const result = await service.delete(1);
      expect(result).toBe("Successfully delete partner");
      expect(userService.delete).toHaveBeenCalled();
      expect(partnerRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException if partner not found", async () => {
      jest.spyOn(partnerRepository, "findOneBy").mockResolvedValue(undefined);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if delete operation affects no rows", async () => {
      jest.spyOn(partnerRepository, "delete").mockResolvedValueOnce({ affected: 0, raw: {} });
      jest.spyOn(partnerRepository, "findOne").mockResolvedValue(undefined);
      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getFullPartnerQuery", () => {
    it("should return a query builder for full partner data", () => {
      const result = service.getFullPartnerQuery();

      expect(dataSource.createQueryBuilder).toHaveBeenCalledWith(Partner, "partner");
      expect(result.innerJoinAndSelect).toHaveBeenCalledTimes(3);
    });
  });
});
