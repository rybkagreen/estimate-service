# Руководство по производительности Estimate Service

## Цели производительности

### Основные метрики
- **Response Time**: ≤ 200ms для простых API, ≤ 2s для сложных расчетов
- **Throughput**: ≥ 1000 RPS на стандартном оборудовании
- **Availability**: ≥ 99.9% uptime
- **Database Queries**: ≤ 100ms среднее время выполнения
- **AI Processing**: ≤ 3s для ответов ИИ-ассистента
- **Memory Usage**: ≤ 2GB на инстанс сервиса
- **CPU Usage**: ≤ 70% в нормальных условиях

## Оптимизация базы данных

### 1. Индексирование

```sql
-- Основные индексы для таблицы смет
CREATE INDEX CONCURRENTLY idx_estimates_created_by ON estimates(created_by);
CREATE INDEX CONCURRENTLY idx_estimates_project_id ON estimates(project_id);
CREATE INDEX CONCURRENTLY idx_estimates_status ON estimates(status);
CREATE INDEX CONCURRENTLY idx_estimates_created_at ON estimates(created_at DESC);

-- Составные индексы для частых запросов
CREATE INDEX CONCURRENTLY idx_estimates_user_status ON estimates(created_by, status);
CREATE INDEX CONCURRENTLY idx_estimates_project_status ON estimates(project_id, status);

-- Индексы для ФСБЦ-2022
CREATE INDEX CONCURRENTLY idx_fsbts_code ON fsbts_work_items(code);
CREATE INDEX CONCURRENTLY idx_fsbts_name_gin ON fsbts_work_items USING gin(to_tsvector('russian', name));
CREATE INDEX CONCURRENTLY idx_fsbts_category_region ON fsbts_work_items(category, region_code);

-- Индексы для поиска
CREATE INDEX CONCURRENTLY idx_fsbts_search ON fsbts_work_items USING gin(
  to_tsvector('russian', name || ' ' || coalesce(description, ''))
);

-- Партиционирование таблицы аудита по времени
CREATE TABLE audit_logs_2025 PARTITION OF audit_logs
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Индекс для векторного поиска (для ИИ)
CREATE INDEX ON ai_knowledge_base USING ivfflat (embedding vector_cosine_ops);
```

### 2. Оптимизация запросов

```typescript
// src/estimate/estimate.repository.ts
@Injectable()
export class EstimateRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Оптимизированный запрос с пагинацией
  async findManyWithPagination(params: {
    skip: number;
    take: number;
    where?: Prisma.EstimateWhereInput;
    include?: Prisma.EstimateInclude;
  }) {
    const [data, total] = await Promise.all([
      this.prisma.estimate.findMany({
        ...params,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.estimate.count({ where: params.where }),
    ]);

    return { data, total };
  }

  // ✅ Batch loading для избежания N+1 проблемы
  async findManyWithItems(estimateIds: number[]) {
    return this.prisma.estimate.findMany({
      where: { id: { in: estimateIds } },
      include: {
        items: {
          include: {
            fsbtsItem: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // ✅ Агрегированные запросы
  async getEstimateStatistics(userId: number) {
    const stats = await this.prisma.estimate.aggregate({
      where: { createdBy: userId },
      _count: { id: true },
      _sum: { totalCost: true },
      _avg: { totalCost: true },
    });

    return stats;
  }
}
```

### 3. Connection Pooling

```typescript
// src/prisma/prisma.service.ts
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=10',
        },
      },
    });
  }
}

// Конфигурация для production
// DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=50&pool_timeout=20"
```

## Кэширование

### 1. Redis Configuration

```typescript
// src/cache/cache.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      ttl: 300, // 5 минут по умолчанию
      max: 1000, // максимум 1000 ключей
    }),
  ],
})
export class CacheModule {}
```

### 2. Стратегии кэширования

