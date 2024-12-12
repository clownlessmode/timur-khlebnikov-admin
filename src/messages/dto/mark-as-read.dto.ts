import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ArrayNotEmpty } from 'class-validator';

export class MarkMessagesAsReadDto {
  @ApiProperty({
    description: 'Array of message IDs to mark as read',
    example: ['msg123', 'msg456', 'msg789'],
    type: [String],
  })
  @IsArray({ message: 'Message IDs must be an array' })
  @ArrayNotEmpty({ message: 'Message IDs array cannot be empty' })
  @IsString({ each: true, message: 'Each message ID must be a string' })
  @IsNotEmpty({ each: true, message: 'Each message ID cannot be empty' })
  messageIds: string[];
}
