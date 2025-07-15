import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EstimateQueueProcessor } from './estimate-queue.processor';
import { EstimateQueueService } from './estimate-queue.service';

/**
 * Модуль для обработки задач расчета смет в очереди
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'estimate-calculations',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
    BullModule.registerQueue({
      name: 'file-processing',
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
        timeout: 600000, // 10 минут для больших файлов
      },
    }),
    BullModule.registerQueue({
      name: 'ai-analysis',
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
        timeout: 300000, // 5 минут для AI анализа
      },
    }),
  ],
  providers: [EstimateQueueProcessor, EstimateQueueService],
  exports: [EstimateQueueService],
})
export class EstimateQueueModule {}
