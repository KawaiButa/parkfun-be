import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { setSeederFactory } from "typeorm-extension";

export default setSeederFactory(ParkingSlot, (faker) => {
  const parkingSlot = new ParkingSlot();
  parkingSlot.name = faker.commerce.productAdjective();
  parkingSlot.width = faker.number.int({ min: 100, max: 1000 });
  parkingSlot.length = faker.number.int({ min: 100, max: 1000 });
  parkingSlot.height = faker.number.int({ min: 150, max: 1000 });
  parkingSlot.startAt = faker.number.int({ min: 0, max: 86400 });
  parkingSlot.endAt = faker.number.int({ min: 0, max: 86400 });
  parkingSlot.price = faker.number.float({ min: 5, max: 100 });
  parkingSlot.isAvailable = true;
  return parkingSlot;
});
