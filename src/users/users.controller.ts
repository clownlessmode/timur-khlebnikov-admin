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
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto'; // DTO для создания пользователя
import { UpdateUserDto } from './dto/update-user.dto'; // DTO для обновления пользователя

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  // Получить всех пользователей
  @Get()
  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает список всех пользователей',
    type: [User],
  })
  async findMany(): Promise<User[]> {
    const users = await this.usersService.findMany();
    this.logger.debug(`Получено ${users.length} пользователей`);
    return users;
  }

  // Получить пользователя по ID
  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiResponse({ status: 200, description: 'Пользователь найден', type: User })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOne(id);
    this.logger.debug(`Получен пользователь с ID: ${id}`);
    return user;
  }

  // Создать нового пользователя
  @Post()
  @ApiOperation({ summary: 'Создать нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно создан',
    type: User,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const user = await this.usersService.create(createUserDto);
    this.logger.debug(`Создан новый пользователь с ID: ${user.id}`);
    return user;
  }

  // Обновить данные пользователя
  @Put(':id')
  @ApiOperation({ summary: 'Обновить данные пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь обновлен',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.usersService.update(id, updateUserDto);
    this.logger.debug(`Обновлены данные пользователя с ID: ${id}`);
    return user;
  }

  // Удалить пользователя
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь удален' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
    this.logger.debug(`Пользователь с ID: ${id} удален`);
  }
}
