import { DefaultEntity } from 'common/entities/default.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Telegram extends DefaultEntity {
  @Column({ type: 'bigint' })
  telegram_id: number;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  language_code: string;

  @Column()
  is_bot: boolean;
}
