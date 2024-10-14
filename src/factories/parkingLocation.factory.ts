import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import { setSeederFactory } from "typeorm-extension";

export default setSeederFactory(ParkingLocation, (faker) => {
  const parkingLocation = new ParkingLocation();
  parkingLocation.address =
    faker.location.streetAddress() + ", " + faker.location.city() + ", " + faker.location.country();
  parkingLocation.access = faker.lorem.paragraph();
  parkingLocation.name = faker.company.name();
  parkingLocation.lat = faker.location.latitude();
  parkingLocation.lng = faker.location.longitude();
  parkingLocation.description = faker.commerce.productDescription();
  return parkingLocation;
});
