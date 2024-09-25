import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SignupModule } from "./signup/signup.module";
import { AccountModule } from "./account/account.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import typeormConfig from "./config/typeormConfig";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeormConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get("typeorm"),
    }),
    DatabaseModule,
    AuthModule,
    SignupModule,
    AccountModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
