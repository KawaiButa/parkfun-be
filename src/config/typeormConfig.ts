import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from "dotenv";
import { RegisterSubcriber } from "src/auth/subcribers/register.subcriber";
import { DataSource, DataSourceOptions } from "typeorm";

dotenvConfig({ path: ".env" });

const config = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: `${process.env.DB_USER}`,
  password: `${process.env.DB_PASSWORD}`,
  database: `${process.env.DB_NAME}`,
  entities: ["dist/**/*.entity{.ts,.js}"],
  migrations: ["dist/migrations/*{.ts,.js}"],
  autoLoadEntities: true,
  synchronize: process.env.IS_PRODUCTION == "false",
  subscribers: [RegisterSubcriber],
};
export default registerAs("typeorm", () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
