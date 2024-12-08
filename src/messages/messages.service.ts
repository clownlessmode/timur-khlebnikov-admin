import { Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { EntityManager } from 'typeorm';
import { SendDto } from './dto/send.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    private manager: EntityManager,
    private usersService: UsersService,
  ) {}

  async findBy(id: string): Promise<Message[]> {
    return await this.manager.find(Message, {
      where: {
        user: {
          id,
        },
      },
    });
  }

  async create(dto: CreateMessageDto): Promise<Message> {
    console.log('Received DTO:', dto);

    const user = await this.usersService.findOne(dto.userId);

    if (!user) {
      throw new Error(`User with ID ${dto.userId} not found`);
    }

    const messageData = {
      content: dto.content,
      variant: dto.variant,
      user: user,
    };

    console.log('Message data to save:', messageData);

    const message = this.manager.create(Message, messageData);

    return await this.manager.save(message);
  }
}