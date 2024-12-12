import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, DataSource, In } from 'typeorm';
import { Broadcast } from './entities/broadcast.entity';
import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/user.entity';
import BroadcastStatus from './entities/broadcast-status.enum';
import { BotService } from 'src/bot/bot.service';
import { ImageUploadService } from 'common/utils/image-upload.service';

@Injectable()
export class BroadcastsService {
  private readonly logger = new Logger(BroadcastsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly botService: BotService,
    private readonly manager: EntityManager,
    private readonly imageUploadService: ImageUploadService,
  ) {}

  // Метод для создания новой рассылки
  async createBroadcast(
    broadcastData: {
      name: string;
      message: string;
      groupIds: string[];
    },
    files: Express.Multer.File[] = [], // Необязательный массив файлов с дефолтным пустым массивом
  ): Promise<Broadcast> {
    // Логика создания броадкаста

    return this.dataSource.transaction(async (manager: EntityManager) => {
      const { name, message, groupIds } = broadcastData;
      const imageUrls = files?.length
        ? await Promise.all(
            files.map((image) =>
              this.imageUploadService.uploadImageToImgbb(image),
            ),
          )
        : [];
      // Используем find с In для получения групп и загрузки связанных пользователей
      const groups = await manager.getRepository(Group).find({
        where: {
          id: In(groupIds), // Поиск по массиву идентификаторов
        },
        relations: ['users'], // Загружаем пользователей вместе с группами
      });

      if (!groups.length) {
        throw new Error('No groups found for the provided IDs.');
      }

      // Создаем новый объект рассылки
      const broadcast = manager.create(Broadcast, {
        name,
        message,
        groups,
        status: BroadcastStatus.IN_PROGRESS,
        images: imageUrls,
      });

      const savedBroadcast = await manager.save(Broadcast, broadcast);

      // Обрабатываем рассылку
      try {
        await this.processBroadcast(manager, savedBroadcast, groups);
        savedBroadcast.status = BroadcastStatus.COMPLETED; // Если рассылка прошла успешно
      } catch (error) {
        this.logger.error(
          `Failed to process broadcast: ${error.message}`,
          error.stack,
        );
        savedBroadcast.status = BroadcastStatus.FAILED; // Если возникла ошибка
      }

      // Обновляем статус рассылки
      await manager.save(Broadcast, savedBroadcast);

      return savedBroadcast;
    });
  }

  // Процесс рассылки сообщений всем пользователям в группах
  private async processBroadcast(
    manager: EntityManager,
    broadcast: Broadcast,
    groups: Group[],
  ): Promise<void> {
    const usersSet = new Set<User>(); // Множество для уникальных пользователей

    // Собираем уникальных пользователей из всех групп
    groups.forEach((group) => {
      group.users.forEach((user) => {
        usersSet.add(user); // Добавляем только уникальных пользователей
      });
    });

    // Отправляем сообщение каждому уникальному пользователю
    for (const user of usersSet) {
      try {
        await this.botService.sendMessageToUser(
          user,
          broadcast.message,
          broadcast.images,
        ); // Отправляем сообщение через бот
        this.logger.log(`Message sent to user ${user.telegram.telegram_id}`);
      } catch (error) {
        this.logger.warn(
          `Failed to send message to user ${user.telegram.telegram_id}: ${error.message}`,
        );
      }
    }
  }

  // Получение всех рассылок
  async findAll(): Promise<Broadcast[]> {
    return this.manager.find(Broadcast, {
      relations: {
        groups: { users: true },
      },
    });
  }

  // Получение рассылки по ID
  async findOne(id: string): Promise<Broadcast> {
    const broadcast = await this.manager.findOne(Broadcast, {
      where: { id },
      relations: ['groups', 'groups.users'], // Загружаем связанные группы и пользователей
    });

    if (!broadcast) {
      throw new NotFoundException(`Broadcast with ID ${id} not found.`);
    }

    return broadcast;
  }

  // Обновление рассылки
  async updateBroadcast(
    id: string,
    updateData: { name?: string; message?: string; groupIds?: string[] },
  ): Promise<Broadcast> {
    const broadcast = await this.findOne(id); // Ищем рассылку по ID

    // Если нужно обновить группы, проверим их наличие
    if (updateData.groupIds) {
      const groups = await this.manager.getRepository(Group).find({
        where: {
          id: In(updateData.groupIds),
        },
      });

      if (groups.length !== updateData.groupIds.length) {
        throw new BadRequestException('Some groups were not found.');
      }

      broadcast.groups = groups; // Обновляем группы
    }

    // Обновляем остальные поля
    if (updateData.name) broadcast.name = updateData.name;
    if (updateData.message) broadcast.message = updateData.message;

    return this.manager.save(Broadcast, broadcast);
  }

  // Удаление рассылки по ID
  async deleteBroadcast(id: string): Promise<void> {
    const broadcast = await this.findOne(id); // Ищем рассылку по ID

    if (!broadcast) {
      throw new NotFoundException(`Broadcast with ID ${id} not found.`);
    }

    await this.manager.remove(Broadcast, broadcast); // Удаляем рассылку
    this.logger.log(`Broadcast with ID ${id} has been deleted.`);
  }
}
