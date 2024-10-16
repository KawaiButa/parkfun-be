import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Booking, BookingStatus } from "src/booking/booking.entity";
import { PaymentRecord } from "src/paymentRecord/paymentRecord.entity";

export default class PaymentRecordSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const paymentRecord = await factoryManager.get(PaymentRecord);
    const bookingRepository = dataSource.getRepository(Booking);

    const bookings = await bookingRepository.find({
      where: {
        status: BookingStatus.COMPLETED,
      },
    });
    const result = await Promise.all(
      bookings.map((booking) => {
        return paymentRecord.save({
          booking,
        });
      })
    );
    return result;
  }
}
