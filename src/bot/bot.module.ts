import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { TelegramModule } from 'common/providers/telegram.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { BotController } from './bot.controller';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [TelegramModule, AuthModule, UsersModule, MessagesModule],
  controllers: [BotController],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
