import { Module, Global } from '@nestjs/common';
import { PriorityQueueService } from './priority-queue.service';
import { PriorityQueueController } from './priority-queue.controller';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Global()
@Module({
  providers: [
    PriorityQueueService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
  controllers: [PriorityQueueController],
  exports: [PriorityQueueService],
})
export class PriorityQueueModule {}
