import { DefaultEntity } from 'common/entities/default.entity';
import { Broadcast } from 'src/broadcasts/entities/broadcast.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

@Entity()
export class Group extends DefaultEntity {
  @Column()
  name: string;

  @JoinTable()
  @ManyToMany(() => User, (user) => user.groups)
  users: User[];

  @ManyToMany(() => Broadcast, (broadcast) => broadcast.groups)
  broadcasts: Broadcast[];
}
