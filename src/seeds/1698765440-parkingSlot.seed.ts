import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { ParkingSlotType } from "src/parkingSlotType/parkingSlotType.entity";
import { ParkingService } from "src/parkingService/parkingService.entity";
import { shuffle, take } from "lodash";
import { Image } from "src/image/image.entity";

export default class ParkingSlot1698765440 implements Seeder {
  track = false;

  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const parkingLocationRepository = dataSource.getRepository(ParkingLocation);
    const parkingSlotTypeRepository = dataSource.getRepository(ParkingSlotType);
    const parkingServiceRepository = dataSource.getRepository(ParkingService);
    const imageRepository = dataSource.getRepository(Image);

    const parkingSlotFactory = factoryManager.get(ParkingSlot);
    const [parkingSlotTypes, parkingServices, images] = await Promise.all([
      parkingSlotTypeRepository.find(),
      parkingServiceRepository.find(),
      imageRepository.find(),
    ]);
    let i = 0;
    while (true) {
      const parkingLocations = await parkingLocationRepository.find({ skip: i, take: 1000 });
      await Promise.all(
        parkingLocations.flatMap((parkingLocation) => {
          Array.from(Array(Math.floor(Math.random() * 5))).map(() => {
            const services = take(
              shuffle(parkingServices),
              Math.floor(Math.random() * parkingServices.length)
            ) as ParkingService[];
            const image = take(shuffle(images), 4);
            return parkingSlotFactory.saveMany(10 + Math.round(Math.random() * 5), {
              parkingLocation: parkingLocation,
              type: parkingSlotTypes[0],
              isAvailable: true,
              services: services,
              images: image,
            });
          });
        })
      );
      if (parkingLocations.length == 0) break;
      else i += parkingLocations.length;
    }
    return true;
  }
}
