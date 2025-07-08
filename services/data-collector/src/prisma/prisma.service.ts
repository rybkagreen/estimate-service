import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Подключение к базе данных установлено');
    } catch (error) {
      this.logger.error('Ошибка подключения к базе данных:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Отключение от базы данных');
  }
}
