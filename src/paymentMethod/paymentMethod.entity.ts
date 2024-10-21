import { IsNumber } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  @IsNumber()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deleteAt?: Date;
}
