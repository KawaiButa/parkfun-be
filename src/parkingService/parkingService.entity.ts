import { Booking } from "src/booking/booking.entity";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ParkingService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => ParkingSlot, (parkingSlot) => parkingSlot.services)
  parkingSlots: ParkingSlot[];

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @ManyToMany(() => Booking, (booking) => booking.services)
  bookings: Booking[];
}
