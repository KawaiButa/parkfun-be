import { Partner } from "src/partner/partner.entity";
import { setSeederFactory } from "typeorm-extension";

export default setSeederFactory(Partner, (faker) => {
  const partner = new Partner();
  partner.avatarUrl = faker.image.avatar();
  partner.location = faker.location.streetAddress() + ", " + faker.location.city() + ", " + faker.location.country();
  partner.description = faker.commerce.productDescription();
  partner.createAt = faker.date.past();
  return partner;
});
