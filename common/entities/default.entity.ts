import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class DefaultEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier',
    example: 'e1b2f3d4-5678-9abc-def0-1234567890ab',
  })
  id: string;

  @ApiProperty({
    description: 'Created at timestamp.',
    example: '2024-09-21T12:34:56.789Z',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public readonly created_at: string;

  @ApiProperty({
    description: 'Updated at timestamp.',
    example: '2024-09-21T13:45:67.890Z',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: string;
}
