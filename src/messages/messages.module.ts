import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { UsersModule } from 'src/users/users.module';
import { MessagesController } from './messages.controller';

@Module({
  controllers: [MessagesController],
  providers: [MessagesGateway, MessagesService],
  imports: [UsersModule],
  exports: [MessagesGateway, MessagesService],
})
export class MessagesModule {}
