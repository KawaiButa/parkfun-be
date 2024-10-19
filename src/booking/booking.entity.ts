import { ParkingService } from "src/parkingService/parkingService.entity";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { PaymentRecord } from "src/paymentRecord/paymentRecord.entity";
import { User } from "src/user/user.entity";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum BookingStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToOne(() => ParkingSlot)
  @JoinColumn()
  parkingSlot: ParkingSlot;

  @ManyToMany(() => ParkingService)
  @JoinTable({ name: "booking_parking_service" })
  services: ParkingService[];

  @Column({ default: BookingStatus.PENDING })
  status: BookingStatus;

  @OneToOne(() => PaymentRecord, (payment) => payment.booking)
  @JoinColumn({ name: "paymentRecordId" })
  payment?: PaymentRecord;

  @Column()
  amount: number;

  @Column()
  fee: number;

  @Column()
  startAt: Date;

  @Column()
  endAt: Date;

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
