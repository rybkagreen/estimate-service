/**
 * Сервис для планирования автоматического сбора данных
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AutoCollectorService } from './auto-collector.service';
import { FileDownloadService } from './file-download.service';
import { FileParserService } from './file-parser.service';

export interface ScheduleConfig {
  enabled: boolean;
  cronExpression: string; // например, '0 2 * * 1' (каждый понедельник в 2:00)
  timezone?: string;
}

export interface CollectionJob {
  id: string;
  name: string;
  schedule: ScheduleConfig;
  lastRun?: Date;
  nextRun?: Date;
  status: 'active' | 'inactive' | 'running';
}

@Injectable()
export class ScheduledCollectorService implements OnModuleInit {
  private readonly logger = new Logger(ScheduledCollectorService.name);
  private readonly jobs = new Map<string, CollectionJob>();

  constructor(
    private autoCollectorService: AutoCollectorService,
    private fileParserService: FileParserService,
    private fileDownloadService: FileDownloadService,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  onModuleInit() {
    this.initializeDefaultSchedules();
  }

  /**
   * Инициализация стандартных расписаний
   */
  private initializeDefaultSchedules(): void {
    // Еженедельный сбор данных
    this.addJob({
      id: 'weekly-collection',
      name: 'Еженедельный сбор ФСБЦ-2022',
      schedule: {
        enabled: false, // Отключено до полной настройки
        cronExpression: '0 2 * * 1', // Каждый понедельник в 2:00
        timezone: 'Europe/Moscow'
      },
      status: 'inactive'
    });

    // Ежедневная очистка старых файлов
    this.addJob({
      id: 'daily-cleanup',
      name: 'Ежедневная очистка файлов',
      schedule: {
        enabled: false, // Отключено до полной настройки
        cronExpression: '0 3 * * *', // Каждый день в 3:00
        timezone: 'Europe/Moscow'
      },
      status: 'inactive'
    });

    this.logger.log('Инициализированы стандартные расписания');
  }

  /**
   * Добавление нового задания
   */
  addJob(job: CollectionJob): void {
    try {
      if (job.schedule.enabled) {
        // Простая реализация без cron на данном этапе
        job.nextRun = this.getNextRunDate(job.schedule.cronExpression);
      }

      this.jobs.set(job.id, job);
      this.logger.log(`Добавлено задание: ${job.name} (${job.id})`);
    } catch (error) {
      this.logger.error(`Ошибка при добавлении задания ${job.id}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Удаление задания
   */
  removeJob(jobId: string): boolean {
    try {
      const removed = this.jobs.delete(jobId);
      if (removed) {
        this.logger.log(`Удалено задание: ${jobId}`);
      }

      return removed;
    } catch (error) {
      this.logger.error(`Ошибка при удалении задания ${jobId}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return false;
    }
  }

  /**
   * Выполнение задания
   */
  private async executeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      this.logger.error(`Задание ${jobId} не найдено`);
      return;
    }

    job.status = 'running';
    job.lastRun = new Date();

    this.logger.log(`Начинаем выполнение задания: ${job.name}`);

    try {
      switch (jobId) {
        case 'weekly-collection':
          await this.executeWeeklyCollection();
          break;
        case 'daily-cleanup':
          await this.executeDailyCleanup();
          break;
        default:
          this.logger.warn(`Неизвестный тип задания: ${jobId}`);
      }

      job.status = 'active';
      job.nextRun = this.getNextRunDate(job.schedule.cronExpression);

      this.logger.log(`Задание ${job.name} выполнено успешно`);
    } catch (error) {
      job.status = 'active'; // Возвращаем в активное состояние даже при ошибке
      this.logger.error(`Ошибка при выполнении задания ${job.name}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Еженедельный сбор данных
   */
  private async executeWeeklyCollection(): Promise<void> {
    this.logger.log('Начинаем еженедельный сбор данных ФСБЦ-2022');

    // 1. Сбор и скачивание файлов
    const collectionResult = await this.autoCollectorService.collectAllData();

    this.logger.log(`Сбор завершен: обнаружено ${collectionResult.discovery.length} источников, скачано ${collectionResult.downloads.filter(d => d.success).length} файлов`);

    // 2. Парсинг скачанных файлов
    const downloadedFiles = await this.fileDownloadService.getDownloadedFiles();
    const filePaths = downloadedFiles.map(fileName =>
      `${this.fileDownloadService.getDownloadDir()}/${fileName}`
    );

    if (filePaths.length > 0) {
      this.logger.log(`Начинаем парсинг ${filePaths.length} файлов`);
      const parseResults = await this.fileParserService.parseFiles(filePaths);

      const successfulParses = parseResults.filter(r => r.success);
      this.logger.log(`Парсинг завершен: обработано ${successfulParses.length} файлов`);

      // 3. Извлечение структурированных данных
      for (const result of successfulParses) {
        if (result.data?.content) {
          const fileName = result.fileName.toLowerCase();
          let type: 'FER' | 'TER' | 'GESN' = 'FER';

          if (fileName.includes('ter') || fileName.includes('тер')) {
            type = 'TER';
          } else if (fileName.includes('gesn') || fileName.includes('гэсн')) {
            type = 'GESN';
          }

          const structuredData = this.fileParserService.extractStructuredData(result.data.content, type);
          this.logger.log(`Извлечено ${structuredData.length} записей типа ${type} из файла ${result.fileName}`);
        }
      }
    }

    this.logger.log('Еженедельный сбор данных завершен');
  }

  /**
   * Ежедневная очистка файлов
   */
  private async executeDailyCleanup(): Promise<void> {
    this.logger.log('Начинаем ежедневную очистку файлов');

    // Удаляем файлы старше 7 дней
    const deletedCount = await this.fileDownloadService.cleanupOldFiles(168);

    this.logger.log(`Очистка завершена: удалено ${deletedCount} файлов`);
  }

  /**
   * Получение списка всех заданий
   */
  getAllJobs(): CollectionJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Получение задания по ID
   */
  getJob(jobId: string): CollectionJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Обновление расписания задания
   */
  updateJobSchedule(jobId: string, schedule: ScheduleConfig): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    try {
      job.schedule = schedule;

      if (schedule.enabled) {
        job.nextRun = this.getNextRunDate(schedule.cronExpression);
        job.status = 'active';
      } else {
        job.status = 'inactive';
      }

      this.logger.log(`Обновлено расписание для задания: ${job.name}`);
      return true;
    } catch (error) {
      this.logger.error(`Ошибка при обновлении расписания ${jobId}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return false;
    }
  }

  /**
   * Ручной запуск задания
   */
  async runJobManually(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    if (job.status === 'running') {
      this.logger.warn(`Задание ${jobId} уже выполняется`);
      return false;
    }

    this.logger.log(`Ручной запуск задания: ${job.name}`);
    await this.executeJob(jobId);

    return true;
  }

  /**
   * Вычисление времени следующего запуска
   */
  private getNextRunDate(cronExpression: string): Date {
    try {
      // Простое вычисление - добавляем сутки для примера
      // В реальной реализации нужно использовать библиотеку для парсинга cron
      const now = new Date();
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } catch {
      return new Date();
    }
  }

  /**
   * Получение статистики выполнения заданий
   */
  getJobsStats(): {
    total: number;
    active: number;
    running: number;
    inactive: number;
  } {
    const jobs = Array.from(this.jobs.values());

    return {
      total: jobs.length,
      active: jobs.filter(j => j.status === 'active').length,
      running: jobs.filter(j => j.status === 'running').length,
      inactive: jobs.filter(j => j.status === 'inactive').length
    };
  }
}
