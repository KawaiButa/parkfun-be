import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { User } from "src/user/user.entity";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
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

  @ManyToOne(() => ParkingLocation, (parkingLocation) => parkingLocation.images, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn()
  parkingLocation?: ParkingLocation;

  @ManyToMany(() => ParkingSlot, (parkingSlot) => parkingSlot.images)
  parkingSlot?: ParkingSlot;

  @OneToOne(() => User, (user) => user.image)
  user: User;

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
