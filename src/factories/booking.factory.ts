import * as dayjs from "dayjs";
import { Booking, BookingStatus } from "src/booking/booking.entity";
import { setSeederFactory } from "typeorm-extension";

export default setSeederFactory(Booking, (faker) => {
  const booking = new Booking();
  const random = Math.round(Math.random());
  booking.status = [BookingStatus.CANCELLED, BookingStatus.COMPLETED][random];
  booking.startAt = faker.date.past();
  booking.endAt = faker.date.between({ from: booking.startAt, to: dayjs(booking.startAt).add(1, "day").toDate() });
  booking.createAt = faker.date.recent({ refDate: booking.startAt });
  return booking;
});
