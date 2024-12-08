import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import Variant from '../entities/variant.enum';

export class SendDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;
  @IsNotEmpty()
  @IsString()
  message: string;
  @IsEnum(Variant)
  @IsString()
  variant: Variant;
}
