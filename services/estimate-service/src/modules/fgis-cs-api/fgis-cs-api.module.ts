import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { FgisCSApiService } from './fgis-cs-api.service';
import { FgisCSApiController } from './fgis-cs-api.controller';
import { FgisCSConfigService } from './fgis-cs-config.service';
import { FgisCSDataSyncService } from './fgis-cs-data-sync.service';
import { FgisCSParserService } from './fgis-cs-parser.service';
import { FgisCSSchedulerService } from './fgis-cs-scheduler.service';
import { FgisVectorizationService } from './vectorization/fgis-vectorization.service';
import { FgisVectorizationController } from './vectorization/fgis-vectorization.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { SharedCacheModule } from '../../shared/cache/enhanced-cache.module';
import { CircuitBreakerModule } from '../../shared/circuit-breaker/circuit-breaker.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    ScheduleModule.forRoot(),
    SharedCacheModule,
    CircuitBreakerModule,
  ],
  controllers: [FgisCSApiController, FgisVectorizationController],
  providers: [
    FgisCSApiService,
    FgisCSConfigService,
    FgisCSDataSyncService,
    FgisCSParserService,
    FgisCSSchedulerService,
    FgisVectorizationService,
    PrismaService,
  ],
  exports: [FgisCSApiService, FgisCSDataSyncService, FgisVectorizationService],
})
export class FgisCSApiModule {}
