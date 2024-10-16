import { PaymentRecord } from "src/paymentRecord/paymentRecord.entity";
import { setSeederFactory } from "typeorm-extension";

export default setSeederFactory(PaymentRecord, (faker) => {
  const paymentRecord = new PaymentRecord();
  paymentRecord.amount = faker.number.float({ min: 0, max: 1000 });
  paymentRecord.transactionId = faker.string.uuid();
  paymentRecord.isRefunded = faker.datatype.boolean();
  paymentRecord.receiptUrl = faker.image.url();
  return paymentRecord;
});
