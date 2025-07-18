import { ConfigService } from '@nestjs/config';
import { init, Integrations } from '@sentry/node';

export const initSentry = (configService: ConfigService) => {
  const dsn = configService.get<string>('SENTRY_DSN');
  const environment = configService.get<string>('NODE_ENV') || 'development';

  if (dsn) {
    init({
      dsn,
      environment,
      tracesSampleRate: 1.0,
      integrations: [new Integrations.Http({ tracing: true })],
    });
  }
};
