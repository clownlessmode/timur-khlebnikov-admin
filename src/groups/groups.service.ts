import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(private readonly manager: EntityManager) {}

  // Создание новой группы
  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const { name, users } = createGroupDto;

    // Создаем новую группу
    const group = this.manager.create(Group, { name });

    // Если переданы пользователи, добавляем их в группу
    if (users && users.length) {
      // Находим пользователей по их UUID
      const userEntities = await this.manager.find(User, {
        where: {
          id: In(users), // Поиск по массиву UUID
        },
      });
      group.users = userEntities;
    }

    // Сохраняем группу
    return this.manager.save(Group, group);
  }

  // Получение всех групп
  async findAll(): Promise<Group[]> {
    return this.manager.find(Group, {
      relations: {
        users: true, // Загружаем пользователей
        broadcasts: true, // Загружаем рассылки
      },
    });
  }

  // Получение группы по ID
  async findOne(id: string): Promise<Group> {
    return this.manager.findOne(Group, {
      where: { id },
      relations: {
        users: true, // Загружаем пользователей
        broadcasts: true, // Загружаем рассылки
      },
    });
  }

  // Обновление группы
  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const { users, ...groupData } = updateGroupDto;

    // Находим текущую группу
    const group = await this.manager.findOne(Group, {
      where: { id },
      relations: ['users'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Обновляем простые поля группы
    Object.assign(group, groupData);

    // Если переданы пользователи, обновляем связи
    if (users) {
      // Находим пользователей по их UUID
      const userEntities = await this.manager.find(User, {
        where: {
          id: In(users),
        },
      });

      // Устанавливаем новых пользователей для группы
      group.users = userEntities;
    }

    // Сохраняем группу с обновленными связями
    await this.manager.save(group);

    // Возвращаем обновленную группу
    return this.findOne(id);
  }

  // Удаление группы
  async remove(id: string): Promise<void> {
    await this.manager.delete(Group, id);
  }
}
