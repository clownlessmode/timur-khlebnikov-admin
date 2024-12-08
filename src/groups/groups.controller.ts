import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';

@ApiTags('Группы')
@Controller('groups')
@ApiBearerAuth()
export class GroupsController {
  private readonly logger = new Logger(GroupsController.name);

  constructor(private readonly groupsService: GroupsService) {}

  // Получение всех групп
  @Get()
  @ApiOperation({ summary: 'Получить все группы' })
  async findAll(): Promise<Group[]> {
    this.logger.debug('Получаем все группы');
    return this.groupsService.findAll();
  }

  // Получение группы по ID
  @Get(':id')
  @ApiOperation({ summary: 'Получить группу по ID' })
  async findOne(@Param('id') id: string): Promise<Group> {
    this.logger.debug(`Получаем группу с ID: ${id}`);
    return this.groupsService.findOne(id);
  }

  // Создание группы
  @Post()
  @ApiOperation({ summary: 'Создать новую группу' })
  async create(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    this.logger.debug('Создание новой группы');
    return this.groupsService.create(createGroupDto);
  }

  // Обновление группы
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить группу по ID' })
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    this.logger.debug(`Обновление группы с ID: ${id}`);
    return this.groupsService.update(id, updateGroupDto);
  }

  // Удаление группы
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить группу по ID' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.groupsService.remove(id);
    this.logger.debug(`Группа с ID ${id} была удалена`);
    return { message: `Группа с ID ${id} была удалена` };
  }
}
