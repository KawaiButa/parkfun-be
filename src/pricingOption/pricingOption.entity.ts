import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