```typescript
// src/fsbts/fsbts.service.ts
@Injectable()
export class FsbtsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly fsbtsRepository: FsbtsRepository,
  ) {}

  // Кэширование справочных данных
  async getFsbtsItem(code: string): Promise<FsbtsItem> {
    const cacheKey = `fsbts:item:${code}`;

    let item = await this.cacheManager.get<FsbtsItem>(cacheKey);

    if (!item) {
      item = await this.fsbtsRepository.findByCode(code);
      if (item) {
        // Кэшируем на 1 час
        await this.cacheManager.set(cacheKey, item, 3600);
      }
    }

    return item;
  }

  // Кэширование результатов поиска
  async searchFsbtsItems(query: SearchFsbtsDto): Promise<FsbtsItem[]> {
    const cacheKey = `fsbts:search:${JSON.stringify(query)}`;

    let results = await this.cacheManager.get<FsbtsItem[]>(cacheKey);

    if (!results) {
      results = await this.fsbtsRepository.search(query);
      // Кэшируем результаты поиска на 15 минут
      await this.cacheManager.set(cacheKey, results, 900);
    }

    return results;
  }

  // Инвалидация кэша при обновлении данных
  async updateFsbtsData(): Promise<void> {
    await this.fsbtsRepository.updateFromSource();

    // Очищаем все кэшированные данные ФСБЦ
    const keys = await this.cacheManager.store.keys('fsbts:*');
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }
}
```

### 3. HTTP Caching

```typescript
// src/common/decorators/cache.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const CacheControl = (maxAge: number) =>
  SetMetadata('cache-control', `public, max-age=${maxAge}`);

// src/common/interceptors/cache-control.interceptor.ts
@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const cacheControl = this.reflector.get<string>(
      'cache-control',
      context.getHandler(),
    );

    return next.handle().pipe(
      map(data => {
        if (cacheControl) {
          const response = context.switchToHttp().getResponse();
          response.set('Cache-Control', cacheControl);
        }
        return data;
      }),
    );
  }
}

// Использование
@Get('regions')
@CacheControl(3600) // Кэш на 1 час
async getRegions(): Promise<Region[]> {
  return this.fsbtsService.getRegions();
}
```

## Оптимизация API

### 1. Pagination

```typescript
// src/common/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

// src/common/dto/paginated-response.dto.ts
export class PaginatedResponseDto<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }
}
```

### 2. Field Selection

```typescript
// src/common/decorators/select-fields.decorator.ts
export function SelectFields(defaultFields?: string[]) {
  return createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const fields = request.query.fields;

    if (fields) {
      return fields.split(',').map(field => field.trim());
    }

    return defaultFields;
  })();
}

// Использование
@Get(':id')
async getEstimate(
  @Param('id') id: number,
  @SelectFields(['id', 'name', 'status', 'totalCost']) fields: string[],
): Promise<Partial<EstimateDto>> {
  const estimate = await this.estimateService.findById(id);
  return this.selectFields(estimate, fields);
}
```

### 3. Compression

```typescript
// src/main.ts
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Включаем сжатие
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024, // Сжимаем файлы больше 1KB
  }));

  await app.listen(3000);
}
```

## Асинхронная обработка

### 1. Queue Configuration

```typescript
// src/queue/queue.module.ts
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
    BullModule.registerQueue(
      { name: 'estimate-calculation' },
      { name: 'fsbts-update' },
      { name: 'ai-processing' },
    ),
  ],
})
export class QueueModule {}
```

### 2. Background Jobs

```typescript
// src/estimate/estimate.processor.ts
@Processor('estimate-calculation')
export class EstimateProcessor {
  private readonly logger = new Logger(EstimateProcessor.name);

  @Process('calculate-estimate')
  async calculateEstimate(job: Job<{ estimateId: number }>) {
    const { estimateId } = job.data;

    this.logger.log(`Starting calculation for estimate ${estimateId}`);

    try {
      // Имитация долгого расчета
      const estimate = await this.estimateService.calculateTotalCost(estimateId);

      // Обновляем прогресс
      await job.progress(50);

      // Применяем региональные коэффициенты
      await this.estimateService.applyRegionalCoefficients(estimateId);

      await job.progress(100);

      this.logger.log(`Calculation completed for estimate ${estimateId}`);

      return { success: true, estimateId };
    } catch (error) {
      this.logger.error(`Calculation failed for estimate ${estimateId}`, error);
      throw error;
    }
  }
}

// Использование в сервисе
@Injectable()
export class EstimateService {
  constructor(
    @InjectQueue('estimate-calculation') private calculationQueue: Queue,
  ) {}

  async scheduleCalculation(estimateId: number): Promise<Job> {
    return this.calculationQueue.add('calculate-estimate',
      { estimateId },
      {
        priority: 10,
        delay: 1000, // Задержка 1 секунда
      }
    );
  }
}
```

### 3. Event-Driven Architecture

