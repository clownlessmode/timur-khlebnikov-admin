import { DefaultEntity } from 'common/entities/default.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import Variant from './variant.enum';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Message extends DefaultEntity {
  @Column()
  content: string; // Убедитесь, что поле определено с декоратором @Column

  @Column({
    type: 'enum',
    enum: Variant,
  })
  variant: Variant;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: false })
  isRead: boolean;
}
