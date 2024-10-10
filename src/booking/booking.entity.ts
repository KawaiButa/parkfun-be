import { IsNumber, IsPositive } from "class-validator";
import { ParkingService } from "src/parkingService/parkingSerivce.entity";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum BookingStatus {
  PENDING_PAYMENT = "pending payment",
  COMPLETED_PAYMENT = "completed payment",
  RECEIVE_SERVICES = "receive service",
}
@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ParkingSlot)
  @JoinColumn()
  parkingSlot: ParkingSlot;

  @Column()
  startAt: number;

  @Column()
  endAt: number;

  @ManyToMany(() => ParkingService)
  @JoinTable()
  services: ParkingService[];

  @Column()
  @IsNumber()
  @IsPositive()
  totalPrice: number;

  @Column()
  status: BookingStatus;
}
