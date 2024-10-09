import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ParkingService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => ParkingSlot, (parkingSlot) => parkingSlot.services)
  @JoinTable()
  parkingSlots: ParkingSlot[];
}
