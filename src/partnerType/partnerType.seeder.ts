import { Seeder } from "typeorm-extension";
import { DataSource } from "typeorm";
import { PartnerType } from "./partnerType.entity";
export default class PartnerTypeSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    await dataSource.query('TRUNCATE "partner_type" RESTART IDENTITY;');

    const repository = dataSource.getRepository(PartnerType);
    await repository.insert([
      {
        name: "Individual",
      },
      {
        name: "Company",
      },
    ]);
  }
}
