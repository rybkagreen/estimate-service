import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FgisCSDataSyncService } from './fgis-cs-data-sync.service';
import { FgisCSConfigService } from './fgis-cs-config.service';
import { FgisVectorizationService } from './vectorization/fgis-vectorization.service';

/**
 * Сервис для автоматической синхронизации данных из ФГИС ЦС по расписанию
 */
@Injectable()
export class FgisCSSchedulerService {
  private readonly logger = new Logger(FgisCSSchedulerService.name);

  constructor(
    private readonly syncService: FgisCSDataSyncService,
    private readonly configService: FgisCSConfigService,
    private readonly vectorizationService: FgisVectorizationService,
  ) {}

  /**
   * Ежедневная синхронизация данных в 3:00
   */
  @Cron('0 3 * * *', {
    name: 'fgis-daily-sync',
    timeZone: 'Europe/Moscow',
  })
  async handleDailySync() {
    if (!this.configService.enableAutoSync) {
      return;
    }

    this.logger.log('Starting scheduled daily sync...');
    
    try {
      // Синхронизация данных
      const syncResult = await this.syncService.syncAllData();
      this.logger.log(`Daily sync completed with status: ${syncResult.status}`);
      
      // Если синхронизация прошла успешно, запускаем векторизацию
      if (syncResult.status !== 'FAILED') {
        this.logger.log('Starting vectorization after sync...');
        const vectorResult = await this.vectorizationService.vectorizeDbData();
        this.logger.log(`Vectorization completed. Total chunks: ${vectorResult.totalChunks}`);
      }
    } catch (error) {
      this.logger.error('Failed to complete daily sync:', error);
    }
  }

  /**
   * Еженедельная полная синхронизация (по воскресеньям в 2:00)
   */
  @Cron('0 2 * * 0', {
    name: 'fgis-weekly-full-sync',
    timeZone: 'Europe/Moscow',
  })
  async handleWeeklyFullSync() {
    if (!this.configService.enableAutoSync) {
      return;
    }

    this.logger.log('Starting scheduled weekly full sync...');
    
    try {
      // Полная синхронизация всех данных
      const syncResult = await this.syncService.syncAllData();
      this.logger.log(`Weekly full sync completed with status: ${syncResult.status}`);
      
      // Векторизация с созданием примеров запросов
      if (syncResult.status !== 'FAILED') {
        await this.vectorizationService.vectorizeDbData();
        await this.vectorizationService.createSampleQueries();
        this.logger.log('Weekly vectorization with sample queries completed');
      }
    } catch (error) {
      this.logger.error('Failed to complete weekly full sync:', error);
    }
  }

  /**
   * Проверка обновлений каждые 6 часов
   */
  @Cron(CronExpression.EVERY_6_HOURS, {
    name: 'fgis-check-updates',
    timeZone: 'Europe/Moscow',
  })
  async checkForUpdates() {
    if (!this.configService.enableAutoSync) {
      return;
    }

    this.logger.log('Checking for FGIS data updates...');
    
    try {
      // Здесь можно добавить логику проверки обновлений
      // Например, сравнение дат последних изменений в API
      const stats = await this.syncService.getSyncStatistics();
      this.logger.log(`Current data statistics:`, stats);
    } catch (error) {
      this.logger.error('Failed to check for updates:', error);
    }
  }
}
