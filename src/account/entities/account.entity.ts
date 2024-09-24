import { Exclude } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";
import { AbstractEntity } from "common/abstract.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, OneToOne } from "typeorm";

@Entity()
export class Account extends AbstractEntity {
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @OneToOne(() => User, (user: User) => user.account, { eager: true, nullable: false, onDelete: "CASCADE" })
  user: User;

  @IsString()
  @Column()
  @Exclude()
  @MinLength(8)
  password: string;
}
