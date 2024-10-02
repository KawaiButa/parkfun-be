import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import JwtAuthenticationGuard from "src/auth/jwt.guard";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [JwtAuthenticationGuard, UserService],
  controllers: [UserController],
})
export class UserModule {}