```typescript
// src/events/events.module.ts
@Module({
  providers: [
    EstimateEventHandler,
    FsbtsEventHandler,
  ],
})
export class EventsModule {}

// src/estimate/estimate.service.ts
@Injectable()
export class EstimateService {
  constructor(private eventEmitter: EventEmitter2) {}

  async createEstimate(dto: CreateEstimateDto): Promise<Estimate> {
    const estimate = await this.estimateRepository.create(dto);

    // Асинхронно обрабатываем создание сметы
    this.eventEmitter.emit('estimate.created', estimate);

    return estimate;
  }
}

// src/events/estimate-event.handler.ts
@Injectable()
export class EstimateEventHandler {
  @OnEvent('estimate.created', { async: true })
  async handleEstimateCreated(estimate: Estimate) {
    // Инициализация расчетов
    await this.calculationService.scheduleCalculation(estimate.id);

    // Отправка уведомлений
    await this.notificationService.notifyEstimateCreated(estimate);

    // Обновление аналитики
    await this.analyticsService.trackEstimateCreation(estimate);
  }
}
```

## Оптимизация ИИ-компонентов

### 1. Batch Processing

```typescript
// src/ai/ai.service.ts
@Injectable()
export class AIService {
  private batchQueue: Array<{
    prompt: string;
    resolve: Function;
    reject: Function;
  }> = [];

  private batchTimer: NodeJS.Timeout;

  async processPrompt(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ prompt, resolve, reject });

      if (this.batchQueue.length === 1) {
        // Запускаем таймер для batch обработки
        this.batchTimer = setTimeout(() => this.processBatch(), 100);
      }

      if (this.batchQueue.length >= 10) {
        // Обрабатываем batch, если накопилось 10 запросов
        clearTimeout(this.batchTimer);
        this.processBatch();
      }
    });
  }

  private async processBatch() {
    const batch = this.batchQueue.splice(0, 10);

    try {
      const prompts = batch.map(item => item.prompt);
      const responses = await this.deepseekService.batchProcess(prompts);

      batch.forEach((item, index) => {
        item.resolve(responses[index]);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}
```

### 2. Response Caching

```typescript
// src/ai/ai-cache.service.ts
@Injectable()
export class AICacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getCachedResponse(prompt: string): Promise<string | null> {
    const promptHash = createHash('sha256').update(prompt).digest('hex');
    const cacheKey = `ai:response:${promptHash}`;

    return this.cacheManager.get(cacheKey);
  }

  async setCachedResponse(prompt: string, response: string): Promise<void> {
    const promptHash = createHash('sha256').update(prompt).digest('hex');
    const cacheKey = `ai:response:${promptHash}`;

    // Кэшируем на 24 часа
    await this.cacheManager.set(cacheKey, response, 86400);
  }

  async processWithCache(prompt: string): Promise<string> {
    // Сначала проверяем кэш
    let response = await this.getCachedResponse(prompt);

    if (!response) {
      // Если нет в кэше, обрабатываем через ИИ
      response = await this.aiService.processPrompt(prompt);
      await this.setCachedResponse(prompt, response);
    }

    return response;
  }
}
```

## Мониторинг производительности

### 1. Custom Metrics

```typescript
// src/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly httpDuration: Histogram<string>,

    @InjectMetric('database_query_duration_seconds')
    private readonly dbDuration: Histogram<string>,

    @InjectMetric('cache_hits_total')
    private readonly cacheHits: Counter<string>,

    @InjectMetric('active_connections')
    private readonly activeConnections: Gauge<string>,
  ) {}

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpDuration
      .labels({ method, route, status_code: statusCode.toString() })
      .observe(duration);
  }

  recordDatabaseQuery(operation: string, duration: number) {
    this.dbDuration
      .labels({ operation })
      .observe(duration);
  }

  recordCacheHit(type: 'hit' | 'miss') {
    this.cacheHits.labels({ type }).inc();
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }
}
```

### 2. Performance Interceptor

```typescript
// src/common/interceptors/performance.interceptor.ts
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - now) / 1000;

        this.metricsService.recordHttpRequest(
          request.method,
          request.route?.path || request.url,
          response.statusCode,
          duration,
        );

        // Логируем медленные запросы
        if (duration > 2) {
          console.warn(`Slow request: ${request.method} ${request.url} - ${duration}s`);
        }
      }),
    );
  }
}
```

### 3. Database Query Profiling

```typescript
// src/prisma/prisma.service.ts
export class PrismaService extends PrismaClient {
  constructor(private readonly metricsService: MetricsService) {
    super();

    this.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const duration = (Date.now() - start) / 1000;

      this.metricsService.recordDatabaseQuery(
        `${params.model}.${params.action}`,
        duration,
      );

      // Логируем медленные запросы
      if (duration > 0.5) {
        console.warn(`Slow query: ${params.model}.${params.action} - ${duration}s`);
      }

      return result;
    });
  }
}
```

