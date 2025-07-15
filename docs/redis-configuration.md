# Конфигурация Redis для Estimate Service

## Обзор

Эта документация описывает настройку Redis для кэширования и очередей задач в
Estimate Service. Конфигурация поддерживает три режима работы: standalone,
cluster и sentinel, а также включает поддержку TLS для безопасных соединений.

## Режимы работы

### 1. Standalone Mode (по умолчанию)

Простейший режим для разработки и небольших проектов.

```env
REDIS_MODE=standalone
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
```

### 2. Cluster Mode

Для высокой производительности и горизонтального масштабирования.

```env
REDIS_MODE=cluster
REDIS_CLUSTER_NODES=node1:6379,node2:6379,node3:6379
REDIS_PASSWORD=cluster_password
```

### 3. Sentinel Mode

Для высокой доступности с автоматическим failover.

```env
REDIS_MODE=sentinel
REDIS_SENTINELS=sentinel1:26379,sentinel2:26379,sentinel3:26379
REDIS_SENTINEL_MASTER_NAME=mymaster
REDIS_SENTINEL_PASSWORD=sentinel_password
```

## TLS Конфигурация

Для безопасного соединения с Redis через TLS:

```env
REDIS_TLS_ENABLED=true
REDIS_TLS_PORT=6380
REDIS_TLS_CA=/path/to/ca.crt
REDIS_TLS_CERT=/path/to/client.crt
REDIS_TLS_KEY=/path/to/client.key
REDIS_TLS_REJECT_UNAUTHORIZED=true
REDIS_TLS_SERVERNAME=redis.example.com
```

## Bull Queue Конфигурация

Параметры для оптимизации очередей задач:

```env
# База данных для очередей (отдельная от кэша)
REDIS_QUEUE_DB=1

# Настройки повторных попыток
BULL_JOB_ATTEMPTS=3
BULL_BACKOFF_DELAY=2000

# Настройки мониторинга задач
BULL_STALLED_INTERVAL=30000
BULL_MAX_STALLED_COUNT=3

# Настройки блокировок
BULL_LOCK_DURATION=30000
BULL_LOCK_RENEW_TIME=15000
```

## Примеры конфигураций

### Разработка (Development)

```env
# Простая конфигурация для локальной разработки
REDIS_MODE=standalone
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_QUEUE_DB=1
CACHE_TTL=300
CACHE_MAX_KEYS=1000
```

### Производство с Cluster (Production - Cluster)

```env
# Высокопроизводительная конфигурация
REDIS_MODE=cluster
REDIS_CLUSTER_NODES=redis-1.example.com:6379,redis-2.example.com:6379,redis-3.example.com:6379
REDIS_PASSWORD=strong_password_here
REDIS_TLS_ENABLED=true
REDIS_TLS_CA=/etc/ssl/certs/redis-ca.crt
REDIS_TLS_CERT=/etc/ssl/certs/redis-client.crt
REDIS_TLS_KEY=/etc/ssl/private/redis-client.key
CACHE_TTL=3600
CACHE_MAX_KEYS=10000
REDIS_METRICS_ENABLED=true
```

### Производство с Sentinel (Production - HA)

```env
# Конфигурация высокой доступности
REDIS_MODE=sentinel
REDIS_SENTINELS=sentinel-1.example.com:26379,sentinel-2.example.com:26379,sentinel-3.example.com:26379
REDIS_SENTINEL_MASTER_NAME=redis-master
REDIS_PASSWORD=strong_password_here
REDIS_SENTINEL_PASSWORD=sentinel_password_here
REDIS_TLS_ENABLED=true
REDIS_TLS_REJECT_UNAUTHORIZED=true
CACHE_TTL=1800
REDIS_METRICS_ENABLED=true
```

## Использование в коде

### Инъекция Redis сервиса

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from './modules/redis/redis.service';

