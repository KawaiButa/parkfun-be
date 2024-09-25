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

@Injectable()
export class AuthService {
  oauthClient: Auth.OAuth2Client;
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
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
    const accessToken = this.jwtService.sign({ id: user.id });
    return { accessToken };
  }

  async register(signUpDto: SignUpDto) {
    const { password, email, name } = signUpDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const isExisted = await this.userRepository.countBy({ email });
    if (isExisted) {
      throw new ConflictException("Email already exists");
    }
    const user = await this.createUser({ name, email, password: hashedPassword });
    const accessToken = this.jwtService.sign({ id: user.id });
    return { accessToken };
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
    const { email, name } = authResult.getPayload();
    let user = await this.userRepository.findOneBy({ email });
    if (!user) {
      user = await this.createUser({ name, email, password: null });
    }
    const accessToken = this.jwtService.sign({ id: user.id });
    return { accessToken };
  }

  async createUser({ name, email, password }: { name: string; email: string; password: string }): Promise<User> {
    const user = await this.userRepository.create({
      name,
      email,
      password,
    });
    return await this.userRepository.save(user);
  }
}
