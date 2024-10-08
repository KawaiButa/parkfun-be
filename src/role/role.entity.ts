import { IsString } from "class-validator";
import { User } from "src/user/user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @Column({ unique: true })
  name: string;

  @OneToMany(() => User, (user) => user.role)
  user: User[];
}
