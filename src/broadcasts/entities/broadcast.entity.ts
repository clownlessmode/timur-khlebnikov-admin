import { DefaultEntity } from 'common/entities/default.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import BroadcastStatus from './broadcast-status.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Broadcast extends DefaultEntity {
  @Column()
  name: string;

  @Column()
  message: string;

  @ApiProperty({
    description: 'Array of image URLs related to the report',
    type: [String],
  })
  @Column('text', { array: true })
  images: string[];

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
