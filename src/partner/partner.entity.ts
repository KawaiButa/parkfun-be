import { IsOptional, IsString, IsUrl } from "class-validator";
import { PartnerType } from "src/partnerType/partnerType.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Partner {
  @PrimaryGeneratedColumn()
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

  @OneToOne(() => User, (user) => user.partner)
  user: User;
}
