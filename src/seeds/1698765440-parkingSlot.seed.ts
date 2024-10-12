import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { ParkingSlotType } from "src/parkingSlotType/parkingSlotType.entity";
import { ParkingService } from "src/parkingService/parkingSerivce.entity";
import { shuffle, take } from "lodash";

export default class ParkingSlot1698765440 implements Seeder {
  track = false;

  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const parkingLocationRepository = dataSource.getRepository(ParkingLocation);
    const parkingSlotTypeRepository = dataSource.getRepository(ParkingSlotType);
    const parkingServiceRepository = dataSource.getRepository(ParkingService);

    const parkingSlotFactory = factoryManager.get(ParkingSlot);
    const [parkingLocations, parkingSlotTypes, parkingServices] = await Promise.all([
      parkingLocationRepository.find(),
      parkingSlotTypeRepository.find(),
      parkingServiceRepository.find(),
    ]);
    const parkingSlots = await Promise.all(
      parkingLocations.flatMap((parkingLocation) => {
        const services = take(shuffle(parkingServices), Math.floor(Math.random() * parkingServices.length));
        return parkingSlotFactory.saveMany(10, {
          parkingLocation: parkingLocation,
          type: parkingSlotTypes[0],
          isAvailable: true,
          services: services,
        });
      })
    );
    return parkingSlots;
  }
}
