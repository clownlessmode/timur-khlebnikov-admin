import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { BroadcastsService } from './broadcasts.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Broadcast } from './entities/broadcast.entity';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { UpdateBroadcastDto } from './dto/update-broadcast.dto';

@Controller('broadcasts')
export class BroadcastsController {
  constructor(private readonly broadcastsService: BroadcastsService) {}

  // Получение всех рассылок
  @Get()
  @ApiOperation({ summary: 'Получить все рассылки' })
  @ApiResponse({ status: 200, description: 'Все рассылки', type: [Broadcast] })
  async findAll(): Promise<Broadcast[]> {
    return this.broadcastsService.findAll();
  }

  // Получение рассылки по ID
  @Get(':id')
  @ApiOperation({ summary: 'Получить рассылку по ID' })
  @ApiResponse({
    status: 200,
    description: 'Найденная рассылка',
    type: Broadcast,
  })
  @ApiResponse({ status: 404, description: 'Рассылка не найдена' })
  async findOne(@Param('id') id: string): Promise<Broadcast> {
    return this.broadcastsService.findOne(id);
  }

  // Создание новой рассылки
  @Post()
  @ApiOperation({ summary: 'Создать новую рассылку' })
  @ApiResponse({
    status: 201,
    description: 'Создана новая рассылка',
    type: Broadcast,
  })
  async create(
    @Body() createBroadcastDto: CreateBroadcastDto,
  ): Promise<Broadcast> {
    return this.broadcastsService.createBroadcast(createBroadcastDto);
  }

  // Обновление рассылки по ID
  @Put(':id')
  @ApiOperation({ summary: 'Обновить рассылку по ID' })
  @ApiResponse({
    status: 200,
    description: 'Рассылка обновлена',
    type: Broadcast,
  })
  async update(
    @Param('id') id: string,
    @Body() updateBroadcastDto: UpdateBroadcastDto,
  ): Promise<Broadcast> {
    return this.broadcastsService.updateBroadcast(id, updateBroadcastDto);
  }

  // Удаление рассылки по ID
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить рассылку по ID' })
  @ApiResponse({ status: 200, description: 'Рассылка удалена' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.broadcastsService.deleteBroadcast(id);
  }
}
