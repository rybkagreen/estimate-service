/**
 * ETL Pipeline для обработки данных ФСБЦ-2022
 * Согласно ROADMAP Этап 1.1 - Создание ETL-пайплайна для обработки данных
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { FileDownloadService } from '../services/file-download.service';
import { FileParserService } from '../services/file-parser.service';
import { ValidationService } from '../services/validation.service';
import { FsbtsCollectorService } from './fsbts-collector.service';

export interface ETLConfig {
  batchSize: number;
  maxRetries: number;
  enableTransformation: boolean;
  validateBeforeLoad: boolean;
  skipDuplicates: boolean;
}

export interface ETLJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  recordsProcessed: number;
  recordsLoaded: number;
  errors: string[];
}

export interface ETLStats {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  totalRecordsProcessed: number;
  averageProcessingTime: number;
  lastRunTime: Date;
}

@Injectable()
export class ETLPipelineService {
  private readonly logger = new Logger(ETLPipelineService.name);

  private config: ETLConfig = {
    batchSize: 1000,
    maxRetries: 3,
    enableTransformation: true,
    validateBeforeLoad: true,
    skipDuplicates: true,
  };

  private jobs: Map<string, ETLJob> = new Map();
  private isRunning = false;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileDownloadService: FileDownloadService,
    private readonly fileParserService: FileParserService,
    private readonly validationService: ValidationService,
    private readonly fsbtsCollectorService: FsbtsCollectorService,
  ) {}

  /**
   * Автоматический запуск ETL pipeline по расписанию
   * Согласно ROADMAP: обработка данных каждые 6 часов
   */
  @Cron('0 */6 * * *', {
    name: 'etl-pipeline-scheduled',
    timeZone: 'Europe/Moscow',
  })
  async scheduledETLRun(): Promise<void> {
    this.logger.log('⏰ Запуск планового ETL процесса');
    await this.runFullPipeline();
  }

  /**
   * Полный запуск ETL пайплайна
   */
  async runFullPipeline(): Promise<ETLJob> {
    if (this.isRunning) {
      throw new Error('ETL пайплайн уже выполняется');
    }

    const jobId = this.generateJobId();
    const job: ETLJob = {
      id: jobId,
      name: 'Full ETL Pipeline',
      status: 'running',
      startTime: new Date(),
      recordsProcessed: 0,
      recordsLoaded: 0,
      errors: [],
    };

    this.jobs.set(jobId, job);
    this.isRunning = true;

    try {
      this.logger.log(`🚀 Запуск ETL пайплайна [Job: ${jobId}]`);

      // EXTRACT: Извлечение данных
      const extractedData = await this.extractData(job);

      // TRANSFORM: Трансформация данных
      const transformedData = await this.transformData(extractedData, job);

      // LOAD: Загрузка данных в БД
      await this.loadData(transformedData, job);

      // Завершение
      job.status = 'completed';
      job.endTime = new Date();

      this.logger.log(
        `✅ ETL пайплайн завершен [Job: ${jobId}]. Обработано: ${job.recordsProcessed}, Загружено: ${job.recordsLoaded}`,
      );
    } catch (error) {
      this.logger.error(`❌ Ошибка в ETL пайплайне [Job: ${jobId}]:`, error);
      job.status = 'failed';
      job.endTime = new Date();
      job.errors.push(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      this.isRunning = false;
    }

    return job;
  }

  /**
   * EXTRACT: Извлечение данных из различных источников
   */
  private async extractData(job: ETLJob): Promise<any[]> {
    this.logger.log('📥 EXTRACT: Извлечение данных...');

    const extractedData: any[] = [];

    try {
      // 1. Сбор данных ФСБЦ-2022
      const fsbtsData = await this.fsbtsCollectorService.getAllItems();
      extractedData.push(...fsbtsData.map((item: any) => ({ ...item, source: 'fsbts' })));

      // 2. Получение скачанных файлов
      const downloadedFiles = await this.fileDownloadService.getDownloadedFiles();

      // 3. Парсинг файлов
      for (const fileName of downloadedFiles) {
        const filePath = `${this.fileDownloadService.getDownloadDir()}/${fileName}`;
        const parseResult = await this.fileParserService.parseFile(filePath);

        if (parseResult.success && parseResult.data) {
          // Извлекаем структурированные данные
          const structuredData = this.fileParserService.extractStructuredData(
            parseResult.data.content,
            this.determineFileType(fileName),
          );
          extractedData.push(
            ...structuredData.map(item => ({ ...item, source: 'file', fileName })),
          );
        }
      }

      job.recordsProcessed = extractedData.length;
      this.logger.log(`📊 Извлечено ${extractedData.length} записей`);

      return extractedData;
    } catch (error) {
      this.logger.error('❌ Ошибка в фазе EXTRACT:', error);
      job.errors.push(`EXTRACT: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * TRANSFORM: Трансформация и нормализация данных
   */
  private async transformData(data: any[], job: ETLJob): Promise<any[]> {
    if (!this.config.enableTransformation) {
      this.logger.log('⏭️ TRANSFORM: Трансформация отключена, пропускаем...');
      return data;
    }

    this.logger.log('🔄 TRANSFORM: Трансформация данных...');

    const transformedData: any[] = [];
    let transformErrors = 0;

    for (const record of data) {
      try {
        const transformed = await this.transformRecord(record);

        if (transformed) {
          transformedData.push(transformed);
        }
      } catch (error) {
        this.logger.warn(`⚠️ Ошибка трансформации записи:`, error);
        transformErrors++;

        if (transformErrors < 10) {
          // Логируем только первые 10 ошибок
          job.errors.push(
            `TRANSFORM: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
          );
        }
      }
    }

    this.logger.log(
      `🔄 Трансформировано ${transformedData.length} записей, ошибок: ${transformErrors}`,
    );
    return transformedData;
  }

  /**
   * Трансформация отдельной записи
   */
  private async transformRecord(record: any): Promise<any | null> {
    // Нормализация кода
    if (record.code) {
      record.code = this.normalizeCode(record.code);
    }

    // Нормализация цены
    if (record.price || record.basePrice) {
      record.normalizedPrice = this.normalizePrice(record.price || record.basePrice);
    }

    // Нормализация единицы измерения
    if (record.unit) {
      record.normalizedUnit = this.normalizeUnit(record.unit);
    }

    // Определение категории
    record.category = this.determineCategory(record);

    // Валидация после трансформации
    if (this.config.validateBeforeLoad) {
      const validationResult = this.validationService.validateFerItem({
        code: record.code,
        name: record.name,
        unit: record.normalizedUnit,
        price: record.normalizedPrice,
      });

      if (!validationResult.isValid) {
        return null;
      }
    }

    return record;
  }

  /**
   * LOAD: Загрузка данных в базу данных
   */
  private async loadData(data: any[], job: ETLJob): Promise<void> {
    this.logger.log('💾 LOAD: Загрузка данных в БД...');

    let loadedCount = 0;
    let skippedCount = 0;
    const batches = this.chunkArray(data, this.config.batchSize);

    for (const batch of batches) {
      try {
        const results = await this.loadBatch(batch);
        loadedCount += results.loaded;
        skippedCount += results.skipped;
      } catch (error) {
        this.logger.error('❌ Ошибка загрузки batch:', error);
        job.errors.push(`LOAD: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);

        // Пытаемся загрузить записи по одной
        for (const record of batch) {
          try {
            await this.loadSingleRecord(record);
            loadedCount++;
          } catch (singleError) {
            this.logger.warn(`⚠️ Ошибка загрузки записи ${record.code}:`, singleError);
          }
        }
      }
    }

    job.recordsLoaded = loadedCount;
    this.logger.log(`💾 Загружено ${loadedCount} записей, пропущено ${skippedCount}`);
  }

  /**
   * Загрузка пакета записей
   */
  private async loadBatch(batch: any[]): Promise<{ loaded: number; skipped: number }> {
    let loaded = 0;
    let skipped = 0;

    // Используем транзакцию для пакетной загрузки
    await this.prismaService.$transaction(async prisma => {
      for (const record of batch) {
        try {
          // Проверка на дубликаты если включена
          if (this.config.skipDuplicates) {
            const existing = await prisma.fSBTSItem.findUnique({
              where: { code: record.code },
            });

            if (existing) {
              skipped++;
              continue;
            }
          }

          // Создание записи
          await prisma.fSBTSItem.create({
            data: {
              code: record.code,
              name: record.name,
              unit: record.normalizedUnit || record.unit,
              basePrice: record.normalizedPrice || record.price || record.basePrice,
              laborCost: record.laborCost || 0,
              materialCost: record.materialCost || 0,
              machineCost: record.machineCost || 0,
              source: record.source || 'unknown',
              chapter: record.chapter || 'Не указана',
              category: record.category || 'general',
              validFrom: record.validFrom || new Date(),
              metadata: record.metadata || {},
            },
          });

          loaded++;
        } catch (error) {
          // Если ошибка уникальности - пропускаем
          if ((error as any).code === 'P2002') {
            skipped++;
          } else {
            throw error;
          }
        }
      }
    });

    return { loaded, skipped };
  }

  /**
   * Загрузка одной записи
   */
  private async loadSingleRecord(record: any): Promise<void> {
    await this.prismaService.fSBTSItem.upsert({
      where: { code: record.code },
      update: {
        name: record.name,
        unit: record.normalizedUnit || record.unit,
        basePrice: record.normalizedPrice || record.price || record.basePrice,
        // ... другие поля
      },
      create: {
        code: record.code,
        name: record.name,
        unit: record.normalizedUnit || record.unit,
        basePrice: record.normalizedPrice || record.price || record.basePrice,
        laborCost: record.laborCost || 0,
        materialCost: record.materialCost || 0,
        machineCost: record.machineCost || 0,
        source: record.source || 'unknown',
        chapter: record.chapter || 'Не указана',
        category: record.category || 'general',
        validFrom: record.validFrom || new Date(),
        metadata: record.metadata || {},
      },
    });
  }

  /**
   * Получение статистики ETL процессов
   */
  getETLStats(): ETLStats {
    const jobs = Array.from(this.jobs.values());
    const completed = jobs.filter(j => j.status === 'completed');
    const failed = jobs.filter(j => j.status === 'failed');

    const totalProcessingTime = completed.reduce((sum, job) => {
      if (job.endTime) {
        return sum + (job.endTime.getTime() - job.startTime.getTime());
      }
      return sum;
    }, 0);

    return {
      totalJobs: jobs.length,
      successfulJobs: completed.length,
      failedJobs: failed.length,
      totalRecordsProcessed: jobs.reduce((sum, job) => sum + job.recordsProcessed, 0),
      averageProcessingTime: completed.length > 0 ? totalProcessingTime / completed.length : 0,
      lastRunTime:
        jobs.length > 0 ? new Date(Math.max(...jobs.map(j => j.startTime.getTime()))) : new Date(),
    };
  }

  /**
   * Получение информации о задаче
   */
  getJob(jobId: string): ETLJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Получение всех задач
   */
  getAllJobs(): ETLJob[] {
    return Array.from(this.jobs.values());
  }

  // Вспомогательные методы

  private generateJobId(): string {
    return `etl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private normalizeCode(code: string): string {
    return code.replace(/\s+/g, '').toUpperCase();
  }

  private normalizePrice(price: any): number {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const numPrice = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'));
      return isNaN(numPrice) ? 0 : numPrice;
    }
    return 0;
  }

  private normalizeUnit(unit: string): string {
    const unitMap: Record<string, string> = {
      м3: 'м³',
      м2: 'м²',
      'чел.-ч': 'чел·ч',
      'маш.-ч': 'маш·ч',
      т: 'т',
      шт: 'шт',
      кг: 'кг',
    };

    return unitMap[unit.toLowerCase()] || unit;
  }

  private determineCategory(record: any): string {
    if (record.source === 'fsbts') {
      return record.source || 'fsbts';
    }

    if (record.type) {
      return record.type.toLowerCase();
    }

    // Определяем по коду
    if (record.code) {
      if (record.code.startsWith('ФЕР') || record.code.includes('FER')) {
        return 'fer';
      }
      if (record.code.startsWith('ТЕР') || record.code.includes('TER')) {
        return 'ter';
      }
      if (record.code.startsWith('ГЭСН') || record.code.includes('GESN')) {
        return 'gesn';
      }
    }

    return 'general';
  }

  private determineFileType(fileName: string): 'FER' | 'TER' | 'GESN' {
    const fileNameLower = fileName.toLowerCase();

    if (fileNameLower.includes('фер') || fileNameLower.includes('fer')) {
      return 'FER';
    }
    if (fileNameLower.includes('тер') || fileNameLower.includes('ter')) {
      return 'TER';
    }
    if (fileNameLower.includes('гэсн') || fileNameLower.includes('gesn')) {
      return 'GESN';
    }

    return 'FER'; // По умолчанию
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
