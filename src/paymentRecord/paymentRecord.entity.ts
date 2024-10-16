import { Booking } from "src/booking/booking.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PaymentRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  transactionId: string;

  @OneToOne(() => Booking, (booking) => booking.payment)
  booking: Booking;

  @Column()
  isRefunded: boolean;

  @Column()
  receiptUrl: string;

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
