# Настройка системы мониторинга и наблюдаемости

## Обзор

Система мониторинга Estimate Service включает:

- **Sentry** - отслеживание ошибок и производительности
- **Структурированное логирование** - Winston с поддержкой Elasticsearch
- **OpenTelemetry** - распределенная трассировка и метрики
- **Prometheus** - сбор и хранение метрик
- **Health Checks** - проверка состояния сервисов

## Быстрый старт

### 1. Настройка переменных окружения

Скопируйте файл с примерами:

```bash
cp .env.monitoring.example .env.monitoring
```

### 2. Обязательные переменные

```env
# Sentry DSN (получите на https://sentry.io)
SENTRY_DSN=https://your-key@sentry.io/project-id

# Уровень логирования
LOG_LEVEL=info

# OpenTelemetry
OTEL_ENABLED=true
OTEL_SERVICE_NAME=estimate-service
```

### 3. Подключение в приложении

```typescript
// app.module.ts
import { MonitoringModule } from '@ez-eco/shared/monitoring';
import { monitoringConfig } from '@ez-eco/shared/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [monitoringConfig],
    }),
    MonitoringModule.forRoot(),
  ],
})
export class AppModule {}
```

## Компоненты системы

### Sentry

#### Настройка

```env
SENTRY_ENABLED=true
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_SAMPLE_RATE=1.0
SENTRY_TRACES_SAMPLE_RATE=0.1
```

#### Использование в коде

```typescript
import { LoggerService } from '@ez-eco/shared/monitoring';

@Injectable()
export class EstimateService {
  constructor(private logger: LoggerService) {
    this.logger.setContext('EstimateService');
  }

  async createEstimate(data: CreateEstimateDto) {
    try {
      // Ваш код
      this.logger.info('Estimate created', { estimateId: result.id });
    } catch (error) {
      this.logger.error('Failed to create estimate', error.stack);
      throw error;
    }
  }
}
```

### Структурированное логирование

#### Форматы логов

**JSON формат (production)**:

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "message": "Estimate created",
  "context": "EstimateService",
  "estimateId": "123",
  "userId": "456",
  "duration": 234
}
```

**Pretty формат (development)**:

```
2024-01-15T10:30:45.123Z [EstimateService] info: Estimate created {"estimateId":"123","userId":"456","duration":234}
```

#### Уровни логирования

- `error` - критические ошибки
- `warn` - предупреждения
- `info` - важные события
- `debug` - отладочная информация
- `verbose` - подробная информация

#### Логирование HTTP запросов

```typescript
// Автоматически логируются все HTTP запросы
// Исключения настраиваются через LOGGING_HTTP_EXCLUDE_PATHS
```

#### Логирование запросов к БД

```typescript
// Медленные запросы логируются автоматически
// Порог настраивается через SLOW_QUERY_THRESHOLD (мс)
```

### OpenTelemetry

#### Трассировка

```typescript
import { TracingService } from '@ez-eco/shared/monitoring';

@Injectable()
export class EstimateService {
  constructor(private tracing: TracingService) {}

  async processEstimate(id: string) {
    const span = this.tracing.startSpan('process-estimate');

    try {
      span.setAttributes({
        'estimate.id': id,
        'estimate.type': 'construction',
      });

      // Ваша бизнес-логика

      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  }
}
```

#### Экспорт в Jaeger

```env
OTEL_EXPORTER_JAEGER_ENABLED=true
OTEL_EXPORTER_JAEGER_ENDPOINT=http://localhost:14268/api/traces
```

### Метрики производительности

#### Встроенные метрики

1. **HTTP метрики**:
   - `http_request_duration_seconds` - длительность запросов
   - `http_request_size_bytes` - размер запросов
   - `http_response_size_bytes` - размер ответов
   - `http_active_requests` - активные запросы

2. **Системные метрики**:
   - `process_cpu_usage` - использование CPU
   - `process_memory_usage` - использование памяти
   - `nodejs_event_loop_delay_seconds` - задержка event loop
   - `nodejs_gc_duration_seconds` - длительность GC

3. **Метрики БД**:
   - `database_connection_pool_size` - размер пула соединений
   - `database_query_duration_seconds` - длительность запросов
   - `database_transaction_duration_seconds` - длительность транзакций

4. **Бизнес-метрики**:
   - `estimate_creation_duration_seconds` - время создания сметы
   - `file_processing_duration_seconds` - время обработки файлов
   - `ai_response_duration_seconds` - время ответа AI
   - `export_generation_duration_seconds` - время генерации экспорта

#### Использование метрик

```typescript
import { MetricsService } from '@ez-eco/shared/monitoring';

@Injectable()
export class EstimateService {
  constructor(private metrics: MetricsService) {}

