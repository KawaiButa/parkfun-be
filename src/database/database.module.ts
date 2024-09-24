import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import * as dotenv from "dotenv";
import { RegisterSubcriber } from "src/register/subcribers/register.subcriber";

dotenv.config({ path: ".env" });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [join(__dirname, "**", "*.entity.{ts,js}")],
      migrations: [join(__dirname, "**", "*.migrations.{ts,js}")],
      synchronize: process.env.IS_PRODUCTION == "false",
      migrationsRun: true,
      logging: true,
      subscribers: [RegisterSubcriber],
    }),
  ],
})
export class DatabaseModule {}
