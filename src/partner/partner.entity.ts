import { IsNumber, IsOptional, IsString, IsUrl } from "class-validator";
import { ParkingLocation } from "src/parkinglocation/parkingLocation.entity";
import { PartnerType } from "src/partnerType/partnerType.entity";
import { User } from "src/user/user.entity";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Partner {
  @PrimaryGeneratedColumn()
  @IsNumber()
  id: number;

  @Column()
  @IsString()
  location: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ManyToOne(() => PartnerType, (type) => type.partners)
  @JoinColumn()
  type: PartnerType;

  @OneToOne(() => User, (user) => user.partner, { cascade: true, eager: true })
  user: User;

  @OneToMany(() => ParkingLocation, (location) => location.partner, { onDelete: "CASCADE" })
  parkingLocations: ParkingLocation[];

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
