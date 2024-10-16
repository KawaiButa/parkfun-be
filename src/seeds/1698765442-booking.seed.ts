import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { User } from "src/user/user.entity";
import { Booking } from "src/booking/booking.entity";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { shuffle, take } from "lodash";

export default class BookingSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const bookingFactory = factoryManager.get(Booking);
    const parkingSlotRepository = dataSource.getRepository(ParkingSlot);
    const userRepository = dataSource.getRepository(User);

    const users = await userRepository.find({
      where: {
        role: {
          name: "user",
        },
      },
    });
    const parkingSlots = await parkingSlotRepository.find({
      relations: {
        services: true,
      },
    });
    const result = await Promise.all(
      users.map(() => {
        const user = users[Math.floor(Math.random() * users.length)];
        const parkingSlot = parkingSlots[Math.floor(Math.random() * parkingSlots.length)];
        const services = take(shuffle(parkingSlot.services), Math.floor(Math.random() * parkingSlot.services.length));
        return bookingFactory.saveMany(50, { user, parkingSlot, services });
      })
    );
    return result.flat();
  }
}
