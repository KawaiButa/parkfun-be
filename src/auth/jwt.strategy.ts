import { Controller, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy, ExtractJwt } from "passport-jwt";
import { User } from "src/user/user.entity";
import { Repository } from "typeorm";

@Controller()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { id: number }) {
    const { id } = payload;
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        partner: true,
        role: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException("You have to login first");
    }
    return;
  }
}
