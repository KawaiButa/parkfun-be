import { User } from "src/user/user.entity";
import { setSeederFactory } from "typeorm-extension";
import * as bcrypt from "bcrypt";
export default setSeederFactory(User, (faker) => {
  const user = new User();
  user.name = faker.internet.userName();
  user.email = Date() + faker.internet.email();
  user.password = bcrypt.hashSync(faker.internet.password(), 10);
  user.phoneNumber = faker.phone.number();
  user.createAt = faker.date.past();
  user.isVerified = true;
  return user;
});
