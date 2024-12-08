import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsHexColor,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Название группы',
    example: 'Developers',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description:
      'Список пользователей, которые будут в группе (необязательное поле)',
    example: [
      'e27f1293-8c76-4d08-87b4-65841b20e465',
      'abb7de84-04f1-4a02-a07f-b946b0a07c23',
    ],
    required: false,
    type: [String], // Тип данных для массива UUID
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true }) // Проверка, что каждый элемент массива - это UUID
  users?: string[]; // Список UUID пользователей
}
