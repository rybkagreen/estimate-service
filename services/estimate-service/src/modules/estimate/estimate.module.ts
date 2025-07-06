import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SharedCacheModule } from '../../shared/cache/enhanced-cache.module';
import { CircuitBreakerModule } from '../../shared/circuit-breaker/circuit-breaker.module';
import { StreamingModule } from '../../shared/streaming/streaming.module';
import { EstimateController } from './estimate.controller';
import { EstimateService } from './estimate.service';

@Module({
  imports: [
    SharedCacheModule,
    StreamingModule,
    CircuitBreakerModule,
  ],
  controllers: [EstimateController],
  providers: [EstimateService, PrismaService],
  exports: [EstimateService],
})
export class EstimateModule {}
