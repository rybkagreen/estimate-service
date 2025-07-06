import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { BackgroundJobsController } from './background-jobs.controller';
import { EstimateJobsProcessor } from './processors/estimate-jobs.processor';
import { NotificationJobsProcessor } from './processors/notification-jobs.processor';
import { EstimateJobsService } from './services/estimate-jobs.service';
import { NotificationJobsService } from './services/notification-jobs.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
        },
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: 'estimate-calculations',
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 10,
        },
      },
      {
        name: 'notifications',
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 20,
        },
      },
      {
        name: 'reports',
        defaultJobOptions: {
          removeOnComplete: 20,
          removeOnFail: 5,
        },
      },
      {
        name: 'data-import',
        defaultJobOptions: {
          removeOnComplete: 5,
          removeOnFail: 3,
        },
      }
    ),
    PrismaModule,
  ],
  controllers: [BackgroundJobsController],
  providers: [
    EstimateJobsService,
    NotificationJobsService,
    EstimateJobsProcessor,
    NotificationJobsProcessor,
  ],
  exports: [
    EstimateJobsService,
    NotificationJobsService,
    BullModule,
  ],
})
export class BackgroundJobsModule {}
