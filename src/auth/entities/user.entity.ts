import { Exclude } from "class-transformer";
import { IsAlpha, IsEmail, IsEnum, IsString, Length, MinLength } from "class-validator";
import { AbstractEntity } from "src/common/abstract.entity";
import { ROLE } from "src/enums/role";
import { Column, Entity } from "typeorm";

@Entity()
export class User extends AbstractEntity {
  @IsEnum(ROLE)
  @Column({ type: "enum", enum: ROLE })
  role: ROLE;

  @IsAlpha()
  @Column()
  firstName: string;

  @IsAlpha()
  @Column()
  lastName: string;

  @Column({ length: 10 })
  @IsString()
  @Length(10)
  phoneNumber?: string;

  @IsEmail()
  @Column({ unique: true })
  email: string;

  @IsString()
  @Column()
  @Exclude()
  @MinLength(8)
  password?: string;
}
