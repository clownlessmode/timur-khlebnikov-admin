import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'query_id=AAHdF6IQAAAAAN0XohDhrOrc&...' })
  @IsString()
  init_data: string;
}
