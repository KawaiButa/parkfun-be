import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Image } from "src/image/image.entity";
import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";

export default class ImageSeeder1698765439 implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const imageFactory = factoryManager.get(Image);
    const parkingLocationRepository = dataSource.getRepository(ParkingLocation);
    const parkingLocations = await parkingLocationRepository.find();
    const parkingLocationImages = (
      await Promise.all(
        parkingLocations.map((location) => {
          return imageFactory.saveMany(4, {
            parkingLocation: location,
          });
        })
      )
    ).flat();
    const images = await imageFactory.saveMany(200);
    return parkingLocationImages.concat(images);
  }
}
