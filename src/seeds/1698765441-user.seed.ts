import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { User } from "src/user/user.entity";
import { Role } from "src/role/role.entity";
import { Partner } from "src/partner/partner.entity";
import { Image } from "src/image/image.entity";
import * as bcrypt from "bcrypt";

export default class UserSeeder1698765441 implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const userFactory = factoryManager.get(User);

    const roleRepository = dataSource.getRepository(Role);
    const partnerRepository = dataSource.getRepository(Partner);
    const imageRepository = dataSource.getRepository(Image);

    const userRepository = dataSource.getRepository(User);
    const [adminRole, userRole, partnerRole] = await roleRepository.find({
      order: {
        name: "ASC",
      },
    });

    await userRepository.save(
      userRepository.create({
        name: "admin",
        email: "admin@gmail.com",
        password: bcrypt.hashSync("1234567890", 10),
        phoneNumber: "1234567890",
        role: adminRole,
      })
    );
    const [images, partners] = await Promise.all([imageRepository.find(), partnerRepository.find()]);
    const partnerUsers = await Promise.all(
      partners.map((partner) => {
        return userFactory.save({
          role: partnerRole,
          image: images[Math.floor(Math.random() * images.length)],
          partner: partner,
        });
      })
    );
    const user = await userFactory.saveMany(50, {
      role: userRole,
    });
    return partnerUsers.concat(user);
  }
}
