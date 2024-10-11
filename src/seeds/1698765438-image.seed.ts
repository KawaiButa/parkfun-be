import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Image } from "src/image/image.entity";

export default class ImageSeeder1698765438 implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const imageFactory = factoryManager.get(Image);
    imageFactory.saveMany(1000);
  }
}
