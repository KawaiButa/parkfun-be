import { IsNotEmpty } from "class-validator";
import { Image } from "src/image/image.entity";
import { ParkingSlot } from "src/parkingSlot/parkingSlot.entity";
import { Partner } from "src/partner/partner.entity";
import { PaymentMethod } from "src/paymentMethod/paymentMethod.entity";
import { PricingOption } from "src/pricingOption/pricingOption.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ParkingLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  address: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
  lat?: number;

  @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
  lng?: number;

  @Column()
  access: string;

  @ManyToOne(() => Partner, { cascade: true })
  @JoinColumn()
  partner: Partner;

  @ManyToOne(() => PaymentMethod, { cascade: true })
  @JoinColumn()
  paymentMethod?: PaymentMethod;

  @ManyToOne(() => PricingOption, { cascade: true })
  @JoinColumn()
  pricingOption: PricingOption;

  @OneToMany(() => Image, (img) => img.parkingLocation, { cascade: true, onUpdate: "CASCADE" })
  images: Image[];

  @OneToMany(() => ParkingSlot, (parkingSlot) => parkingSlot.parkingLocation)
  parkingSlots: ParkingSlot[];
}
