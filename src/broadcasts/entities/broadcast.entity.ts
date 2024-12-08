import { DefaultEntity } from 'common/entities/default.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import BroadcastStatus from './broadcast-status.enum';

@Entity()
export class Broadcast extends DefaultEntity {
  @Column()
  name: string;

  @Column()
  message: string;

  @Column('bytea', { nullable: true })
  files: Buffer[]; // Массив бинарных данных для хранения файлов

  @ManyToMany(() => Group, (group) => group.broadcasts)
  @JoinTable()
  groups: Group[];

  @Column({
    type: 'enum',
    enum: BroadcastStatus,
    default: BroadcastStatus.IN_PROGRESS, // Статус по умолчанию - ожидает начала
  })
  status: BroadcastStatus;
}
