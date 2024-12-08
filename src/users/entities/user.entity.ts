import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Telegram } from './telegram.entity';
import { DefaultEntity } from 'common/entities/default.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Role } from 'src/auth/enums/roles.enum';
import { Message } from 'src/messages/entities/message.entity';

@Entity()
export class User extends DefaultEntity {
  @JoinColumn()
  @OneToOne(() => Telegram, (telegram) => telegram.id, { eager: true })
  telegram: Telegram;

  @ManyToMany(() => Group, (group) => group.users)
  groups: Group[];

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  comment: string;

  @Column({ default: false })
  hasBanned: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];
}
