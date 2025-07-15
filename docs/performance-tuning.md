# Руководство по оптимизации производительности и масштабированию

## Обзор

Данное руководство описывает настройки производительности и масштабирования для
проекта Estimate Service. Все настройки сгруппированы в конфигурационные файлы в
директории `libs/shared/src/config/`.

## Конфигурационные файлы

### 1. performance.config.ts

Основные настройки производительности:

- Worker Pool для обработки CPU-интенсивных задач
- Лимиты памяти и CPU
- Таймауты для различных операций
- Оптимизация и rate limiting

### 2. scaling.config.ts

Настройки горизонтального масштабирования:

- Поддержка Kubernetes, Docker Swarm, PM2
- Метрики автомасштабирования
- Балансировка нагрузки
- Service Discovery

## Worker Pool настройки

### Основные параметры

```env
WORKER_POOL_MIN=2              # Минимальное количество воркеров
WORKER_POOL_MAX=16             # Максимальное количество воркеров
WORKER_IDLE_TIMEOUT=30000      # Время простоя перед удалением (мс)
WORKER_MAX_TASKS=10            # Максимум задач на воркера
WORKER_TASK_TIMEOUT=120000     # Таймаут выполнения задачи (мс)
```

### Автомасштабирование воркеров

```env
WORKER_AUTO_SCALE=true         # Включить автомасштабирование
WORKER_SCALE_UP_THRESHOLD=80   # CPU порог для увеличения (%)
WORKER_SCALE_DOWN_THRESHOLD=20 # CPU порог для уменьшения (%)
```

## Лимиты памяти

### Настройки heap

```env
NODE_MAX_HEAP_SIZE=1024        # Максимальный размер heap (MB)
MEMORY_WARNING_THRESHOLD=768   # Порог предупреждения (MB)
MEMORY_CRITICAL_THRESHOLD=896  # Критический порог (MB)
```

### Мониторинг памяти

```env
MEMORY_MONITORING=true         # Включить мониторинг
MEMORY_CHECK_INTERVAL=30000    # Интервал проверки (мс)
MEMORY_FORCE_GC=true          # Принудительная сборка мусора
MAX_BUFFER_SIZE=50            # Максимальный размер буфера (MB)
```

## Лимиты CPU

```env
CPU_MAX_USAGE=90              # Максимальная загрузка CPU (%)
CPU_WARNING_THRESHOLD=70      # Порог предупреждения (%)
CPU_CRITICAL_THRESHOLD=85     # Критический порог (%)
CPU_THROTTLING=true           # Включить throttling
CPU_THROTTLE_DELAY=100        # Задержка при throttling (мс)
```

## Таймауты операций

### HTTP операции

```env
HTTP_CONNECT_TIMEOUT=5000     # Таймаут подключения (мс)
HTTP_RESPONSE_TIMEOUT=30000   # Таймаут ответа (мс)
HTTP_REQUEST_TIMEOUT=120000   # Общий таймаут запроса (мс)
```

### База данных

```env
DB_CONNECT_TIMEOUT=10000      # Таймаут подключения (мс)
DB_QUERY_TIMEOUT=30000        # Таймаут запроса (мс)
DB_TRANSACTION_TIMEOUT=60000  # Таймаут транзакции (мс)
```

### AI операции

```env
AI_GENERATION_TIMEOUT=180000  # Генерация текста (мс)
AI_ANALYSIS_TIMEOUT=120000    # Анализ (мс)
AI_EMBEDDING_TIMEOUT=60000    # Создание embeddings (мс)
```

## Горизонтальное масштабирование

### Режимы масштабирования

1. **PM2** (рекомендуется для простого развертывания)
2. **Kubernetes** (для облачного развертывания)
3. **Docker Swarm** (альтернатива Kubernetes)
4. **Manual** (ручное управление)

### PM2 настройки

```env
PM2_INSTANCES=max             # Количество инстансов
PM2_MIN_INSTANCES=2           # Минимум инстансов
PM2_MAX_INSTANCES=10          # Максимум инстансов
PM2_CPU_UP=70                 # CPU порог scale up (%)
PM2_CPU_DOWN=20               # CPU порог scale down (%)
PM2_MAX_MEMORY_RESTART=1500M  # Перезапуск при превышении памяти
```

### Запуск с PM2

```bash
# Production режим
pm2 start ecosystem.config.js --env production

# Development режим
pm2 start ecosystem.config.js --env development

# Мониторинг
pm2 monit

# Логи
pm2 logs

# Перезапуск
pm2 reload all
```

### Kubernetes HPA настройки

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: estimate-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: estimate-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

## Метрики автомасштабирования

### CPU метрики

