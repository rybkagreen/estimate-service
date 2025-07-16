import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Сервис для управления конфигурацией ФГИС ЦС
 */
@Injectable()
export class FgisCSConfigService {
  constructor(private readonly configService: ConfigService) {}

  get apiUrl(): string {
    return this.configService.get<string>('FGIS_CS_API_URL', 'https://fgiscs.minstroyrf.ru/api');
  }

  get apiKey(): string {
    return this.configService.get<string>('FGIS_CS_API_KEY', '');
  }

  get requestTimeout(): number {
    return this.configService.get<number>('FGIS_CS_REQUEST_TIMEOUT', 30000);
  }

  get maxRetries(): number {
    return this.configService.get<number>('FGIS_CS_MAX_RETRIES', 3);
  }

  get cacheTTL(): number {
    return this.configService.get<number>('FGIS_CS_CACHE_TTL', 86400); // 24 hours
  }

  get batchSize(): number {
    return this.configService.get<number>('FGIS_CS_BATCH_SIZE', 100);
  }

  get enableAutoSync(): boolean {
    return this.configService.get<boolean>('FGIS_CS_ENABLE_AUTO_SYNC', false);
  }

  get syncSchedule(): string {
    return this.configService.get<string>('FGIS_CS_SYNC_SCHEDULE', '0 3 * * *'); // Daily at 3 AM
  }
}
