import { Exclude } from "class-transformer";
import { IsAlpha, IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
  @Column({ nullable: true })
  password?: string;

  @IsString()
  @IsAlpha()
  @IsNotEmpty()
  @Column()
  name: string;
}
