import { setSeederFactory } from "typeorm-extension";
import { Faker } from "@faker-js/faker";
import { ParkingSlotType } from "./parkingSlotType.entity";
export const ParkingSlotFactory = setSeederFactory(ParkingSlotType, (faker: Faker) => {
  const parkingSlotType = new ParkingSlotType();
  parkingSlotType.name = faker.commerce.department();
  parkingSlotType.description = faker.commerce.productDescription();
  return parkingSlotType;
});
