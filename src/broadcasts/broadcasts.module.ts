import { Module } from '@nestjs/common';
import { BroadcastsService } from './broadcasts.service';
import { BroadcastsController } from './broadcasts.controller';
import { BotModule } from 'src/bot/bot.module';

@Module({
  controllers: [BroadcastsController],
  providers: [BroadcastsService],
  imports: [BotModule],
})
export class BroadcastsModule {}
