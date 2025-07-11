import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// Core modules
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

// Business modules
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { BackgroundJobsModule } from './modules/background-jobs/background-jobs.module';
import { ClassificationModule } from './modules/classification/classification.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EstimateModule } from './modules/estimate/estimate.module';
import { GrandSmetaModule } from './modules/grand-smeta/grand-smeta.module';
import { PredictionModule } from './modules/prediction/prediction.module';
import { ProjectModule } from './modules/project/project.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { ValidationModule } from './modules/validation/validation.module';

// Shared modules
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { SharedCacheModule } from './shared/cache/cache.module';
import { CircuitBreakerModule } from './shared/circuit-breaker/circuit-breaker.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { CorrelationIdMiddleware } from './shared/monitoring/correlation-id.middleware';
import { MonitoringModule } from './shared/monitoring/monitoring.module';
import { SecurityModule } from './shared/security/security.module';
import { StreamingModule } from './shared/streaming/streaming.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Security and performance
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes default TTL (in milliseconds)
      max: 1000, // maximum number of items in cache
    }),

    // Core modules
    PrismaModule,
    SharedCacheModule,
    StreamingModule,
    CircuitBreakerModule,
    MonitoringModule,
    SecurityModule,
    AuthModule,
    HealthModule,
    MetricsModule,

    // Business modules
    EstimateModule,
    ClassificationModule,
    TemplatesModule,
    GrandSmetaModule,
    AiAssistantModule,
    BackgroundJobsModule,
    PredictionModule,
    ValidationModule,
    DashboardModule,
    ProjectModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
