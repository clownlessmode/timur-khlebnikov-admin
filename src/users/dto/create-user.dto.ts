import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Импортируем для Swagger документации
import { Role } from 'src/auth/enums/roles.enum';
import { Group } from 'src/groups/entities/group.entity';
import { CreateTelegramDto } from './create-telegram.dto';

export class CreateUserDto {
  @ApiProperty({
    description: 'Информация о Telegram-аккаунте пользователя (опционально)',
    type: CreateTelegramDto,
    example: {
      telegram_id: 123456789,
      username: 'johndoe',
      first_name: 'John',
      language_code: 'en',
      is_bot: false,
    },
    required: false,
  })
  @IsOptional()
  readonly telegram?: CreateTelegramDto; // Опциональный объект для Telegram

  @ApiProperty({
    description:
      'Группы, к которым принадлежит пользователь (указываются через ID групп)',
    type: [String],
    example: ['group-id-1', 'group-id-2'], // Используются ID групп
  })
  @IsArray()
  readonly groups: string[];

  @ApiProperty({
    description: 'Имя пользователя',
    type: String,
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiProperty({
    description: 'Телефонный номер пользователя',
    type: String,
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly telephone?: string;

  @ApiProperty({
    description: 'Регион пользователя',
    type: String,
    example: 'California',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly region?: string;

  @ApiProperty({
    description: 'Комментарий к профилю пользователя',
    type: String,
    example: 'Вас ждет много интересных материалов!',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly comment?: string;

  @ApiProperty({
    description: 'Статус бана пользователя',
    type: Boolean,
    example: false,
  })
  @IsBoolean()
  readonly hasBanned: boolean;

  @ApiProperty({
    description: 'Роль пользователя в системе',
    type: String,
    enum: Role,
    example: Role.USER,
  })
  @IsEnum(Role)
  readonly role: Role; // Роль пользователя (например, USER или ADMIN)
}
