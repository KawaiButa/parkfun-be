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
  email: string;

  @IsString()
  @IsNotEmpty()
  @Exclude()
  @Column({ unique: true })
  password: string;

  @IsString()
  @IsAlpha()
  @IsNotEmpty()
  @Column()
  name: string;
}
