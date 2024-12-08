// telegram.dto.ts
import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateTelegramDto {
  @IsInt()
  readonly telegram_id: number; // ID пользователя в Telegram

  @IsString()
  @IsOptional()
  readonly username?: string; // Имя пользователя в Telegram

  @IsString()
  @IsOptional()
  readonly first_name?: string; // Имя пользователя в Telegram

  @IsString()
  readonly language_code: string; // Язык пользователя

  @IsBoolean()
  readonly is_bot: boolean; // Является ли пользователь ботом
}
