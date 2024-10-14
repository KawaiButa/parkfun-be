import { Seeder } from "typeorm-extension";
import { DataSource } from "typeorm";
import { Role } from "src/role/role.entity";

export default class RoleSeeder1698765431 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(Role);
    const roles = await repository.insert(
      repository.create([
        {
          name: "admin",
        },
        {
          name: "partner",
        },
        {
          name: "user",
        },
      ])
    );
    return roles;
  }
}
