/**
 * Сервис автоматизации для планирования и выполнения задач по сбору данных
 */

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as path from 'path';
import { DownloadConfig, FileDownloadService } from './file-download.service';
import { FileParserService } from './file-parser.service';

export interface AutomationConfig {
  enabled: boolean;
  sources: {
    fer: string[];
    ter: string[];
    gesn: string[];
  };
  schedule: {
    downloadCron: string;
    parseCron: string;
    cleanupCron: string;
  };
}

export interface AutomationStats {
  lastDownload: Date | null;
  lastParse: Date | null;
  lastCleanup: Date | null;
  totalDownloads: number;
  totalParsed: number;
  totalErrors: number;
}

@Injectable()
export class AutomationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AutomationService.name);
  private isRunning = false;
  private config: AutomationConfig;
  private stats: AutomationStats = {
    lastDownload: null,
    lastParse: null,
    lastCleanup: null,
    totalDownloads: 0,
    totalParsed: 0,
    totalErrors: 0,
  };

  constructor(
    private fileDownloadService: FileDownloadService,
    private fileParserService: FileParserService,
  ) {
    // Загружаем конфигурацию из переменных окружения или файла
    this.config = this.loadConfig();
  }

  async onModuleInit() {
    if (this.config.enabled) {
      this.logger.log('🤖 Сервис автоматизации инициализирован');
      this.logger.log(`📅 Расписание скачивания: ${this.config.schedule.downloadCron}`);
      this.logger.log(`📊 Расписание парсинга: ${this.config.schedule.parseCron}`);
      this.logger.log(`🧹 Расписание очистки: ${this.config.schedule.cleanupCron}`);
    } else {
      this.logger.log('⏸️ Автоматизация отключена');
    }
  }

  async onModuleDestroy() {
    this.isRunning = false;
    this.logger.log('🔴 Сервис автоматизации остановлен');
  }

  /**
   * Автоматическое скачивание файлов по расписанию
   */
  @Cron('0 2 * * *') // Каждый день в 2:00
  async scheduledDownload() {
    if (!this.config.enabled || this.isRunning) {
      return;
    }

    try {
      this.isRunning = true;
      this.logger.log('🚀 Запуск автоматического скачивания файлов');

      const downloadConfigs: DownloadConfig[] = [
        // ФЕР файлы
        ...this.config.sources.fer.map((url, index) => ({
          url,
          fileName: `fer_${Date.now()}_${index}.${this.getFileExtension(url)}`,
        })),
        // ТЕР файлы
        ...this.config.sources.ter.map((url, index) => ({
          url,
          fileName: `ter_${Date.now()}_${index}.${this.getFileExtension(url)}`,
        })),
        // ГЭСН файлы
        ...this.config.sources.gesn.map((url, index) => ({
          url,
          fileName: `gesn_${Date.now()}_${index}.${this.getFileExtension(url)}`,
        })),
      ];

      const results = await this.fileDownloadService.downloadFiles(downloadConfigs);

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      this.stats.lastDownload = new Date();
      this.stats.totalDownloads += successful;
      this.stats.totalErrors += failed;

      this.logger.log(`✅ Скачивание завершено: ${successful} успешно, ${failed} ошибок`);

      // Автоматически запускаем парсинг через 10 минут
      setTimeout(() => this.parseDownloadedFiles(), 10 * 60 * 1000);
    } catch (error) {
      this.logger.error('❌ Ошибка при автоматическом скачивании:', error);
      this.stats.totalErrors++;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Автоматический парсинг скачанных файлов
   */
  @Cron('0 3 * * *') // Каждый день в 3:00
  async scheduledParsing() {
    if (!this.config.enabled) {
      return;
    }

    await this.parseDownloadedFiles();
  }

  /**
   * Автоматическая очистка старых файлов
   */
  @Cron('0 4 * * 0') // Каждое воскресенье в 4:00
  async scheduledCleanup() {
    if (!this.config.enabled) {
      return;
    }

    try {
      this.logger.log('🧹 Запуск автоматической очистки старых файлов');

      const deletedCount = await this.fileDownloadService.cleanupOldFiles(168); // 7 дней

      this.stats.lastCleanup = new Date();

      this.logger.log(`🗑️ Очистка завершена: удалено ${deletedCount} файлов`);
    } catch (error) {
      this.logger.error('❌ Ошибка при автоматической очистке:', error);
      this.stats.totalErrors++;
    }
  }

  /**
   * Парсинг скачанных файлов
   */
  private async parseDownloadedFiles() {
    try {
      this.logger.log('📊 Запуск парсинга скачанных файлов');

      const downloadDir = this.fileDownloadService.getDownloadDir();
      const files = await this.fileDownloadService.getDownloadedFiles();

      if (files.length === 0) {
        this.logger.log('📂 Нет файлов для парсинга');
        return;
      }

      const filePaths = files.map(file => path.join(downloadDir, file));
      const parseResults = await this.fileParserService.parseFiles(filePaths);

      let processedCount = 0;

      for (const result of parseResults) {
        if (result.success && result.data) {
          // Определяем тип данных по имени файла
          const fileType = this.detectFileType(result.fileName);

          if (fileType) {
            // Извлекаем структурированные данные
            const structuredData = this.fileParserService.extractStructuredData(
              result.data.content,
              fileType,
            );

            if (structuredData.length > 0) {
              // Здесь можно сохранить данные в базу через CollectorService
              this.logger.log(
                `📋 Извлечено ${structuredData.length} записей из ${result.fileName}`,
              );
              processedCount++;
            }
          }
        }
      }

      this.stats.lastParse = new Date();
      this.stats.totalParsed += processedCount;

      const successful = parseResults.filter(r => r.success).length;
      const failed = parseResults.filter(r => !r.success).length;

      this.logger.log(`✅ Парсинг завершен: ${successful} успешно, ${failed} ошибок`);
    } catch (error) {
      this.logger.error('❌ Ошибка при парсинге файлов:', error);
      this.stats.totalErrors++;
    }
  }

  /**
   * Ручной запуск сбора данных
   */
  async manualTrigger(): Promise<boolean> {
    if (this.isRunning) {
      this.logger.warn('⚠️ Автоматизация уже выполняется');
      return false;
    }

    try {
      await this.scheduledDownload();
      return true;
    } catch (error) {
      this.logger.error('❌ Ошибка при ручном запуске:', error);
      return false;
    }
  }

  /**
   * Получение статистики
   */
  getStats(): AutomationStats {
    return { ...this.stats };
  }

  /**
   * Обновление конфигурации
   */
  updateConfig(newConfig: Partial<AutomationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.log('⚙️ Конфигурация автоматизации обновлена');
  }

  /**
   * Загрузка конфигурации
   */
  private loadConfig(): AutomationConfig {
    return {
      enabled: process.env.AUTOMATION_ENABLED === 'true' || false,
      sources: {
        fer: (process.env.FER_SOURCES || '').split(',').filter(Boolean),
        ter: (process.env.TER_SOURCES || '').split(',').filter(Boolean),
        gesn: (process.env.GESN_SOURCES || '').split(',').filter(Boolean),
      },
      schedule: {
        downloadCron: process.env.DOWNLOAD_CRON || '0 2 * * *',
        parseCron: process.env.PARSE_CRON || '0 3 * * *',
        cleanupCron: process.env.CLEANUP_CRON || '0 4 * * 0',
      },
    };
  }

  /**
   * Определение расширения файла по URL
   */
  private getFileExtension(url: string): string {
    const urlPath = new URL(url).pathname;
    const extension = path.extname(urlPath);
    return extension ? extension.substring(1) : 'unknown';
  }

  /**
   * Определение типа данных по имени файла
   */
  private detectFileType(fileName: string): 'FER' | 'TER' | 'GESN' | null {
    const name = fileName.toLowerCase();

    if (name.includes('fer') || name.includes('фер')) {
      return 'FER';
    } else if (name.includes('ter') || name.includes('тер')) {
      return 'TER';
    } else if (name.includes('gesn') || name.includes('гэсн')) {
      return 'GESN';
    }

    return null;
  }
}
