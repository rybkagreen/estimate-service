import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { GracefulShutdownService } from './services/graceful-shutdown.service';
import { RequestIdInterceptor } from './interceptors/request-id.interceptor';
import { SentryModule } from './sentry/sentry.module';

@Global()
@Module({
  imports: [ConfigModule, SentryModule],
  providers: [
    {
      provide: APP_FILTER,
      useFactory: (configService: ConfigService) => {
        const isDevMode = configService.get('NODE_ENV') !== 'production';
        return new GlobalExceptionFilter(isDevMode);
      },
      inject: [ConfigService],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
    GracefulShutdownService,
  ],
  exports: [GracefulShutdownService],
})
export class CommonModule {}
