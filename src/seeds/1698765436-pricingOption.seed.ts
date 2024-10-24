import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";
import { PricingOption } from "src/pricingOption/pricingOption.entity";

export default class PricingOptionSeeder1698765436 implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(PricingOption);
    const insertResult = await repository.insert(
      repository.create([
        {
          name: "Percentage",
          value: 10,
          description:
            "Partner pays a percentage of the transaction amount or sale value. It is recommended for partners who have High-value transactions with varying amounts.",
        },
        {
          name: "Fixed",
          value: 5,
          description:
            "Partner pays a set amount regardless of transaction value. Consider this option When your costs are relatively constant",
        },
      ])
    );
    return insertResult.identifiers;
  }
}
