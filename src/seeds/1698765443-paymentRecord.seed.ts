import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Booking, BookingStatus } from "src/booking/booking.entity";
import { PaymentRecord } from "src/paymentRecord/paymentRecord.entity";

export default class PaymentRecordSeeder1698765443 implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const paymentRecord = await factoryManager.get(PaymentRecord);
    const bookingRepository = dataSource.getRepository(Booking);
    let i = 0;
    while (true) {
      const bookings = await bookingRepository.find({
        where: {
          status: BookingStatus.COMPLETED,
        },
        skip: i,
        take: 2000,
      });
      await Promise.all(
        bookings.map((booking) => {
          return paymentRecord.save({
            booking,
            amount: booking.amount + booking.fee,
          });
        })
      );
      if (bookings.length == 0) break;
      else i += bookings.length;
    }
    return true;
  }
}
