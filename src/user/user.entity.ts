import { Exclude } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Image } from "src/image/image.entity";
import { Partner } from "src/partner/partner.entity";
import { Role } from "src/role/role.entity";
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
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @IsEmail()
  @IsNotEmpty()
  @Column()
  @Column({ unique: true })
  email: string;

  @IsString()
  @Exclude()
  @Column({ unique: true })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Column()
  name: string;

  @IsString()
  @Column({ nullable: true, unique: true })
  phoneNumber: string;

  @ManyToOne(() => Role, (role) => role.user)
  @JoinColumn()
  role: Role;

  @OneToOne(() => Partner, (partner) => partner.user, { onUpdate: "CASCADE" })
  @JoinColumn()
  partner: Partner;

  @OneToOne(() => Image, (image) => image.user, { cascade: true })
  @JoinColumn()
  image: Image;

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
