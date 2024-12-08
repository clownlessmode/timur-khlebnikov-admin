import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class JoinDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;
}
