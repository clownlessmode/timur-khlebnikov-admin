import { IsArray, IsString, ArrayNotEmpty, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsArray()
  @ArrayNotEmpty()
  groupIds: string[];
}