@Injectable()
export class EstimateService {
  constructor(private readonly redis: RedisService) {}

  async getCachedEstimate(id: string) {
    const cached = await this.redis.get(`estimate:${id}`);
    if (cached) return cached;

    const estimate = await this.calculateEstimate(id);
    await this.redis.set(`estimate:${id}`, estimate, 3600);

    return estimate;
  }
}
```

### Использование очередей

```typescript
import { Injectable } from '@nestjs/common';
import { EstimateQueueService } from './modules/queues/estimate-queue.service';

@Injectable()
export class EstimateController {
  constructor(private readonly queueService: EstimateQueueService) {}

  async createEstimate(data: CreateEstimateDto) {
    // Добавляем задачу в очередь
    const job = await this.queueService.addEstimateCalculation({
      estimateId: data.id,
      userId: data.userId,
      data: data,
    });

    return {
      jobId: job.id,
      status: 'processing',
    };
  }
}
```

## Мониторинг и метрики

### Включение метрик

```env
REDIS_METRICS_ENABLED=true
REDIS_COMMAND_METRICS_ENABLED=true
REDIS_METRICS_INTERVAL=60000
```

### Проверка состояния Redis

```typescript
// Проверка подключения
const pong = await redisService.ping();

// Получение информации о сервере
const info = await redisService.info();

// Статистика очередей
const stats = await queueService.getQueueStats('estimate-calculations');
console.log(`Активных задач: ${stats.active}`);
console.log(`В ожидании: ${stats.waiting}`);
```

## Оптимизация производительности

### 1. Настройка пулов соединений

```env
# Максимальное количество соединений
REDIS_MAX_CONNECTIONS=50

# Минимальное количество соединений
REDIS_MIN_CONNECTIONS=5

# Таймаут простоя соединения
REDIS_IDLE_TIMEOUT=30000
```

### 2. Настройка таймаутов

```env
# Таймаут подключения (мс)
REDIS_CONNECT_TIMEOUT=10000

# Таймаут выполнения команды (мс)
REDIS_COMMAND_TIMEOUT=5000

# Количество попыток переподключения
REDIS_RETRY_ATTEMPTS=5

# Задержка между попытками (мс)
REDIS_RETRY_DELAY=1000
```

### 3. Оптимизация кэша

```env
# TTL по умолчанию (секунды)
CACHE_TTL=300

# Максимальное количество ключей
CACHE_MAX_KEYS=1000

# Политика вытеснения
REDIS_EVICTION_POLICY=allkeys-lru
```

## Troubleshooting

### Проблема: Cannot connect to Redis

```bash
# Проверьте, запущен ли Redis
redis-cli ping

# Проверьте конфигурацию
redis-cli CONFIG GET "*"

# Проверьте логи
tail -f /var/log/redis/redis-server.log
```

### Проблема: TLS handshake failed

```bash
# Проверьте сертификаты
openssl x509 -in /path/to/cert.crt -text -noout

# Проверьте подключение с TLS
redis-cli --tls --cert /path/to/cert.crt --key /path/to/cert.key --cacert /path/to/ca.crt ping
```

### Проблема: High memory usage

```bash
# Проверьте использование памяти
redis-cli INFO memory

# Установите максимум памяти
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## Best Practices

1. **Используйте отдельные базы данных** для кэша и очередей
2. **Настройте TTL** для всех кэшируемых данных
3. **Мониторьте метрики** в production окружении
4. **Используйте TLS** для всех внешних подключений
5. **Настройте persistence** для критичных данных
6. **Регулярно очищайте** старые задачи из очередей
7. **Используйте connection pooling** для оптимизации
8. **Настройте алерты** на критичные метрики

## Дополнительные ресурсы

- [Redis Official Documentation](https://redis.io/documentation)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [ioredis Documentation](https://github.com/luin/ioredis)
- [NestJS Redis Module](https://docs.nestjs.com/techniques/redis)
