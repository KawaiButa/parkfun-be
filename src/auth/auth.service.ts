import {
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

@Injectable()
export class AuthService {
  oauthClient: Auth.OAuth2Client;
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService
  ) {
    const clientID = this.configService.get("GOOGLE_AUTH_CLIENT_ID");
    const clientSecret = this.configService.get("GOOGLE_AUTH_CLIENT_SECRET");
    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }
    const accessToken = this.jwtService.sign({ id: user.id, email: user.email });
    return { accessToken, user };
  }

  async register(signUpDto: SignUpDto) {
    const { password, email, name, confirmPassword, phoneNumber } = signUpDto;
    if (password !== confirmPassword) {
      throw new ConflictException("Password and confirmPassword do not match");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const isExisted = await this.userRepository.countBy({ email, phoneNumber });
    if (isExisted) {
      throw new ConflictException("An account registered with email or password has already exists");
    }
    const user = await this.userService.createUser({ name, email, password: hashedPassword, phoneNumber });
    const accessToken = this.jwtService.sign({ id: user.id, email: user.email });
    return { accessToken, user };
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
    const hashedPassword = bcrypt.hashSync(iss, 10);
    let user = await this.userRepository.findOneBy({ email });
    if (!user) {
      user = await this.userService.createUser({ name, email, password: hashedPassword });
    }
    const accessToken = this.jwtService.sign({ id: user.id, email: user.email });
    return { accessToken, user };
  }
}
