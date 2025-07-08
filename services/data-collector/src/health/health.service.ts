import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor() {
    this.logger.log('HealthService инициализирован');
  }

  getHealth(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  getReadiness(): { status: string; services: Record<string, boolean> } {
    return {
      status: 'ready',
      services: {
        database: true,
        httpClient: true,
        parser: true,
      },
    };
  }
}
