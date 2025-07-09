import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SharedCacheModule } from '../../shared/cache/enhanced-cache.module';
import { CircuitBreakerModule } from '../../shared/circuit-breaker/circuit-breaker.module';
import { StreamingModule } from '../../shared/streaming/streaming.module';
import { EstimateController } from './estimate.controller';
import { EstimateService } from './estimate.service';
import { EstimateExtendedService } from './estimate-extended.service';

@Module({
  imports: [
    SharedCacheModule,
    StreamingModule,
    CircuitBreakerModule,
  ],
  controllers: [EstimateController],
  providers: [EstimateService, EstimateExtendedService, PrismaService],
  exports: [EstimateService, EstimateExtendedService],
})
export class EstimateModule {}
