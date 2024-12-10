import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io';
import { Logger, NotFoundException } from '@nestjs/common';
import { JoinDto } from './dto/join.dto';
import { UsersService } from 'src/users/users.service';
import { SendDto } from './dto/send.dto';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { EntityManager } from 'typeorm';

@WebSocketGateway({
  namespace: 'messages',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  logger = new Logger('messages');
  private readonly bot: Telegraf;
  private readonly adminBot: Telegraf;
  private readonly adminId: string;
  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
    private configService: ConfigService,
    private manager: EntityManager,
  ) {
    this.bot = new Telegraf(
      configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
    );
    this.adminBot = new Telegraf(
      configService.getOrThrow<string>('TELEGRAM_ADMIN_TOKEN'),
    );
    this.adminId = configService.getOrThrow<string>('TELEGRAM_ADMIN_ID');
  }

  afterInit(server: any) {
    this.logger.log('afterInit', server);
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }
  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('send')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: SendDto,
  ) {
    this.logger.log(`Received message: ${message}`);
    const user = await this.manager.findOne(User, {});
    console.log(user);
    try {
      this.bot.telegram.sendMessage(user.telegram.telegram_id, message.message);
    } catch (err) {
      console.log('error:', err);
    }
    client.to(user.id).emit('new', message);
    this.messagesService.create({
      content: message.message,
      variant: message.variant,
      userId: user.id,
    });
  }

  @SubscribeMessage('join')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: JoinDto,
  ) {
    const user = await this.usersService.findOne(message.id);
    // console.log(user);
    client.join(message.id);
    this.logger.log(`user joined: ${user.id}`);
  }
}
