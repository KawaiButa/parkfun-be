import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "./role.entity";
import { Module } from "@nestjs/common";
import { RoleService } from "./role.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "src/user/user.entity";

@Module({
  imports: [
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
    TypeOrmModule.forFeature([User, Role]),
  ],
  providers: [RoleService, JwtService],
  exports: [RoleService],
})
export class RoleModule {}
