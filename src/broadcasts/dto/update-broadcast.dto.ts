import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import BroadcastStatus from '../entities/broadcast-status.enum';

export class UpdateBroadcastDto {
  @IsString()
  @IsOptional()
  readonly name?: string; // Название рассылки (опционально)

  @IsString()
  @IsOptional()
  readonly message?: string; // Сообщение для рассылки (опционально)

  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  readonly groupIds?: string[]; // Массив идентификаторов групп для рассылки (опционально)

  @IsOptional()
  readonly files?: Buffer[]; // Опциональные файлы для прикрепления (опционально)

  @IsEnum(BroadcastStatus)
  @IsOptional()
  readonly status?: BroadcastStatus; // Статус рассылки (опционально)
}
