import { Module } from "@nestjs/common";
import { RegisterService } from "./register.service";
import { RegisterController } from "./register.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "src/account/entities/account.entity";
import { AccountService } from "src/account/account.service";
import { User } from "src/user/entities/user.entity";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [TypeOrmModule.forFeature([Account, User])],
  controllers: [RegisterController],
  providers: [RegisterService, AccountService, JwtService],
})
export class registerModule {}
