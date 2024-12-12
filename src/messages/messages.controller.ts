import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Logger,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { MarkMessagesAsReadDto } from './dto/mark-as-read.dto';
@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(private readonly messagesService: MessagesService) {}

  // Получить всех пользователей

  // Обновить данные пользователя
  @Post('mark-as-read')
  @ApiOperation({ summary: 'Mark multiple messages as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  async markMessagesAsRead(@Body() data: MarkMessagesAsReadDto): Promise<void> {
    await this.messagesService.markMessagesAsRead(data.messageIds);
    this.logger.debug(`Messages marked as read: ${data.messageIds.join(', ')}`);
  }
}
