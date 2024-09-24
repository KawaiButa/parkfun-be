import { IsAlpha, IsEnum, IsString, Length } from "class-validator";
import { AbstractEntity } from "common/abstract.entity";
import { Account } from "src/account/entities/account.entity";
import { ROLE } from "src/enums/role";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

@Entity()
export class User extends AbstractEntity {
  @OneToOne(() => Account, { cascade: true, nullable: true })
  @JoinColumn()
  account?: Account;

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
}
