import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { Broadcast } from 'src/broadcasts/entities/broadcast.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Telegram } from 'src/users/entities/telegram.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        return {
          type: configService.getOrThrow<'postgres'>('DATABASE_TYPE'),
          host: configService.getOrThrow<string>('DATABASE_HOST'),
          port: configService.getOrThrow<number>('DATABASE_PORT'),
          username: configService.getOrThrow<string>('DATABASE_USERNAME'),
          password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
          database: configService.getOrThrow<string>('DATABASE_DATABASE'),
          autoLoadEntities: true,
          synchronize: true,
          useUTC: true,
          poolSize: 20,
          entities: [User, Telegram, Group, Broadcast, Message],
        };
      },
    }),
  ],
})
export class PostgresModule {}
