import { Module } from '@nestjs/common';
import { BroadcastsService } from './broadcasts.service';
import { BroadcastsController } from './broadcasts.controller';
import { BotModule } from 'src/bot/bot.module';
import { ImageUploadService } from 'common/utils/image-upload.service';

@Module({
  controllers: [BroadcastsController],
  providers: [BroadcastsService, ImageUploadService],
  imports: [BotModule],
})
export class BroadcastsModule {}
