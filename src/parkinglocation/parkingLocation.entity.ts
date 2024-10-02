import { IsNotEmpty, IsAlpha } from "class-validator";
import { Partner } from "src/partner/partner.entity";
import { PaymentMethod } from "src/paymentMethod/paymentMethod.entity";
import { PricingOption } from "src/pricingOption/pricingOption.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ParkingLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @IsAlpha()
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
  partner?: Partner;

  @ManyToOne(() => PaymentMethod, { cascade: true })
  @JoinColumn()
  paymentMethod?: PaymentMethod;

  @ManyToOne(() => PricingOption, { cascade: true })
  @JoinColumn()
  pricingOption: PricingOption;
}
