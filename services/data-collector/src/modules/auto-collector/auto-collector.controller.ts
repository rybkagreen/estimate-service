/**
 * Контроллер для управления автоматическим сбором данных ФСБЦ-2022
 */

import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';
import { AutoCollectorService } from '../../services/auto-collector.service';
import { FileDownloadService } from '../../services/file-download.service';
import { FileParserService } from '../../services/file-parser.service';
import { ScheduleConfig, ScheduledCollectorService } from '../../services/scheduled-collector.service';

@Controller('auto-collector')
export class AutoCollectorController {
  private readonly logger = new Logger(AutoCollectorController.name);

  constructor(
    private autoCollectorService: AutoCollectorService,
    private scheduledCollectorService: ScheduledCollectorService,
    private fileDownloadService: FileDownloadService,
    private fileParserService: FileParserService
  ) {}

  /**
   * Запуск полного автоматического сбора данных
   */
  @Post('collect-all')
  async collectAllData() {
    this.logger.log('Запуск полного сбора данных ФСБЦ-2022');

    try {
      const result = await this.autoCollectorService.collectAllData();

      return {
        success: true,
        message: 'Сбор данных запущен',
        data: {
          discoveryResults: result.discovery.length,
          downloadResults: result.downloads.length,
          successfulDownloads: result.downloads.filter((d: any) => d.success).length
        }
      };
    } catch (error) {
      this.logger.error(`Ошибка при сборе данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);

      return {
        success: false,
        message: 'Ошибка при сборе данных',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Обнаружение файлов для всех типов данных
   */
  @Post('discover-files')
  async discoverFiles() {
    try {
      const results = await this.autoCollectorService.discoverAllFiles();

      return {
        success: true,
        data: results,
        summary: {
          totalSources: results.length,
          successfulSources: results.filter((r: any) => r.success).length,
          totalFiles: results.reduce((sum: number, r: any) => sum + r.files.length, 0)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Обнаружение файлов для конкретного типа
   */
  @Post('discover-files/:type')
  async discoverFilesByType(@Param('type') type: string) {
    if (!['FER', 'TER', 'GESN'].includes(type)) {
      return {
        success: false,
        error: 'Неподдерживаемый тип данных. Используйте: FER, TER, GESN'
      };
    }

    try {
      const result = await this.autoCollectorService.discoverFiles(type as 'FER' | 'TER' | 'GESN');

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Получение статистики сбора данных
   */
  @Get('stats')
  async getCollectionStats() {
    try {
      const stats = await this.autoCollectorService.getCollectionStats();

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Получение списка скачанных файлов
   */
  @Get('downloaded-files')
  async getDownloadedFiles() {
    try {
      const files = await this.fileDownloadService.getDownloadedFiles();

      return {
        success: true,
        data: {
          files,
          totalFiles: files.length,
          downloadDir: this.fileDownloadService.getDownloadDir()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Парсинг конкретного файла
   */
  @Post('parse-file/:fileName')
  async parseFile(@Param('fileName') fileName: string) {
    try {
      const filePath = `${this.fileDownloadService.getDownloadDir()}/${fileName}`;
      const result = await this.fileParserService.parseFile(filePath);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Очистка старых файлов
   */
  @Delete('cleanup/:maxAgeHours')
  async cleanupFiles(@Param('maxAgeHours') maxAgeHours: string) {
    try {
      const hours = parseInt(maxAgeHours, 10);
      if (isNaN(hours) || hours < 1) {
        return {
          success: false,
          error: 'Некорректное значение возраста файлов'
        };
      }

      const deletedCount = await this.fileDownloadService.cleanupOldFiles(hours);

      return {
        success: true,
        data: {
          deletedFiles: deletedCount,
          maxAgeHours: hours
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Получение списка заданий планировщика
   */
  @Get('scheduler/jobs')
  getScheduledJobs() {
    try {
      const jobs = this.scheduledCollectorService.getAllJobs();
      const stats = this.scheduledCollectorService.getJobsStats();

      return {
        success: true,
        data: {
          jobs,
          stats
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Получение информации о конкретном задании
   */
  @Get('scheduler/jobs/:jobId')
  getScheduledJob(@Param('jobId') jobId: string) {
    try {
      const job = this.scheduledCollectorService.getJob(jobId);

      if (!job) {
        return {
          success: false,
          error: 'Задание не найдено'
        };
      }

      return {
        success: true,
        data: job
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Обновление расписания задания
   */
  @Put('scheduler/jobs/:jobId/schedule')
  updateJobSchedule(@Param('jobId') jobId: string, @Body() schedule: ScheduleConfig) {
    try {
      const updated = this.scheduledCollectorService.updateJobSchedule(jobId, schedule);

      return {
        success: updated,
        message: updated ? 'Расписание обновлено' : 'Не удалось обновить расписание'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Ручной запуск задания
   */
  @Post('scheduler/jobs/:jobId/run')
  async runJobManually(@Param('jobId') jobId: string) {
    try {
      const started = await this.scheduledCollectorService.runJobManually(jobId);

      return {
        success: started,
        message: started ? 'Задание запущено' : 'Не удалось запустить задание'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Удаление задания
   */
  @Delete('scheduler/jobs/:jobId')
  removeJob(@Param('jobId') jobId: string) {
    try {
      const removed = this.scheduledCollectorService.removeJob(jobId);

      return {
        success: removed,
        message: removed ? 'Задание удалено' : 'Не удалось удалить задание'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }
}
