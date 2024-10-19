import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PricingOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  value: number;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => ParkingLocation, (parkingLocation) => parkingLocation.pricingOption)
  parkingLocations: ParkingLocation[];
}
