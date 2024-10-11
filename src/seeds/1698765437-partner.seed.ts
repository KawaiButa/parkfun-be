import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { PartnerType } from "src/partnerType/partnerType.entity";
import { Partner } from "src/partner/partner.entity";

export default class PartnerSeeder1698765437 implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const partnerFactory = factoryManager.get(Partner);
    const partnerTypeRepository = dataSource.getRepository(PartnerType);
    const partnerTypes = await partnerTypeRepository.find();
    if (!partnerTypes.length) return;
    const partners = await Promise.all(
      partnerTypes.flatMap((partnerType) => {
        return partnerFactory.saveMany(10, { type: partnerType });
      })
    );
    return partners;
  }
}
