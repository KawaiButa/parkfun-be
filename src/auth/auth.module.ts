import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/user.entity";
import { JWTStrategy } from "./jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";
import { RoleModule } from "src/role/role.module";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>("JWT_SECRET"),
          signOptions: {
            expiresIn: config.get<string | number>("JWT_EXPIRES"),
          },
        };
      },
    }),
    MailModule,
    TypeOrmModule.forFeature([User]),
    UserModule,
    RoleModule,
  ],
  controllers: [AuthController, JWTStrategy],
  providers: [AuthService, JWTStrategy, PassportModule, ConfigService],
})
export class AuthModule {}
