# Архитектура проекта

## Общая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Estimate App   │  │   Admin Panel   │  │  Mobile App  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/WebSocket
┌─────────────────────────┼───────────────────────────────────┐
│                    API Gateway                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                   Microservices                             │
├─────────────────────────┼───────────────────────────────────┤
│ ┌─────────────┐ ┌───────┴──────┐ ┌──────────────┐ ┌─────────┤
│ │   Auth      │ │   Estimate   │ │ AI Assistant │ │ FSBTS   │
│ │  Service    │ │   Service    │ │   Service    │ │ Service │
│ └─────────────┘ └──────────────┘ └──────────────┘ └─────────┤
│ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┤
│ │ Notification│ │   Analytics  │ │ Data Collector│ │Template │
│ │  Service    │ │   Service    │ │   Service    │ │ Service │
│ └─────────────┘ └──────────────┘ └──────────────┘ └─────────┤
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    Data Layer                               │
├─────────────────────────┼───────────────────────────────────┤
│ ┌─────────────┐ ┌───────┴──────┐ ┌──────────────┐ ┌─────────┤
│ │ PostgreSQL  │ │    Redis     │ │  Vector DB   │ │  S3     │
│ │ (Main DB)   │ │   (Cache)    │ │ (AI Knowledge)│ │(Files)  │
│ └─────────────┘ └──────────────┘ └──────────────┘ └─────────┤
└─────────────────────────────────────────────────────────────┘
```

## Микросервисы

### 1. Estimate Service
**Назначение:** Основной сервис для работы со сметами
**Порт:** 3001
**База данных:** PostgreSQL

#### Функции:
- CRUD операции со сметами
- Расчет стоимости
- Применение шаблонов
- Валидация данных
- Экспорт/импорт

#### API Endpoints:
```typescript
GET    /api/estimates          // Список смет
POST   /api/estimates          // Создание сметы
GET    /api/estimates/:id      // Получение сметы
PUT    /api/estimates/:id      // Обновление сметы
DELETE /api/estimates/:id      // Удаление сметы
POST   /api/estimates/:id/calculate  // Пересчет сметы
GET    /api/estimates/:id/export     // Экспорт сметы
```

### 2. FSBTS Service
**Назначение:** Интеграция с базой ФСБЦ-2022
**Порт:** 3002
**База данных:** PostgreSQL + Redis (кэш)

#### Функции:
- Поиск в базе ФСБЦ-2022
- Автообновление данных
- Региональные коэффициенты
- Валидация кодов расценок

#### API Endpoints:
```typescript
GET    /api/fsbts/search       // Поиск позиций
GET    /api/fsbts/item/:code   // Получение по коду
GET    /api/fsbts/categories   // Категории работ
GET    /api/fsbts/regions      // Регионы
POST   /api/fsbts/sync         // Синхронизация данных
```

### 3. AI Assistant Module (Интегрирован в Estimate Service)
**Назначение:** ИИ-помощник для работы со сметами
**Расположение:** services/estimate-service/src/modules/ai-assistant
**База данных:** PostgreSQL + Redis (кэш)

#### Функции:
- Планирование и выполнение задач на основе запросов пользователя
- Построение интеллектуальных ответов
- Валидация с помощью Claude
- Обработка ошибок с fallback стратегиями
- Управление различными AI моделями (DeepSeek, Yandex)
- Исторический анализ смет

#### Компоненты:
- **TaskPlannerService:** Планирование и приоритизация задач
- **ResponseBuilderService:** Формирование структурированных ответов
- **ClaudeValidatorService:** Валидация ответов AI
- **FallbackHandlerService:** Обработка ошибок и альтернативные стратегии
- **ModelManagerService:** Управление различными AI провайдерами
- **HistoricalEstimateService:** Анализ исторических данных

#### AI Провайдеры:
- **DeepSeek:** Основной провайдер для анализа и генерации
- **Yandex:** Альтернативный провайдер
- **Cached:** Кэширование результатов AI

#### API Endpoints:
```typescript
POST   /api/ai/tasks/plan      // Планирование задач
POST   /api/ai/tasks/execute   // Выполнение задачи
POST   /api/ai/tasks/batch-execute // Пакетное выполнение
GET    /api/ai/tasks/examples  // Примеры запросов
```

### 4. Analytics Service
**Назначение:** Аналитика и отчетность
**Порт:** 3004
**База данных:** PostgreSQL + Redis

#### Функции:
- Анализ трендов цен
- Региональная аналитика
- Прогнозирование
- Генерация отчетов

#### API Endpoints:
```typescript
GET    /api/analytics/trends           // Тренды цен
GET    /api/analytics/regional         // Региональная аналитика
POST   /api/analytics/predict          // Прогнозирование
GET    /api/analytics/reports          // Отчеты
```

### 5. Data Collector Service
**Назначение:** Сбор данных из внешних источников
**Порт:** 3005
**База данных:** PostgreSQL

#### Функции:
- Парсинг сайтов Минстроя
- Сбор рыночных цен
- ETL процессы
- Валидация данных

### 6. Template Service
**Назначение:** Управление шаблонами смет
**Порт:** 3006
**База данных:** PostgreSQL

#### Функции:
- CRUD операции с шаблонами
- Категоризация шаблонов
- Применение шаблонов к сметам

### 7. Auth Service
**Назначение:** Аутентификация и авторизация
**Порт:** 3007
**База данных:** PostgreSQL + Redis

#### Функции:
- Регистрация и аутентификация
- JWT токены
- RBAC
- OAuth интеграции

### 8. Notification Service
**Назначение:** Уведомления пользователей
**Порт:** 3008
**База данных:** PostgreSQL + Redis

#### Функции:
- Email уведомления
- Push уведомления
- SMS уведомления
- Внутренние уведомления

## Структура проекта

```
estimate-service/
├── apps/                           # Приложения
│   ├── estimate-app/              # Основное приложение
│   ├── admin-panel/               # Панель администратора
│   └── mobile-app/                # Мобильное приложение
├── services/                      # Микросервисы
│   ├── estimate-service/          # Сервис смет (включает AI Assistant)
│   │   └── src/modules/
│   │       ├── ai-assistant/     # Интегрированный ИИ-ассистент
│   │       ├── estimate/         # Управление сметами
│   │       ├── cache/            # Кэширование
│   │       ├── classification/   # Классификация
│   │       ├── priority-queue/   # Очередь задач
│   │       ├── validation/       # Валидация
│   │       └── templates/        # Шаблоны
│   ├── fsbts-service/             # Сервис ФСБЦ-2022
│   ├── analytics-service/         # Сервис аналитики
│   ├── data-collector/            # Сборщик данных
│   ├── template-service/          # Сервис шаблонов
│   ├── auth-service/              # Сервис аутентификации
│   └── notification-service/      # Сервис уведомлений
├── libs/                          # Общие библиотеки
│   ├── shared-contracts/          # Типы и интерфейсы
│   ├── shared-utils/              # Утилиты
│   ├── shared-config/             # Конфигурация
│   └── shared-testing/            # Тестовые утилиты
├── infrastructure/                # Инфраструктура
│   ├── docker/                    # Docker файлы
│   ├── kubernetes/                # K8s манифесты
│   ├── terraform/                 # Terraform конфигурация
│   └── monitoring/                # Мониторинг и логирование
├── docs/                          # Документация
├── tools/                         # Инструменты разработки
├── prisma/                        # Схемы баз данных
└── tests/                         # E2E тесты
```

## Паттерны проектирования

### 1. Repository Pattern
```typescript
// Интерфейс репозитория
export interface EstimateRepository {
  findById(id: string): Promise<Estimate | null>;
  findAll(filters: EstimateFilters): Promise<Estimate[]>;
  create(data: CreateEstimateData): Promise<Estimate>;
  update(id: string, data: UpdateEstimateData): Promise<Estimate>;
  delete(id: string): Promise<void>;
}

