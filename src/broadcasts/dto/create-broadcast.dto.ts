import {
  IsArray,
  IsString,
  ArrayNotEmpty,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateBroadcastDto {
  @ApiProperty({
    description: 'Название рассылки',
    example: 'Promo campaign for new product',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Сообщение для рассылки',
    example: 'Hello, we have a new product for you!',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Список идентификаторов групп для рассылки',
    example: ['group-id-1', 'group-id-2', 'group-id-3'],
  })
  @Transform(({ value }) => {
    return Array.isArray(value)
      ? value
      : value.split(',').map((id) => id.trim());
  })
  @IsArray()
  @ArrayNotEmpty()
  groupIds: string[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Опциональные изображения для загрузки',
    required: false,
  })
  @IsOptional()
  images?: Express.Multer.File[];
}
