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

  // @SubscribeMessage('send')
  // async sendMessage(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() message: SendDto,
  // ) {
  //   this.logger.log(`Received message: ${message}`);
  //   const user = await this.manager.findOne(User,{});
  //   console.log(user);
  //   try {
  //     this.bot.telegram.sendMessage(user.telegram.telegram_id, message.message);
  //   } catch (err) {
  //     console.log('error:', err);
  //   }
  //   client.to(user.id).emit('new', message);
  //   this.messagesService.create({
  //     content: message.message,
  //     variant: message.variant,
  //     userId: user.id,
  //   });
  // }

  @SubscribeMessage('send')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: SendDto,
  ) {
    this.logger.log(`Received message: ${message}`);

    try {
      // Найти пользователя, связанного с сообщением
      const user = await this.manager.findOne(User, {
        where: { id: message.id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Отправка сообщения в комнату пользователя
      client.to(user.id).emit('new', {
        ...message,
        roomId: user.id, // Добавляем идентификатор комнаты
      });

      // Сохранение сообщения в базе данных
      const savedMessage = await this.messagesService.create({
        content: message.message,
        variant: message.variant,
        userId: user.id,
      });

      // Отправка сообщения в Telegram пользователю
      try {
        this.bot.telegram.sendMessage(
          user.telegram.telegram_id,
          message.message,
        );
      } catch (telegramErr) {
        console.log('Telegram send error:', telegramErr);
      }

      // Проверка, находится ли отправитель в своей комнате
      const clientRooms = Array.from(client.rooms);
      const isInOwnRoom = clientRooms.includes(user.id);

      if (!isInOwnRoom) {
        // Отправка уведомления администратору
        this.adminBot.telegram.sendMessage(
          this.adminId,
          `Уведомление: Сообщение для пользователя ${user.id} не в его комнате`,
        );
      }
    } catch (err) {
      console.error('Error in sendMessage:', err);
      // Можно добавить логирование ошибки
    }
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
