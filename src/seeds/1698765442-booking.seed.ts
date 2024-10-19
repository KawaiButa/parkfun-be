import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { User } from "src/user/user.entity";
import { Booking } from "src/booking/booking.entity";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { shuffle, take } from "lodash";

export default class BookingSeeder1698765442 implements Seeder {
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
    let i = 0;
    while (true) {
      const parkingSlots = await parkingSlotRepository.find({
        relations: {
          parkingLocation: {
            pricingOption: true,
          },
        },
        skip: i,
        take: 2000,
      });
      await Promise.all(
        parkingSlots
          .map((parkingSlot) => {
            const selectedUser = take(shuffle(users), Math.floor(Math.random() * 5));
            const parkingLocation = parkingSlot.parkingLocation;
            const pricingOption = parkingLocation.pricingOption;
            const fee =
              pricingOption.name === "fixed" ? pricingOption.value : parkingSlot.price * (pricingOption.value / 100);
            return selectedUser.map((user) =>
              bookingFactory.save({
                user,
                parkingSlot,
                amount: parkingSlot.price,
                fee,
              })
            );
          })
          .flat()
      );
      if (parkingSlots.length == 0) break;
      else i += parkingSlots.length;
    }
    return true;
  }
}
