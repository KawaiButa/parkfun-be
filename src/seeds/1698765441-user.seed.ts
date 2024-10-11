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
    const userRole = await roleRepository.findOne({ where: { name: "user" } });
    await userRepository.save(
      userRepository.create({
        name: "admin",
        email: "admin@gmail.com",
        password: bcrypt.hashSync("1234567890", 10),
        phoneNumber: "1234567890",
        role: userRole,
      })
    );

    const partnerRole = await roleRepository.findOne({ where: { name: "partner" } });
    const images = await imageRepository.find();
    const partners = await partnerRepository.find();
    partners.flatMap((partner) => {
      return Array(10).map(async () => {
        return await userFactory.save({
          role: partnerRole,
          image: images[Math.floor(Math.random() * images.length)],
          partner: partner,
        });
      });
    });
    const user = userFactory.saveMany(20, {
      role: userRole,
    });
    return user;
  }
}