## Профилирование и отладка

### 1. Memory Profiling

```typescript
// scripts/memory-profile.ts
import * as v8 from 'v8';
import * as fs from 'fs';

export function takeHeapSnapshot() {
  const snapshot = v8.writeHeapSnapshot();
  console.log(`Heap snapshot written to ${snapshot}`);
  return snapshot;
}

export function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(usage.external / 1024 / 1024 * 100) / 100,
  };
}

// Мониторинг утечек памяти
setInterval(() => {
  const usage = getMemoryUsage();

  if (usage.heapUsed > 1000) { // Больше 1GB
    console.warn('High memory usage detected:', usage);
    takeHeapSnapshot();
  }
}, 60000); // Каждую минуту
```

### 2. Performance Testing

```typescript
// tests/performance/load-test.spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Performance Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('should handle 100 concurrent requests', async () => {
    const promises = Array(100).fill(0).map(() =>
      request(app.getHttpServer())
        .get('/estimates')
        .expect(200),
    );

    const start = Date.now();
    await Promise.all(promises);
    const duration = Date.now() - start;

    console.log(`100 requests completed in ${duration}ms`);
    expect(duration).toBeLessThan(10000); // Меньше 10 секунд
  });

  it('should maintain response time under load', async () => {
    const results: number[] = [];

    for (let i = 0; i < 50; i++) {
      const start = Date.now();
      await request(app.getHttpServer())
        .get('/estimates')
        .expect(200);
      results.push(Date.now() - start);
    }

    const avgResponseTime = results.reduce((a, b) => a + b) / results.length;
    const p95ResponseTime = results.sort()[Math.floor(results.length * 0.95)];

    console.log(`Average response time: ${avgResponseTime}ms`);
    console.log(`P95 response time: ${p95ResponseTime}ms`);

    expect(avgResponseTime).toBeLessThan(200);
    expect(p95ResponseTime).toBeLessThan(500);
  });
});
```

## Оптимизация производства

### 1. Production Optimizations

```typescript
// src/main.ts (production configuration)
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'debug', 'error', 'verbose', 'warn'],
  });

  // Оптимизации для production
  if (process.env.NODE_ENV === 'production') {
    // Отключаем подробную документация API
    app.getHttpAdapter().getInstance().set('x-powered-by', false);

    // Устанавливаем строгие лимиты
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ limit: '1mb', extended: true }));

    // Включаем cluster mode для использования всех CPU ядер
    const cluster = require('cluster');
    const numCPUs = require('os').cpus().length;

    if (cluster.isMaster) {
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died, forking a new one`);
        cluster.fork();
      });
    } else {
      await app.listen(process.env.PORT || 3000);
    }
  } else {
    await app.listen(3000);
  }
}
```

### 2. Environment-specific Configuration

```typescript
// src/config/performance.config.ts
export const performanceConfig = {
  development: {
    queryTimeout: 30000,
    cacheTimeout: 300,
    maxConnections: 10,
    logLevel: 'debug',
  },
  production: {
    queryTimeout: 10000,
    cacheTimeout: 3600,
    maxConnections: 50,
    logLevel: 'error',
  },
  test: {
    queryTimeout: 5000,
    cacheTimeout: 60,
    maxConnections: 5,
    logLevel: 'warn',
  },
};
```

## Checklist оптимизации

### База данных
- [ ] Добавлены все необходимые индексы
- [ ] Настроено connection pooling
- [ ] Оптимизированы частые запросы
- [ ] Включено партиционирование для больших таблиц
- [ ] Настроено автовакуумирование

### Кэширование
- [ ] Кэшируются статические данные
- [ ] Кэшируются результаты поиска
- [ ] Настроена инвалидация кэша
- [ ] Используется Redis clustering для высокой нагрузки

### API
- [ ] Включена пагинация
- [ ] Поддерживается field selection
- [ ] Включено сжатие ответов
- [ ] Настроен rate limiting

### Фоновая обработка
- [ ] Длительные операции вынесены в очереди
- [ ] Настроена retry logic
- [ ] Включен мониторинг очередей

### Мониторинг
- [ ] Настроены метрики производительности
- [ ] Включены алерты для медленных запросов
- [ ] Настроен профилинг памяти
- [ ] Включен distributed tracing
