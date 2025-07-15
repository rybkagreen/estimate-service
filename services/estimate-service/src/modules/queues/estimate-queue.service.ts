import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job, JobStatus, JobOptions } from 'bull';

export interface EstimateCalculationJob {
  estimateId: string;
  userId: string;
  data: any;
}

export interface FileProcessingJob {
  fileId: string;
  filePath: string;
  type: 'excel' | 'pdf' | 'grandsmeta';
  userId: string;
}

export interface AIAnalysisJob {
  estimateId: string;
  prompt: string;
  context: any;
}

/**
 * Сервис для управления очередями задач
 */
@Injectable()
export class EstimateQueueService {
  private readonly logger = new Logger(EstimateQueueService.name);

  constructor(
    @InjectQueue('estimate-calculations') private estimateQueue: Queue,
    @InjectQueue('file-processing') private fileQueue: Queue,
    @InjectQueue('ai-analysis') private aiQueue: Queue,
  ) {}

  /**
   * Добавить задачу расчета сметы
   */
  async addEstimateCalculation(
    data: EstimateCalculationJob,
    options?: JobOptions,
  ): Promise<Job<EstimateCalculationJob>> {
    try {
      const job = await this.estimateQueue.add('calculate', data, {
        priority: 1,
        delay: 0,
        ...options,
      });
      
      this.logger.log(`Added estimate calculation job ${job.id} for estimate ${data.estimateId}`);
      return job;
    } catch (error) {
      this.logger.error('Error adding estimate calculation job:', error);
      throw error;
    }
  }

  /**
   * Добавить задачу обработки файла
   */
  async addFileProcessing(
    data: FileProcessingJob,
    options?: JobOptions,
  ): Promise<Job<FileProcessingJob>> {
    try {
      const job = await this.fileQueue.add('process', data, {
        priority: data.type === 'grandsmeta' ? 0 : 1, // Приоритет для файлов Гранд Смета
        ...options,
      });
      
      this.logger.log(`Added file processing job ${job.id} for file ${data.fileId}`);
      return job;
    } catch (error) {
      this.logger.error('Error adding file processing job:', error);
      throw error;
    }
  }

  /**
   * Добавить задачу AI анализа
   */
  async addAIAnalysis(
    data: AIAnalysisJob,
    options?: JobOptions,
  ): Promise<Job<AIAnalysisJob>> {
    try {
      const job = await this.aiQueue.add('analyze', data, {
        priority: 2,
        ...options,
      });
      
      this.logger.log(`Added AI analysis job ${job.id} for estimate ${data.estimateId}`);
      return job;
    } catch (error) {
      this.logger.error('Error adding AI analysis job:', error);
      throw error;
    }
  }

  /**
   * Получить статус задачи
   */
  async getJobStatus(queueName: string, jobId: string): Promise<JobStatus | null> {
    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'estimate-calculations':
          queue = this.estimateQueue;
          break;
        case 'file-processing':
          queue = this.fileQueue;
          break;
        case 'ai-analysis':
          queue = this.aiQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }
      
      const job = await queue.getJob(jobId);
      if (!job) return null;
      
      return await job.getState();
    } catch (error) {
      this.logger.error(`Error getting job status for ${queueName}:${jobId}:`, error);
      return null;
    }
  }

  /**
   * Получить прогресс задачи
   */
  async getJobProgress(queueName: string, jobId: string): Promise<number> {
    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'estimate-calculations':
          queue = this.estimateQueue;
          break;
        case 'file-processing':
          queue = this.fileQueue;
          break;
        case 'ai-analysis':
          queue = this.aiQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }
      
      const job = await queue.getJob(jobId);
      if (!job) return 0;
      
      return job.progress() as number;
    } catch (error) {
      this.logger.error(`Error getting job progress for ${queueName}:${jobId}:`, error);
      return 0;
    }
  }

  /**
   * Отменить задачу
   */
  async cancelJob(queueName: string, jobId: string): Promise<boolean> {
    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'estimate-calculations':
          queue = this.estimateQueue;
          break;
        case 'file-processing':
          queue = this.fileQueue;
          break;
        case 'ai-analysis':
          queue = this.aiQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }
      
      const job = await queue.getJob(jobId);
      if (!job) return false;
      
      await job.remove();
      this.logger.log(`Cancelled job ${jobId} in queue ${queueName}`);
      return true;
    } catch (error) {
      this.logger.error(`Error cancelling job ${queueName}:${jobId}:`, error);
      return false;
    }
  }

  /**
   * Получить статистику очереди
   */
  async getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'estimate-calculations':
          queue = this.estimateQueue;
          break;
        case 'file-processing':
          queue = this.fileQueue;
          break;
        case 'ai-analysis':
          queue = this.aiQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }
      
      const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
        queue.getPausedCount(),
      ]);
      
      return { waiting, active, completed, failed, delayed, paused };
    } catch (error) {
      this.logger.error(`Error getting queue stats for ${queueName}:`, error);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        paused: 0,
      };
    }
  }

  /**
   * Очистить выполненные задачи
   */
  async cleanCompleted(queueName: string, grace = 3600000): Promise<void> {
    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'estimate-calculations':
          queue = this.estimateQueue;
          break;
        case 'file-processing':
          queue = this.fileQueue;
          break;
        case 'ai-analysis':
          queue = this.aiQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }
      
      await queue.clean(grace, 'completed');
      this.logger.log(`Cleaned completed jobs from ${queueName} older than ${grace}ms`);
    } catch (error) {
      this.logger.error(`Error cleaning completed jobs from ${queueName}:`, error);
    }
  }

  /**
   * Очистить проваленные задачи
   */
  async cleanFailed(queueName: string, grace = 86400000): Promise<void> {
    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'estimate-calculations':
          queue = this.estimateQueue;
          break;
        case 'file-processing':
          queue = this.fileQueue;
          break;
        case 'ai-analysis':
          queue = this.aiQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }
      
      await queue.clean(grace, 'failed');
      this.logger.log(`Cleaned failed jobs from ${queueName} older than ${grace}ms`);
    } catch (error) {
      this.logger.error(`Error cleaning failed jobs from ${queueName}:`, error);
    }
  }

  /**
   * Пауза очереди
   */
  async pauseQueue(queueName: string): Promise<void> {
    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'estimate-calculations':
          queue = this.estimateQueue;
          break;
        case 'file-processing':
          queue = this.fileQueue;
          break;
        case 'ai-analysis':
          queue = this.aiQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }
      
      await queue.pause();
      this.logger.log(`Paused queue ${queueName}`);
    } catch (error) {
      this.logger.error(`Error pausing queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Возобновить очередь
   */
  async resumeQueue(queueName: string): Promise<void> {
    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'estimate-calculations':
          queue = this.estimateQueue;
          break;
        case 'file-processing':
          queue = this.fileQueue;
          break;
        case 'ai-analysis':
          queue = this.aiQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }
      
      await queue.resume();
      this.logger.log(`Resumed queue ${queueName}`);
    } catch (error) {
      this.logger.error(`Error resuming queue ${queueName}:`, error);
      throw error;
    }
  }
}
