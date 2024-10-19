import { DataSource } from "typeorm";
import { PaymentMethod } from "src/paymentMethod/paymentMethod.entity";
import { Seeder } from "typeorm-extension";

export default class PaymentMethodSeeder1698765435 implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(PaymentMethod);
    const payment = repository.create({
      name: "Stripe",
      description: "Stripe powered payment method",
    });
    const result = await repository.save(payment);
    return result;
  }
}
