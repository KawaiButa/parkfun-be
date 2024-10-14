import { IsBoolean, IsNumber, IsString } from "class-validator";
import { Image } from "src/image/image.entity";
import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import { ParkingService } from "src/parkingService/parkingService.entity";
import { ParkingSlotType } from "src/parkingSlotType/parkingSlotType.entity";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class ParkingSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  name: string;

  @Column()
  @IsBoolean()
  isAvailable: boolean;

  @Column()
  @IsNumber()
  width: number;

  @Column()
  @IsNumber()
  length: number;

  @Column()
  @IsNumber()
  height: number;

  @Column()
  @IsNumber()
  price: number;

  @Column()
  @IsNumber()
  startAt: number;

  @Column()
  @IsNumber()
  endAt: number;

  @ManyToOne(() => ParkingSlotType, { cascade: true })
  @JoinColumn()
  type: ParkingSlotType;

  @ManyToOne(() => ParkingLocation, { nullable: true, eager: true })
  @JoinColumn()
  parkingLocation: ParkingLocation;

  @ManyToMany(() => ParkingService, (service) => service.parkingSlots)
  @JoinTable({ name: "parking_slot_parking_service" })
  services: ParkingService[];

  @ManyToMany(() => Image, (image) => image.parkingSlot, { cascade: true })
  @JoinTable({ name: "parking_slot_image" })
  images: Image[];

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
