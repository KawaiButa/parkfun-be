import { PaymentRecord, PaymentRecordStatus } from "src/paymentRecord/paymentRecord.entity";
import { setSeederFactory } from "typeorm-extension";

export default setSeederFactory(PaymentRecord, (faker) => {
  const paymentRecord = new PaymentRecord();
  paymentRecord.transactionId = faker.string.uuid();
  paymentRecord.isRefunded = faker.datatype.boolean();
  paymentRecord.receiptUrl = faker.image.url();
  paymentRecord.status = faker.helpers.arrayElement([
    PaymentRecordStatus.CAPTURED,
    PaymentRecordStatus.REFUNDED,
    PaymentRecordStatus.FAILED,
  ]);
  return paymentRecord;
});
