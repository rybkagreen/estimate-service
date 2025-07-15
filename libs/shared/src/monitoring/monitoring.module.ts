import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { MonitoringService } from './monitoring.service';
import { LoggerService } from './logger.service';
import { MetricsService } from './metrics.service';
import { TracingService } from './tracing.service';
import { HealthService } from './health.service';
import { MonitoringConfig } from '../config/monitoring.config';

@Global()
@Module({})
export class MonitoringModule {
  static forRoot(): DynamicModule {
    return {
      module: MonitoringModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'MONITORING_CONFIG',
          useFactory: (configService: ConfigService) => {
            return configService.get<MonitoringConfig>('monitoring');
          },
          inject: [ConfigService],
        },
        {
          provide: 'SENTRY_INIT',
          useFactory: (configService: ConfigService) => {
            const monitoringConfig = configService.get<MonitoringConfig>('monitoring');
            
            if (monitoringConfig?.sentry?.enabled && monitoringConfig.sentry.dsn) {
              Sentry.init({
                dsn: monitoringConfig.sentry.dsn,
                environment: monitoringConfig.sentry.environment,
                debug: monitoringConfig.sentry.debug,
                sampleRate: monitoringConfig.sentry.sampleRate,
                tracesSampleRate: monitoringConfig.sentry.tracesSampleRate,
                profilesSampleRate: monitoringConfig.sentry.profilesSampleRate,
                attachStacktrace: monitoringConfig.sentry.attachStacktrace,
                autoSessionTracking: monitoringConfig.sentry.autoSessionTracking,
                maxBreadcrumbs: monitoringConfig.sentry.maxBreadcrumbs,
                release: monitoringConfig.sentry.release,
                dist: monitoringConfig.sentry.dist,
                integrations: [
                  // Node integrations
                  new Sentry.Integrations.Http({ tracing: true }),
                  new Sentry.Integrations.Express({ 
                    router: true,
                    transaction: true,
                  }),
                  // Profiling
                  new ProfilingIntegration(),
                  // Custom integrations based on config
                  ...(monitoringConfig.sentry.integrations.postgres ? [
                    new Sentry.Integrations.Postgres(),
                  ] : []),
                ],
                beforeSend(event, hint) {
                  // Scrub sensitive data
                  if (monitoringConfig.sentry.beforeSend.enabled) {
                    const scrubFields = monitoringConfig.sentry.beforeSend.scrubFields;
                    
                    // Scrub from request data
                    if (event.request) {
                      ['data', 'headers', 'cookies', 'query_string'].forEach(field => {
                        if (event.request[field]) {
                          event.request[field] = scrubData(event.request[field], scrubFields);
                        }
                      });
                    }
                    
                    // Scrub from extra context
                    if (event.extra) {
                      event.extra = scrubData(event.extra, scrubFields);
                    }
                    
                    // Scrub from user context
                    if (event.user) {
                      event.user = scrubData(event.user, scrubFields);
                    }
                  }
                  
                  return event;
                },
                ignoreErrors: monitoringConfig.sentry.ignoreErrors,
              });
            }
            
            return true;
          },
          inject: [ConfigService],
        },
        MonitoringService,
        LoggerService,
        MetricsService,
        TracingService,
        HealthService,
      ],
      exports: [
        MonitoringService,
        LoggerService,
        MetricsService,
        TracingService,
        HealthService,
        'MONITORING_CONFIG',
      ],
    };
  }
}

/**
 * Helper function to scrub sensitive data
 */
function scrubData(data: any, scrubFields: string[]): any {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const result = Array.isArray(data) ? [...data] : { ...data };
  
  for (const key in result) {
    if (scrubFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      result[key] = '[REDACTED]';
    } else if (typeof result[key] === 'object') {
      result[key] = scrubData(result[key], scrubFields);
    }
  }
  
  return result;
}
