import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import escapeMessage from 'common/utils/escape-message';
import { Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import * as path from 'path';
import * as fs from 'fs';
import WelcomeMessage from './assets/welcome-message';
import { User } from 'src/users/entities/user.entity';
import ChatMessage from './assets/chat-message';
import { Message } from 'telegraf/typings/core/types/typegram';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { MessagesService } from 'src/messages/messages.service';
import { MessagesGateway } from 'src/messages/messages.gateway';
import Variant from 'src/messages/entities/variant.enum';

@Update()
@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);
  private readonly bot: Telegraf;
  private readonly adminBot: Telegraf;
  private readonly adminId: string;

  constructor(
    private usersService: UsersService,
    private manager: EntityManager,
    private messagesService: MessagesService,
    private authService: AuthService,
    private configService: ConfigService,
    private messagesGateway: MessagesGateway,
  ) {
    // Инициализация ботов
    this.bot = new Telegraf(
      configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
    );
    this.adminBot = new Telegraf(
      configService.getOrThrow<string>('TELEGRAM_ADMIN_TOKEN'),
    );
    this.adminId = configService.getOrThrow<string>('TELEGRAM_ADMIN_ID');

    // Инициализация обработчиков
    this.initAdminBotHandlers();
    this.adminBot.launch();
  }

  // --- 1. Инициализация обработчиков для adminBot ---
  private initAdminBotHandlers() {
    this.adminBot.on('message', async (ctx) => {
      const chatId = ctx.chat.id;
      this.logger.log(`AdminBot received message from chat ID: ${chatId}`);
      await ctx.reply(`Ваш Chat ID: ${chatId}`);
    });
  }

  // --- 2. Обработчики для основного бота ---
  @On('contact')
  async contact(@Ctx() ctx: Context) {
    const contact = (ctx.message as Message.ContactMessage).contact;

    if (contact) {
      this.logger.log(`Получен контакт: ${JSON.stringify(contact)}`);

      // Отправляем пользователю подтверждение
      await ctx.reply(
        `Спасибо! Я получил ваш контакт и свяжусь с вами как можно скорее! 😊`,
      );

      // Формируем сообщение для администратора
      const user = ctx.from;
      const adminMessage = `
📞 *Новый запрос на связь!*

👤 *Имя*: ${contact.first_name || 'Не указано'} ${contact.last_name || ''}
📱 *Номер телефона*: ${contact.phone_number}
🔗 *Ссылка на пользователя*: @${user.username || 'Нет username'}
`;

      // Отправляем сообщение админу
      await this.adminBot.telegram.sendMessage(
        this.adminId,
        escapeMessage(adminMessage),
        {
          parse_mode: 'MarkdownV2',
          ...Markup.inlineKeyboard([
            [
              Markup.button.url(
                'Написать в Telegram',
                `tg://user?id=${user.id}`,
              ),
            ],
          ]),
        },
      );
    } else {
      this.logger.warn('Контактные данные не предоставлены.');
      await ctx.reply(
        escapeMessage(`Пожалуйста, поделитесь контактом, нажав на кнопку.`),
      );
    }
  }
  @Start()
  async start(@Ctx() ctx: Context) {
    await this.sendWelcomeVideo(ctx);
    await this.sendWelcomeMessage(ctx);

    try {
      // Регистрация пользователя
      // await this.authService.register(ctx.from);

      // Уведомление администратора
      const user = ctx.from;
      const message = `
🎉 *Новый пользователь зарегистрирован!*

📇 *Информация о пользователе:*
- 🆔 *ID*: ${user.id}
- 🤖 *Бот*: ${user.is_bot ? 'Да' : 'Нет'}
- 👤 *Имя*: ${user.first_name || 'Не указано'}
- 🌐 *Имя пользователя*: ${user.username || 'Не указано'}
- 🗣️ *Язык*: ${user.language_code || 'Не указан'}
`;

      await this.adminBot.telegram.sendMessage(
        this.adminId,
        escapeMessage(message),
        {
          parse_mode: 'MarkdownV2',
          ...Markup.inlineKeyboard([
            [
              Markup.button.webApp(
                'Открыть Админку 🌐',
                'https://r6nt2plp-3000.asse.devtunnels.ms/',
              ),
            ],
          ]),
        },
      );

      setTimeout(async () => {
        try {
          await ctx.reply(escapeMessage(ChatMessage), {
            parse_mode: 'MarkdownV2',
            ...Markup.keyboard([
              Markup.button.contactRequest('📲 Поделиться контактом'),
            ])
              .oneTime()
              .resize(),
          });
        } catch (error) {
          this.logger.error(
            'Failed to send delayed message to user',
            error.stack,
          );
        }
      }, 100000); // 10 секунд
    } catch (error) {
      this.logger.error('Failed to notify admin about new user', error.stack);
    }
  }

  // --- 3. Вспомогательные методы ---
  private sendWelcomeMessage(ctx: Context) {
    return ctx.reply(escapeMessage(WelcomeMessage), {
      parse_mode: 'MarkdownV2',
      ...Markup.inlineKeyboard([
        [
          Markup.button.webApp(
            'Открыть визитку 🌐',
            'https://khal-web-app.vercel.app/',
          ),
        ],
      ]),
    });
  }

  private sendWelcomeVideo(ctx: Context) {
    const videoPath = path.join(
      __dirname,
      '../../src/bot/assets/welcome-video.mp4',
    );
    const videoBuffer = fs.readFileSync(videoPath);

    return ctx.telegram.sendVideoNote(ctx.chat.id, {
      source: videoBuffer,
    } as any);
  }

  // --- 4. Отправка сообщения пользователю ---
  async sendMessageToUser(user: User, message: string): Promise<void> {
    try {
      if (user.telegram && user.telegram.telegram_id) {
        await this.bot.telegram.sendMessage(user.telegram.telegram_id, message);
        this.logger.log(`Message sent to user ${user.telegram.telegram_id}`);
        user.hasBanned = false;
        await this.manager.save(User, user);
      } else {
        this.logger.warn(
          `User ${user.name || user.telegram.username} does not have a valid Telegram ID.`,
        );
      }
    } catch (error) {
      this.handleSendMessageError(user, error);
    }
  }

  private async handleSendMessageError(user: User, error: any) {
    if (error.response && error.response.error_code === 403) {
      // Ошибка 403: пользователь заблокировал бота
      this.logger.warn(
        `User ${user.telegram.telegram_id} has blocked the bot.`,
      );
      user.hasBanned = true;
      await this.manager.save(User, user);
    } else {
      this.logger.error(
        `Failed to send message to user ${user.telegram.telegram_id}: ${error.message}`,
        error.stack,
      );
    }
  }

  async contactToUser(id: string): Promise<void> {
    const user = await this.manager.findOne(User, { where: { id } });

    if (!user || !user.telegram) {
      this.logger.error('User or telegram data is invalid');
      return;
    }

    const message = `
📱 *Контакты для личной связи!* 

✨ *Имя*: ${user.name || user.telegram.first_name || user.telegram.username || 'Не указано'}
🔗 *Ссылка на пользователя*: @${user.telegram.username || 'Нет username'}
`;

    try {
      // Попытка отправки по tg://user?id
      await this.adminBot.telegram.sendMessage(
        this.adminId,
        escapeMessage(message),
        {
          parse_mode: 'MarkdownV2',
          ...Markup.inlineKeyboard([
            [
              Markup.button.url(
                'Написать в Telegram',
                `tg://user?id=${user.telegram.telegram_id}`,
              ),
            ],
          ]),
        },
      );
      this.logger.log('Message sent via tg://user');
    } catch (error) {
      this.logger.error(
        'Failed to send via tg://user, attempting with username link',
        error,
      );

      // Альтернативный путь: отправляем через username
      if (user.telegram.username) {
        try {
          await this.adminBot.telegram.sendMessage(
            this.adminId,
            escapeMessage(message),
            {
              parse_mode: 'MarkdownV2',
              ...Markup.inlineKeyboard([
                [
                  Markup.button.url(
                    'Написать в Telegram',
                    `https://t.me/${user.telegram.username}`,
                  ),
                ],
              ]),
            },
          );
          this.logger.log('Message sent via t.me username');
        } catch (innerError) {
          this.logger.error(
            'Failed to send via t.me username as well',
            innerError,
          );
        }
      } else {
        this.logger.error('User has no username to fallback to');
      }
    }
  }

  @On('message')
  async handleMessage(@Ctx() ctx: Context) {
    const user = await this.usersService.findByTelegram(ctx.from.id);
    console.log(ctx.message);
    if ('text' in ctx.message) {
      console.log('trying to send message', user.id);

      await this.messagesGateway.server.to(user.id).emit('new', {
        id: user.id,
        message: ctx.message.text,
        variant: Variant.INCOMING,
      });

      await this.messagesService.create({
        content: ctx.message.text,
        variant: Variant.INCOMING,
        userId: user.id,
      });
    }
  }
}
