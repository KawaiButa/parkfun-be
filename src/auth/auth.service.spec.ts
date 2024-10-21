import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";
import { SignUpDto } from "./dtos/signup.dto";
import * as bcrypt from "bcrypt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { MailService } from "src/mail/mail.service";

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let userService: UserService;

  const mockUser = {
    id: 1,
    name: "testUser",
    email: "test@example.com",
    password: bcrypt.hashSync("password", 10),
    role: {
      id: 1,
      name: "user",
    },
    phoneNumber: "testPhoneNumber",
  } as User;

  const mockUserRepository = {
    findOne: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("testToken"),
  };

  const mockUserService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findOneBy: jest.fn().mockResolvedValue(mockUser),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === "GOOGLE_AUTH_CLIENT_ID") return "testClientId";
      if (key === "GOOGLE_AUTH_CLIENT_SECRET") return "testClientSecret";
      return "";
    }),
  };
  const mockMailService = {
    sendUserConfirmation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userService = module.get<UserService>(UserService);
  });

  describe("login", () => {
    it("should return access token and user for valid credentials", async () => {
      const loginDto: LoginDto = {
        email: mockUser.email,
        password: "password",
      };

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe("testToken");
      expect(result.user).toEqual(mockUser);
    });

    it("should throw UnauthorizedException for invalid email", async () => {
      jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

      const loginDto: LoginDto = {
        email: "invalid@example.com",
        password: "password",
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for invalid password", async () => {
      const loginDto: LoginDto = {
        email: mockUser.email,
        password: "wrongpassword",
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("register", () => {
    it("should create a new user and return access token", async () => {
      const signUpDto: SignUpDto = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
        confirmPassword: "password123",
        phoneNumber: "1234567890",
      };

      const result = await service.register(signUpDto);

      expect(result.user).toEqual(mockUser);
      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: signUpDto.name,
          email: signUpDto.email,
          phoneNumber: signUpDto.phoneNumber,
          role: "user",
        })
      );
    });

    it("should throw ConflictException when passwords don't match", async () => {
      const signUpDto: SignUpDto = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
        confirmPassword: "password456",
        phoneNumber: "1234567890",
      };

      await expect(service.register(signUpDto)).rejects.toThrow(ConflictException);
    });
  });
});
