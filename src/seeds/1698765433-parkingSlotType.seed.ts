import { ParkingSlotType } from "src/parkingSlotType/parkingSlotType.entity";
import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";

export default class ParkingSlotTypeSeeder1698765433 implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(ParkingSlotType);
    const insertResult = await repository.insert(
      repository.create([
        {
          name: "Garage",
          description:
            "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eligendi odio dolor debitis vel beatae placeat? Architecto soluta eius cumque quo inventore iusto praesentium, expedita dolores minima earum sed, alias rerum!",
        },
        {
          name: "On-street",
          description:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia non quidem est laboriosam commodi dolor. Commodi quasi velit illo repellendus laboriosam quos expedita, placeat, rem reiciendis ratione soluta id sapiente.",
        },
        {
          name: "Indoor",
          description:
            " Lorem ipsum, dolor sit amet consectetur adipisicing elit. Minima veniam, adipisci ut laboriosam accusantium ipsam aliquam quibusdam assumenda maiores, illo at culpa reiciendis hic. Ullam incidunt perspiciatis laudantium velit doloremque.",
        },
      ])
    );
    return insertResult.identifiers;
  }
}
