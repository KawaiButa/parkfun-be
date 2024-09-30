import { Exclude } from "class-transformer";
import { IsAlpha, IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Partner } from "src/partner/partner.entity";
import { Role } from "src/role/role.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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
  @IsAlpha()
  @IsNotEmpty()
  @Column()
  name: string;

  @IsString()
  @Column({ nullable: true, unique: true })
  phoneNumber: string;

  @ManyToOne(() => Role, (role) => role.user)
  @JoinColumn()
  role: Role;

  @OneToOne(() => Partner, (partner) => partner.user, { cascade: true })
  @JoinColumn()
  partner: Partner;
}
