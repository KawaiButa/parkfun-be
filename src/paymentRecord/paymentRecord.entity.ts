import { Booking } from "src/booking/booking.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PaymentRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Booking, (booking) => booking.payment, { eager: true })
  booking: Booking;

  @Column()
  amount: number;

  @Column({ default: false })
  isRefunded: boolean;

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