  async createEstimate(data: CreateEstimateDto) {
    const timer = this.metrics.startTimer();

    try {
      const result = await this.doCreate(data);

      const duration = timer.end();
      this.metrics.recordEstimateCreation('success', data.type, duration);

      return result;
    } catch (error) {
      const duration = timer.end();
      this.metrics.recordEstimateCreation('failure', data.type, duration);
      throw error;
    }
  }
}
```

#### Prometheus endpoint

Метрики доступны по адресу: `http://localhost:3000/metrics`

### Health Checks

#### Настройка проверок

```typescript
// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthService } from '@ez-eco/shared/monitoring';

@Controller('health')
export class HealthController {
  constructor(private health: HealthService) {}

  @Get()
  check() {
    return this.health.check();
  }

  @Get('detailed')
  detailed() {
    return this.health.detailedCheck();
  }
}
```

#### Формат ответа

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "disk": { "status": "up", "usage": "45%" },
    "memory": { "status": "up", "rss": "234MB", "heap": "156MB" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" }
  }
}
```

## Алертинг

### Email алерты

```env
ALERT_EMAIL_ENABLED=true
ALERT_EMAIL_TO=admin@example.com,devops@example.com
ALERT_EMAIL_FROM=alerts@estimate-service.com
```

### Slack алерты

```env
ALERT_SLACK_ENABLED=true
ALERT_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALERT_SLACK_CHANNEL=#alerts
```

### Telegram алерты

```env
ALERT_TELEGRAM_ENABLED=true
ALERT_TELEGRAM_BOT_TOKEN=your-bot-token
ALERT_TELEGRAM_CHAT_ID=your-chat-id
```

### Правила алертинга

1. **Высокий error rate** (>5%)
2. **Медленный response time** (>1s)
3. **Высокое использование ресурсов** (CPU >90%, Memory >90%)
4. **Недоступность сервисов** (3 последовательных неудачных проверки)

## Дашборды

### Grafana

1. Импортируйте дашборды из `docs/monitoring/dashboards/`
2. Настройте data source для Prometheus
3. Установите переменные:

```env
GRAFANA_ENABLED=true
GRAFANA_URL=http://localhost:3000
GRAFANA_API_KEY=your-api-key
```

### Kibana

1. Настройте index pattern: `estimate-service-logs-*`
2. Импортируйте saved objects из `docs/monitoring/kibana/`
3. Установите переменные:

```env
KIBANA_ENABLED=true
KIBANA_URL=http://localhost:5601
KIBANA_SPACE=default
```

## Лучшие практики

### 1. Контекстное логирование

```typescript
// Всегда устанавливайте контекст
this.logger.setContext('ServiceName');

// Добавляйте метаданные
this.logger.info('Operation completed', {
  userId: user.id,
  duration: timer.end(),
  result: 'success',
});
```

### 2. Обработка ошибок

```typescript
try {
  // код
} catch (error) {
  // Логируйте с контекстом
  this.logger.error('Operation failed', error.stack, {
    operation: 'createEstimate',
    userId: user.id,
    input: data,
  });

  // Метрики ошибок
  this.metrics.recordError('business_error', 'estimate_creation');

  throw error;
}
```

### 3. Производительность

```typescript
// Используйте таймеры для измерения
const timer = this.metrics.startTimer();

// Длительная операция
await this.longOperation();

// Записывайте метрики
const duration = timer.end();
this.metrics.recordDatabaseQuery('select', 'estimates', duration);
```

### 4. Безопасность логов

```typescript
// Не логируйте чувствительные данные
this.logger.info('User login', {
  userId: user.id,
  email: user.email,
  // НЕ логируйте: password, tokens, credit cards
});
```

## Troubleshooting

### Проблема: Логи не отправляются в Elasticsearch

1. Проверьте подключение к Elasticsearch
2. Убедитесь, что `ELASTICSEARCH_LOGGING_ENABLED=true`
3. Проверьте права на создание индексов

### Проблема: Метрики не собираются

1. Проверьте, что `PERFORMANCE_MONITORING_ENABLED=true`
2. Убедитесь, что Prometheus scrape настроен правильно
3. Проверьте endpoint `/metrics`

### Проблема: Sentry не получает ошибки

1. Проверьте правильность `SENTRY_DSN`
2. Убедитесь, что `SENTRY_ENABLED=true`
3. Проверьте сетевое подключение к Sentry

## Полезные ссылки

- [Sentry Documentation](https://docs.sentry.io/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
