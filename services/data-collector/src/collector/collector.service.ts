import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CollectorService {
  private readonly logger = new Logger(CollectorService.name);

  constructor() {
    this.logger.log('CollectorService инициализирован');
  }

  async collectData(): Promise<void> {
    this.logger.log('Начинается сбор данных...');
    // TODO: Реализовать логику сбора данных
  }
}
