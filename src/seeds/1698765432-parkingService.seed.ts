import { ParkingService } from "src/parkingService/parkingSerivce.entity";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";

export default class ParkingServiceSeeder1698765432 implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<ParkingService[]> {
    const parkingServiceFactory = factoryManager.get(ParkingService);
    const parkingService = await parkingServiceFactory.saveMany(10);
    return parkingService;
  }
}
