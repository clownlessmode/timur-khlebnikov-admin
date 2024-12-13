import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: '1234567890' })
  @IsNumber()
  id: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_bot: boolean;

  @ApiProperty({ example: 'John Doe', nullable: true })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({ example: 'john_doe_9898', nullable: true })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'en', nullable: true })
  @IsString()
  @IsOptional()
  language_code?: string;
}