// Реализация для Prisma
@Injectable()
export class PrismaEstimateRepository implements EstimateRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Estimate | null> {
    return this.prisma.estimate.findUnique({ where: { id } });
  }

  // Другие методы...
}
```

### 2. Factory Pattern
```typescript
// Фабрика для создания калькуляторов
export abstract class CostCalculatorFactory {
  abstract createCalculator(type: EstimateType): CostCalculator;
}

export class DefaultCostCalculatorFactory extends CostCalculatorFactory {
  createCalculator(type: EstimateType): CostCalculator {
    switch (type) {
      case EstimateType.RESIDENTIAL:
        return new ResidentialCostCalculator();
      case EstimateType.COMMERCIAL:
        return new CommercialCostCalculator();
      case EstimateType.INDUSTRIAL:
        return new IndustrialCostCalculator();
      default:
        throw new Error(`Unknown estimate type: ${type}`);
    }
  }
}
```

### 3. Observer Pattern
```typescript
// Система событий для обновления смет
export interface EstimateObserver {
  onEstimateUpdated(estimate: Estimate): Promise<void>;
}

@Injectable()
export class EstimateService {
  private observers: EstimateObserver[] = [];

  addObserver(observer: EstimateObserver): void {
    this.observers.push(observer);
  }

  private async notifyObservers(estimate: Estimate): Promise<void> {
    await Promise.all(
      this.observers.map(observer => observer.onEstimateUpdated(estimate))
    );
  }

