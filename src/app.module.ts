import { Module } from '@nestjs/common';
import { EnvFilePathModule } from '../common/providers/env-file-path.module';
import { PostgresModule } from '../common/providers/postgres.module';
import { BotModule } from './bot/bot.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { BroadcastsModule } from './broadcasts/broadcasts.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    EnvFilePathModule,
    PostgresModule,
    BotModule,
    AuthModule,
    UsersModule,
    GroupsModule,
    BroadcastsModule,
    MessagesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
