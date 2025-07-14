import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

export interface EstimateCalculationJobData {
  estimateId: string;
  userId?: string;
  priority?: 'low' | 'normal' | 'high';
  recalculateAll?: boolean;
}

export interface BulkEstimateJobData {
  estimateIds: string[];
  userId?: string;
  operationType: 'recalculate' | 'approve' | 'export';
}

export interface FSBTSCalculationJobData {
  estimateId: string;
  regionCode: string;
  includeAllVariants?: boolean;
  optimizeForCost?: boolean;
  userId?: string;
}

@Injectable()
export class EstimateJobsService {
  private readonly logger = new Logger(EstimateJobsService.name);

  constructor(
    @InjectQueue('estimate-calculations') private estimateQueue: Queue,
  ) {}

  /**
   * Добавить задачу пересчета сметы
   */
  async addCalculationJob(
    data: EstimateCalculationJobData,
    options?: {
      delay?: number;
      priority?: number;
      attempts?: number;
    }
  ): Promise<void> {
    try {
      const job = await this.estimateQueue.add('calculate-estimate', data, {
        priority: this.getPriorityNumber(data.priority),
        delay: options?.delay,
        attempts: options?.attempts || 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      this.logger.log(`Задача расчета сметы добавлена: ${job.id} для сметы ${data.estimateId}`);
    } catch (error) {
      this.logger.error(`Ошибка добавления задачи расчета сметы ${data.estimateId}:`, error);
      throw error;
    }
  }

  /**
   * Добавить задачу массового пересчета смет
   */
  async addBulkCalculationJob(data: BulkEstimateJobData): Promise<void> {
    try {
      const job = await this.estimateQueue.add('bulk-calculate-estimates', data, {
        priority: 5, // Средний приоритет для массовых операций
        attempts: 2,
      });

      this.logger.log(`Задача массового расчета добавлена: ${job.id} для ${data.estimateIds.length} смет`);
    } catch (error) {
      this.logger.error('Ошибка добавления задачи массового расчета:', error);
      throw error;
    }
  }

  /**
   * Добавить задачу экспорта сметы
   */
  async addExportJob(
    estimateId: string,
    format: 'pdf' | 'excel' | 'grand-smeta',
    userId?: string
  ): Promise<void> {
    try {
      const job = await this.estimateQueue.add('export-estimate', {
        estimateId,
        format,
        userId,
      }, {
        priority: 3, // Высокий приоритет для экспорта
        attempts: 2,
      });

      this.logger.log(`Задача экспорта сметы добавлена: ${job.id} для сметы ${estimateId} в формате ${format}`);
    } catch (error) {
      this.logger.error(`Ошибка добавления задачи экспорта сметы ${estimateId}:`, error);
      throw error;
    }
  }

  /**
   * Добавить задачу валидации сметы
   */
  async addValidationJob(estimateId: string, userId?: string): Promise<void> {
    try {
      const job = await this.estimateQueue.add('validate-estimate', {
        estimateId,
        userId,
      }, {
        priority: 7,
        attempts: 1, // Валидация не требует повторных попыток
      });

      this.logger.log(`Задача валидации сметы добавлена: ${job.id} для сметы ${estimateId}`);
    } catch (error) {
      this.logger.error(`Ошибка добавления задачи валидации сметы ${estimateId}:`, error);
      throw error;
    }
  }

  /**
   * Получить статистику очереди
   */
  async getQueueStats() {
    const waiting = await this.estimateQueue.getWaiting();
    const active = await this.estimateQueue.getActive();
    const completed = await this.estimateQueue.getCompleted();
    const failed = await this.estimateQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length,
    };
  }

  /**
   * Очистить очередь
   */
  async cleanQueue(): Promise<void> {
    await this.estimateQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Удаляем завершенные задачи старше суток
    await this.estimateQueue.clean(24 * 60 * 60 * 1000, 'failed'); // Удаляем упавшие задачи старше суток
    this.logger.log('Очередь расчетов смет очищена');
  }

/**
   * Добавить задачу расчета по ФСБЦ-2022
   */
  async addFSBTSCalculationJob(
    data: FSBTSCalculationJobData,
    options?: {
      delay?: number;
      priority?: number;
    }
  ): Promise<void> {
    try {
      const job = await this.estimateQueue.add('calculate-fsbts', data, {
        priority: options?.priority || 2, // Высокий приоритет для ФСБЦ расчетов
        delay: options?.delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        timeout: 300000, // 5 минут на расчет
      });

      this.logger.log(`Задача ФСБЦ-2022 расчета добавлена: ${job.id} для сметы ${data.estimateId}`);
    } catch (error) {
      this.logger.error(`Ошибка добавления задачи ФСБЦ расчета для сметы ${data.estimateId}:`, error);
      throw error;
    }
  }

  /**
   * Добавить задачу оптимизации сметы
   */
  async addOptimizationJob(
    estimateId: string,
    optimizationCriteria: 'cost' | 'time' | 'balanced',
    userId?: string
  ): Promise<void> {
    try {
      const job = await this.estimateQueue.add('optimize-estimate', {
        estimateId,
        optimizationCriteria,
        userId,
      }, {
        priority: 4,
        attempts: 2,
        timeout: 600000, // 10 минут на оптимизацию
      });

      this.logger.log(`Задача оптимизации сметы добавлена: ${job.id} для сметы ${estimateId}`);
    } catch (error) {
      this.logger.error(`Ошибка добавления задачи оптимизации сметы ${estimateId}:`, error);
      throw error;
    }
  }

  /**
   * Преобразовать текстовый приоритет в числовой
   */
  private getPriorityNumber(priority?: 'low' | 'normal' | 'high'): number {
    switch (priority) {
      case 'high':
        return 1;
      case 'normal':
        return 5;
      case 'low':
        return 10;
      default:
        return 5;
    }
  }
}
