import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { BotService } from './bot.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
@ApiTags('Bot')
@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post(':id')
  @ApiOperation({ summary: 'Получить ссылку на пользователя' })
  async contact(@Param('id') id: string) {
    console.log(id);
    return await this.botService.contactToUser(id);
  }
}