```env
CPU_SCALING_ENABLED=true      # Включить CPU масштабирование
CPU_SCALE_UP=70               # Порог scale up (%)
CPU_SCALE_DOWN=20             # Порог scale down (%)
CPU_AVERAGE_PERIOD=300000     # Период усреднения (мс)
```

### Memory метрики

```env
MEMORY_SCALING_ENABLED=true   # Включить memory масштабирование
MEMORY_SCALE_UP=80            # Порог scale up (%)
MEMORY_SCALE_DOWN=30          # Порог scale down (%)
```

### Request метрики

```env
REQUEST_SCALING_ENABLED=true  # Включить RPS масштабирование
REQUEST_SCALE_UP=1000         # Порог scale up (RPS)
REQUEST_SCALE_DOWN=100        # Порог scale down (RPS)
```

## Оптимизация Node.js

### Настройки V8

```env
NODE_OPTIONS=--max-old-space-size=1024 --optimize-for-size
```

### UV Thread Pool

```env
UV_THREADPOOL_SIZE=8          # Размер thread pool для I/O операций
```

## Балансировка нагрузки

### Алгоритмы

- `round-robin` - последовательное распределение (по умолчанию)
- `least-connections` - на сервер с минимумом соединений
- `ip-hash` - привязка по IP клиента
- `random` - случайное распределение

### Health Check настройки

```env
LB_HEALTH_CHECK=true          # Включить проверку здоровья
LB_HEALTH_PATH=/health        # Endpoint для проверки
LB_HEALTH_INTERVAL=10         # Интервал проверки (сек)
LB_UNHEALTHY_THRESHOLD=3      # Количество неудач для исключения
```

## Redis оптимизация

### Connection Pool

```env
REDIS_CONNECT_TIMEOUT=10000   # Таймаут подключения (мс)
REDIS_COMMAND_TIMEOUT=5000    # Таймаут команды (мс)
```

### Bull Queue настройки

```env
BULL_JOB_ATTEMPTS=3           # Количество попыток
BULL_BACKOFF_DELAY=2000       # Задержка между попытками (мс)
BULL_STALLED_INTERVAL=30000   # Интервал проверки зависших задач
```

## Circuit Breaker

### Защита от сбоев внешних API

```env
CB_FAILURE_THRESHOLD=5        # Порог открытия
CB_SUCCESS_THRESHOLD=3        # Порог закрытия
CB_TIMEOUT=60000              # Таймаут перехода в HALF_OPEN (мс)
```

## Рекомендации по производительности

### 1. Для малых нагрузок (< 100 RPS)

- PM2 с 2-4 инстансами
- Worker Pool: 2-4 воркера
- Memory: 512MB-1GB на инстанс

### 2. Для средних нагрузок (100-1000 RPS)

- PM2 с автомасштабированием или Kubernetes
- Worker Pool: 4-8 воркеров
- Memory: 1-2GB на инстанс
- Redis cluster для кэширования

### 3. Для высоких нагрузок (> 1000 RPS)

- Kubernetes с HPA
- Worker Pool: 8-16 воркеров
- Memory: 2-4GB на инстанс
- Redis cluster + CDN
- Микросервисная архитектура

## Мониторинг производительности

### Метрики для отслеживания

1. **CPU Usage** - не должен превышать 70% в среднем
2. **Memory Usage** - не должен превышать 80% от лимита
3. **Response Time** - p95 < 1 секунда
4. **Error Rate** - < 1%
5. **Queue Size** - < 100 задач в очереди

### Инструменты мониторинга

- PM2 Monitoring
- Prometheus + Grafana
- ELK Stack для логов
- APM решения (New Relic, DataDog)

## Troubleshooting

### Высокое потребление памяти

1. Проверить утечки памяти
2. Уменьшить размер кэша
3. Включить принудительную сборку мусора
4. Уменьшить размер worker pool

### Высокая загрузка CPU

1. Проверить блокирующие операции
2. Увеличить количество воркеров
3. Включить CPU throttling
4. Оптимизировать алгоритмы

### Медленные запросы

1. Проверить таймауты
2. Включить кэширование
3. Оптимизировать запросы к БД
4. Использовать индексы

## Скрипты для тестирования

### Нагрузочное тестирование

```bash
# Установка artillery
npm install -g artillery

# Простой тест
artillery quick --count 100 --num 10 http://localhost:3001/health

# Расширенный тест
artillery run load-test.yml
```

### Профилирование

```bash
# CPU профилирование
node --prof app.js

# Memory профилирование
node --expose-gc --trace-gc app.js
```

## Заключение

Правильная настройка производительности и масштабирования критически важна для
стабильной работы сервиса. Начните с базовых настроек и постепенно оптимизируйте
под вашу нагрузку, используя метрики мониторинга.
