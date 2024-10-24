import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import { setSeederFactory } from "typeorm-extension";
import { Faker } from "@faker-js/faker";

const generateVietnameseAddress = (faker: Faker): string => {
  const streetTypes = ["Đường", "Phố", "Ngõ", "Hẻm"];
  const districtTypes = ["Quận", "Huyện", "Thị xã"];
  const cityNames = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Biên Hòa", "Nha Trang", "Huế"];

  const streetNumber = faker.number.int({ min: 1, max: 200 });
  const streetName = faker.person.lastName();
  const streetType = faker.helpers.arrayElement(streetTypes);
  const ward = faker.number.int({ min: 1, max: 20 });
  const districtType = faker.helpers.arrayElement(districtTypes);
  const district = faker.number.int({ min: 1, max: 12 });
  const city = faker.helpers.arrayElement(cityNames);

  return `${streetNumber} ${streetType} ${streetName}, Phường ${ward}, ${districtType} ${district}, ${city}`;
};

export default setSeederFactory(ParkingLocation, (faker) => {
  const parkingLocation = new ParkingLocation();
  parkingLocation.lat = faker.location.latitude({ min: 10.3485, max: 11.106, precision: 6 });
  parkingLocation.lng = faker.location.longitude({ min: 106.3256, max: 107.012, precision: 6 });
  parkingLocation.address = generateVietnameseAddress(faker);
  parkingLocation.access = faker.commerce.productDescription();
  parkingLocation.name = faker.company.name();
  parkingLocation.description = faker.commerce.productDescription();
  parkingLocation.createAt = faker.date.past();

  return parkingLocation;
});
