import { Module } from '@nestjs/common';
import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { MonitoringService } from './monitoring.service';

@Module({
  imports: [],
  providers: [MonitoringService, CorrelationIdMiddleware],
  exports: [MonitoringService, CorrelationIdMiddleware],
})
export class MonitoringModule {}
