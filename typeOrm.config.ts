import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";

config();
const configService = new ConfigService();

export default new DataSource({
  type: "postgres",
  host: configService.get("DB_HOST"),
  port: parseInt(configService.get("DB_PORT")),
  username: configService.get("DB_USER"),
  password: configService.get("DB_PASSWORD"),
  database: configService.get("DB_NAME"),
  migrations: ["dist/src/migrations/*{.ts,.js}"],
  entities: ["dist/src/**/*.entity.{js,ts}"],
});
