import { Booking, BookingStatus } from "src/booking/booking.entity";
import { setSeederFactory } from "typeorm-extension";

export default setSeederFactory(Booking, (faker) => {
  const booking = new Booking();
  const random = Math.floor(Math.random() * Object.keys(BookingStatus).length);
  booking.status = BookingStatus[Object.keys(BookingStatus)[random]];
  booking.amount = faker.number.float();
  booking.startAt = faker.date.past();
  booking.endAt = faker.date.future();
  booking.createAt = faker.date.past();
  return booking;
});