  async update(id: string, data: UpdateEstimateData): Promise<Estimate> {
    const estimate = await this.repository.update(id, data);
    await this.notifyObservers(estimate);
    return estimate;
  }
}
```

### 4. Strategy Pattern
```typescript
// Стратегии для расчета цен
export interface PricingStrategy {
  calculate(items: EstimateItem[], context: PricingContext): Promise<number>;
}

export class FSBTSPricingStrategy implements PricingStrategy {
  async calculate(items: EstimateItem[], context: PricingContext): Promise<number> {
    // Расчет по ФСБЦ-2022
  }
}

export class MarketPricingStrategy implements PricingStrategy {
  async calculate(items: EstimateItem[], context: PricingContext): Promise<number> {
    // Расчет по рыночным ценам
  }
}

@Injectable()
export class PricingService {
  private strategies = new Map<PricingType, PricingStrategy>();

  constructor() {
    this.strategies.set(PricingType.FSBTS, new FSBTSPricingStrategy());
    this.strategies.set(PricingType.MARKET, new MarketPricingStrategy());
  }

  async calculatePrice(
    items: EstimateItem[],
    type: PricingType,
    context: PricingContext
  ): Promise<number> {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Unknown pricing type: ${type}`);
    }
    return strategy.calculate(items, context);
  }
}
```

## Связи между сервисами

### 1. Синхронная коммуникация (HTTP)
```typescript
// HTTP клиент для межсервисного взаимодействия
@Injectable()
export class FSBTSClient {
  constructor(private httpService: HttpService) {}

  async searchItems(query: string): Promise<FSBTSItem[]> {
    const { data } = await this.httpService
      .get(`${FSBTS_SERVICE_URL}/api/fsbts/search`, {
        params: { q: query },
      })
      .toPromise();

    return data;
  }
}
```

### 2. Асинхронная коммуникация (Message Queue)
```typescript
// Публикация событий
@Injectable()
export class EstimateService {
  constructor(
    @Inject('ESTIMATE_QUEUE') private queue: Queue
  ) {}

  async create(data: CreateEstimateData): Promise<Estimate> {
    const estimate = await this.repository.create(data);

    // Отправляем событие о создании сметы
    await this.queue.add('estimate.created', {
      estimateId: estimate.id,
      userId: data.userId,
    });

    return estimate;
  }
}

// Обработка событий
@Processor('estimate')
export class EstimateProcessor {
  @Process('estimate.created')
  async handleEstimateCreated(job: Job<{ estimateId: string; userId: string }>) {
    // Отправка уведомления
    // Обновление аналитики
    // Другие действия
  }
}
```

## Безопасность

### 1. API Gateway
```typescript
// Настройка rate limiting
@Injectable()
export class RateLimitingGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) return false;

    const key = `rate_limit:${userId}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, 60); // 1 минута
    }

    return current <= 100; // 100 запросов в минуту
  }
}
```

### 2. Валидация между сервисами
```typescript
// Схемы для валидации межсервисных запросов
export const CreateEstimateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  items: z.array(z.object({
    fsbtsCode: z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+$/),
    quantity: z.number().positive(),
  })),
});

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const schema = this.getSchema(metadata.metatype);
    const result = schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(result.error.errors);
    }

    return result.data;
  }
}
```

## Мониторинг и логирование

### 1. Structured Logging
```typescript
@Injectable()
export class LoggerService {
  private logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'app.log' }),
    ],
  });

  log(message: string, context?: string, metadata?: object) {
    this.logger.info(message, { context, ...metadata });
  }

  error(message: string, trace?: string, context?: string, metadata?: object) {
    this.logger.error(message, { trace, context, ...metadata });
  }
}
```

### 2. Metrics
```typescript
// Prometheus метрики
@Injectable()
export class MetricsService {
  private httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
  });

  private estimateCreationDuration = new Histogram({
    name: 'estimate_creation_duration_seconds',
    help: 'Duration of estimate creation',
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  recordHttpRequest(method: string, route: string, status: number) {
    this.httpRequestsTotal.inc({ method, route, status });
  }

  recordEstimateCreation(duration: number) {
    this.estimateCreationDuration.observe(duration);
  }
}
```

## Развертывание

### 1. Docker Compose (разработка)
```yaml
version: '3.8'
services:
  estimate-service:
    build: ./services/estimate-service
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/estimate
    depends_on:
      - postgres
      - redis

  fsbts-service:
    build: ./services/fsbts-service
    ports:
      - "3002:3002"
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: estimate
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### 2. Kubernetes (продакшн)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: estimate-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: estimate-service
  template:
    metadata:
      labels:
        app: estimate-service
    spec:
      containers:
      - name: estimate-service
        image: estimate-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```
