import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";
import { PartnerType } from "src/partnerType/partnerType.entity";

export default class PartnerTypeSeeder1698765434 implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(PartnerType);
    const insertResult = await repository.insert(
      repository.create([
        {
          name: "Individual",
        },
        {
          name: "Company",
        },
      ])
    );
    return insertResult.identifiers;
  }
}
