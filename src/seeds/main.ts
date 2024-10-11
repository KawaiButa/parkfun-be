import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { DataSourceOptions, DataSource } from "typeorm";
import { runSeeders, SeederOptions } from "typeorm-extension";

config();
const configService = new ConfigService();
const option: DataSourceOptions & SeederOptions = {
  type: "postgres",
  host: configService.get("DB_HOST"),
  port: configService.get("DB_PORT"),
  username: configService.get("DB_USER"),
  password: configService.get("DB_PASSWORD"),
  database: configService.get("DB_NAME"),
  migrations: ["dist/src/migrations/*{.ts,.js}"],
  entities: ["dist/src/**/*.entity.{js,ts}"],
  seeds: ["dist/src/**/*.seed{.ts,.js}"],
  factories: ["dist/src/factories/*{.ts,.js}"],
};

const dataSource = new DataSource(option);
dataSource.initialize().then(async () => {
  await runSeeders(dataSource);
  process.exit();
});
