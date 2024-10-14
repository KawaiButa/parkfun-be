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
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Error voluptate facere delectus omnis est quae atque accusantium! Quasi, magni quos repellendus eum, vitae repudiandae eius, amet delectus voluptas at dicta.",
        },
        {
          name: "Fixed",
          value: 5,
          description:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, quos obcaecati, voluptate placeat minima quo quae, aliquam magni quia minus impedit. Quis amet distinctio nostrum officiis exercitationem porro, nobis debitis!",
        },
      ])
    );
    return insertResult.identifiers;
  }
}
