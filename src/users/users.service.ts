import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Telegram } from './entities/telegram.entity';
import { EntityManager, In } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Group } from 'src/groups/entities/group.entity';

@Injectable()
export class UsersService {
  constructor(private readonly manager: EntityManager) {}

  async findOne(id: string): Promise<User> {
    return await this.manager.findOneOrFail(User, {
      where: { id: id },
      relations: {
        messages: true,
      },
    });
  }

  async findTelegram(id: string): Promise<Telegram> {
    return await this.manager.findOneOrFail(Telegram, {
      where: { id: id },
    });
  }

  async findByTelegram(id: number): Promise<User> {
    return await this.manager.findOneOrFail(User, {
      where: { telegram: { telegram_id: id } },
    });
  }

  async findMany(): Promise<User[]> {
    return await this.manager.find(User, { relations: { groups: true } });
  }

  // Метод для создания нового пользователя
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { groups: groupIds, ...userData } = createUserDto;

    // Находим группы по ID с использованием оператора In
    const groups = await this.manager.find(Group, {
      where: { id: In(groupIds) }, // Используем In для поиска по нескольким ID
    });

    // Создаем нового пользователя и связываем с найденными группами
    const user = this.manager.create(User, {
      ...userData,
      groups, // Связываем пользователя с найденными группами
    });

    return await this.manager.save(user); // Сохраняем нового пользователя
  }
  // Метод для обновления данных пользователя
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Находим пользователя по ID
    const user = await this.manager.findOne(User, {
      where: { id },
      relations: ['groups'], // Загружаем группы, чтобы при необходимости обновить их
    });

    if (!user) {
      throw new Error('Пользователь не найден'); // Обработка ошибки, если пользователь не найден
    }

    // Обновляем данные пользователя
    Object.assign(user, updateUserDto);

    // Если обновляются группы, находим их по ID и устанавливаем новые связи
    if (updateUserDto.groups) {
      const groups = await this.manager.find(Group, {
        where: { id: In(updateUserDto.groups) }, // Используем In для поиска групп
      });
      user.groups = groups; // Перезаписываем старые группы на новые
    }

    return await this.manager.save(user); // Сохраняем обновленного пользователя
  }

  // Метод для удаления пользователя
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id); // Находим пользователя
    await this.manager.remove(user); // Удаляем пользователя из базы данных
  }
}
