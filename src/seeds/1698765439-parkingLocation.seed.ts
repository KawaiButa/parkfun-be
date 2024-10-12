import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import { Partner } from "src/partner/partner.entity";
import { PaymentMethod } from "src/paymentMethod/paymentMethod.entity";
import { PricingOption } from "src/pricingOption/pricingOption.entity";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";

export default class ParkingLocation1698765439 implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const partnerRepository = dataSource.getRepository(Partner);
    const paymentMethodRepository = dataSource.getRepository(PaymentMethod);
    const pricingOptionRepository = dataSource.getRepository(PricingOption);

    const [paymentMethods, pricingOptions, partners] = await Promise.all([
      paymentMethodRepository.find(),
      pricingOptionRepository.find(),
      partnerRepository.find(),
    ]);
    const parkingLocationFactory = factoryManager.get(ParkingLocation);

    const parkingLocations = await Promise.all(
      partners.flatMap((partner) => {
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const pricingOption = pricingOptions[Math.floor(Math.random() * pricingOptions.length)];
        return parkingLocationFactory.saveMany(10, {
          partner,
          paymentMethod,
          pricingOption,
        });
      })
    );
    return parkingLocations;
  }
}
