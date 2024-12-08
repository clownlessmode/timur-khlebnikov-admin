import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { Telegram } from 'src/users/entities/telegram.entity';
import { User } from 'src/users/entities/user.entity';
import { EntityManager, EntityNotFoundError } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly telegramBotToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly manager: EntityManager,
    private jwtService: JwtService,
  ) {
    this.telegramBotToken =
      this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
  }

  public async register(dto: RegisterDto): Promise<void> {
    const existing = await this.manager.findOne(Telegram, {
      where: { telegram_id: dto.id },
    });
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }
    const telegram = this.manager.create(Telegram, {
      first_name: dto.first_name,
      is_bot: dto.is_bot,
      telegram_id: dto.id,
      username: dto.username,
      language_code: dto.language_code,
    });
    const savedTelegram = await this.manager.save(Telegram, telegram);
    const user = this.manager.create(User, {
      telegram: savedTelegram,
    });
    await this.manager.save(User, user);
  }

  async login(dto: LoginDto, res: Response): Promise<void> {
    try {
      const id = await this.verifyTelegramData(dto.init_data);
      const telegram = await this.manager.findOneOrFail(Telegram, {
        where: {
          telegram_id: Number(id),
        },
      });
      const user = await this.manager.findOneOrFail(User, {
        where: {
          telegram: { id: telegram.id },
        },
        relations: ['telegram'],
      });
      const tokens = await this.generateTokens({
        sub: user.id,
        roles: user.role,
      });

      this.setTokenCookies(res, tokens);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('User not found');
      }

      if (error.message?.includes('telegram verification')) {
        throw new UnauthorizedException('Invalid telegram data');
      }

      // Логирование ошибки
      console.error('Login error:', error);

      throw new InternalServerErrorException(
        'Something went wrong during login',
      );
    }
  }

  private async generateTokens(payload: { sub: string; roles: string }) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  private setTokenCookies(
    res: Response,
    tokens: { access_token: string; refresh_token: string },
  ) {
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: true, // для HTTPS
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 минут
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true, // для HTTPS
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });
  }

  async refreshTokens(refresh_token: string, res: Response): Promise<void> {
    try {
      const payload = await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const tokens = await this.generateTokens({
        sub: payload.sub,
        roles: payload.roles,
      });

      this.setTokenCookies(res, tokens);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(res: Response): Promise<void> {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  private async verifyTelegramData(initData: string): Promise<string> {
    const searchParams = new URLSearchParams(initData);
    const hash = searchParams.get('hash');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(this.telegramBotToken)
      .digest();

    // Удаление hash из параметров
    searchParams.delete('hash');

    // Создание data_check_string
    const dataCheckString = Array.from(searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Вычисление HMAC-SHA256
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const isValid = calculatedHash === hash;
    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram data');
    }
    const user = JSON.parse(searchParams.get('user') || '{}');

    if (!user.id) {
      throw new UnauthorizedException('User ID not found in Telegram data');
    }

    return user.id;
  }
}
