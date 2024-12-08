import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import Variant from '../entities/variant.enum';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(Variant)
  variant: Variant;

  @IsOptional()
  userId?: string;
}
