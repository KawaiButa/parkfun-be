import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { User } from "src/user/user.entity";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => ParkingLocation, (parkingLocation) => parkingLocation.images)
  @JoinColumn()
  parkingLocation?: ParkingLocation;

  @ManyToOne(() => ParkingSlot, (parkingSlot) => parkingSlot.images)
  parkingSlot?: ParkingSlot;

  @OneToOne(() => User, (user) => user.image)
  user: User;

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
