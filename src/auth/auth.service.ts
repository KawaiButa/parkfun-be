import {
  BadRequestException,
  Body,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { SignUpDto } from "./dtos/signup.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "src/user/user.entity";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dtos/login.dto";
import { google, Auth } from "googleapis";
import { LoginWithGoogleDto } from "./dtos/loginWithGoogle.dto";
import { ConfigService } from "@nestjs/config";
import { UserService } from "src/user/user.service";
import { MailService } from "src/mail/mail.service";

@Injectable()
export class AuthService {
  oauthClient: Auth.OAuth2Client;
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private userService: UserService,
    private mailService: MailService,
    private configService: ConfigService
  ) {
    const clientID = this.configService.get("GOOGLE_AUTH_CLIENT_ID");
    const clientSecret = this.configService.get("GOOGLE_AUTH_CLIENT_SECRET");
    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({
      where: { email },
      relations: {
        partner: true,
        role: true,
        image: true,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid email or password");
    if (!user.isVerified) throw new UnauthorizedException("This account is not verified");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }
    const accessToken = this.jwtService.sign({ id: user.id, role: user.role.name, partner: user.partner });
    return { accessToken, user };
  }

  async register(signUpDto: SignUpDto) {
    const { password, email, confirmPassword, ...props } = signUpDto;
    if (password !== confirmPassword) {
      throw new ConflictException("Password and confirmPassword do not match");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create({ ...props, email, password: hashedPassword, role: "user" });
    const verificationToken = this.jwtService.sign(
      { id: user.id, email: user.email },
      {
        secret: this.configService.get("MAIL_VERFICATION_SECRET"),
        expiresIn: +this.configService.get("MAIL_VERFICATION_EXPIRES"),
      }
    );
    await this.mailService.sendUserConfirmation(user, verificationToken);
    return { user };
  }
  async resentEmailVerification(email: string) {
    const user = await this.userService.getOneBy({ email: email });
    if (!user) throw new BadRequestException("User not found");
    const verificationToken = this.jwtService.sign(
      { id: user.id, email: user.email },
      {
        secret: this.configService.get("MAIL_VERFICATION_SECRET"),
        expiresIn: +this.configService.get("MAIL_VERFICATION_EXPIRES"),
      }
    );
    await this.mailService.sendUserConfirmation(user, verificationToken);
    return "Email verification link has been sent";
  }
  async loginWithGoogle(@Body() loginWithGoogleDto: LoginWithGoogleDto) {
    const { credential, clientId } = loginWithGoogleDto;
    const authResult = await this.oauthClient
      .verifyIdToken({ idToken: credential, audience: clientId })
      .catch((err: Error) => {
        if (err.message) {
          throw new UnauthorizedException("Invalid credentials");
        }
        throw new InternalServerErrorException();
      });
    const { email, name, iss } = authResult.getPayload();
    let user = await this.userRepository.findOneBy({ email });
    const hashedPassword = await bcrypt.hash(iss, 10);
    if (!user) {
      user = await this.userService.create({ name, email, password: hashedPassword, role: "user" });
    }
    const accessToken = this.jwtService.sign({ id: user.id, email: user.email, role: "user" });
    return { accessToken, user };
  }
  async verifyUser(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get("MAIL_VERFICATION_SECRET"),
      });
      const user = await this.userService.getOne(payload.id);
      if (!user) throw new BadRequestException("Invalid token");
      this.userService.update(user.id, { isVerified: true });
      return "Successfully verify user account";
    } catch {
      throw new UnauthorizedException();
    }
  }
}
