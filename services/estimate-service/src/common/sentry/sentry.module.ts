import { Module, OnModuleInit } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Module({
  imports: [ConfigModule],
  providers: [],
  exports: [],
})
export class SentryModule implements OnModuleInit {
  private readonly logger = new Logger(SentryModule.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    
    if (!dsn) {
      this.logger.warn('Sentry DSN not provided. Sentry integration disabled.');
      return;
    }

    const environment = this.configService.get<string>('NODE_ENV', 'development');
    const release = this.configService.get<string>('APP_VERSION', 'unknown');

    Sentry.init({
      dsn,
      environment,
      release,
      tracesSampleRate: this.configService.get<number>('SENTRY_TRACE_RATE', 0.1),
      profilesSampleRate: this.configService.get<number>('SENTRY_PROFILE_RATE', 0.1),
      integrations: [
        // Node profiling integration
        nodeProfilingIntegration(),
      ],
      beforeSend: (event, hint) => {
        // Filter out non-critical errors in production
        if (environment === 'production') {
          // Don't send 4xx errors except specific ones
          if (event.exception?.values?.[0]?.value?.includes('status: 4')) {
            const status = parseInt(event.exception.values[0].value.match(/status: (\d+)/)?.[1] || '0');
            if (![401, 403, 409].includes(status)) {
              return null;
            }
          }
        }

        // Add additional context
        if (event.request) {
          // Remove sensitive data from request
          delete event.request.cookies;
          delete event.request.headers?.authorization;
          delete event.request.headers?.cookie;
        }

        return event;
      },
      // Set sampling rules
      tracesSampler: (samplingContext) => {
        // Different sampling rates for different transactions
        if (samplingContext.request?.url?.includes('/health')) {
          return 0; // Don't trace health checks
        }
        if (samplingContext.request?.url?.includes('/metrics')) {
          return 0; // Don't trace metrics endpoints
        }
        return this.configService.get<number>('SENTRY_TRACE_RATE', 0.1);
      },
    });

    this.logger.log('Sentry initialized successfully');
  }
}
