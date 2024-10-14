import { ParkingService } from "src/parkingService/parkingService.entity";
import { setSeederFactory } from "typeorm-extension";

export default setSeederFactory(ParkingService, (faker) => {
  const parkingService = new ParkingService();
  parkingService.name = faker.company.catchPhrase();
  parkingService.description = faker.commerce.productDescription();
  return parkingService;
});
