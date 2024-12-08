import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [MessagesGateway, MessagesService],
  imports: [UsersModule],
  exports: [MessagesGateway, MessagesService],
})
export class MessagesModule {}
