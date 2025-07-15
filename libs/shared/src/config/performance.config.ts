import { registerAs } from '@nestjs/config';

/**
 * Конфигурация производительности для оптимизации работы приложения
 * Включает настройки worker pool, лимиты ресурсов и таймауты
 *
 * @example
 * ```typescript
 * const perfConfig = this.configService.get('performance');
 * ```
 */
export default registerAs('performance', () => ({
  /**
   * Настройки Worker Pool для обработки CPU-интенсивных задач
   */
  workerPool: {
    /**
     * Минимальное количество воркеров в пуле
     * @default 2
     */
    minWorkers: parseInt(process.env['WORKER_POOL_MIN'] || '2', 10),

    /**
     * Максимальное количество воркеров в пуле
     * @default CPU cores * 2
     */
    maxWorkers: parseInt(process.env['WORKER_POOL_MAX'] || String(require('os').cpus().length * 2), 10),

    /**
     * Время простоя воркера перед его удалением (мс)
     * @default 30000 (30 секунд)
     */
    idleTimeout: parseInt(process.env['WORKER_IDLE_TIMEOUT'] || '30000', 10),

    /**
     * Максимальное количество задач на воркера
     * @default 10
     */
    maxTasksPerWorker: parseInt(process.env['WORKER_MAX_TASKS'] || '10', 10),

    /**
     * Таймаут выполнения задачи воркером (мс)
     * @default 120000 (2 минуты)
     */
    taskTimeout: parseInt(process.env['WORKER_TASK_TIMEOUT'] || '120000', 10),

    /**
     * Включить автомасштабирование воркеров
     * @default true
     */
    autoScale: process.env['WORKER_AUTO_SCALE'] !== 'false',

    /**
     * Порог загрузки CPU для увеличения воркеров (%)
     * @default 80
     */
    scaleUpThreshold: parseInt(process.env['WORKER_SCALE_UP_THRESHOLD'] || '80', 10),

    /**
     * Порог загрузки CPU для уменьшения воркеров (%)
     * @default 20
     */
    scaleDownThreshold: parseInt(process.env['WORKER_SCALE_DOWN_THRESHOLD'] || '20', 10),
  },

  /**
   * Лимиты памяти для защиты от утечек
   */
  memory: {
    /**
     * Максимальный размер heap для Node.js (MB)
     * @default 1024 (1GB)
     */
    maxHeapSize: parseInt(process.env['NODE_MAX_HEAP_SIZE'] || '1024', 10),

    /**
     * Порог памяти для предупреждения (MB)
     * @default 768 (75% от maxHeapSize)
     */
    warningThreshold: parseInt(process.env['MEMORY_WARNING_THRESHOLD'] || '768', 10),

    /**
     * Порог памяти для критического алерта (MB)
     * @default 896 (87.5% от maxHeapSize)
     */
    criticalThreshold: parseInt(process.env['MEMORY_CRITICAL_THRESHOLD'] || '896', 10),

    /**
     * Включить мониторинг памяти
     * @default true
     */
    enableMonitoring: process.env['MEMORY_MONITORING'] !== 'false',

    /**
     * Интервал проверки памяти (мс)
     * @default 30000 (30 секунд)
     */
    checkInterval: parseInt(process.env['MEMORY_CHECK_INTERVAL'] || '30000', 10),

    /**
     * Включить сборку мусора при превышении порога
     * @default true
     */
    forceGCOnThreshold: process.env['MEMORY_FORCE_GC'] !== 'false',

    /**
     * Максимальный размер буфера для операций (MB)
     * @default 50
     */
    maxBufferSize: parseInt(process.env['MAX_BUFFER_SIZE'] || '50', 10),
  },

  /**
   * Лимиты CPU для предотвращения перегрузки
   */
  cpu: {
    /**
     * Максимальная загрузка CPU (%)
     * @default 90
     */
    maxUsage: parseInt(process.env['CPU_MAX_USAGE'] || '90', 10),

    /**
     * Порог CPU для предупреждения (%)
     * @default 70
     */
    warningThreshold: parseInt(process.env['CPU_WARNING_THRESHOLD'] || '70', 10),

    /**
     * Порог CPU для критического алерта (%)
     * @default 85
     */
    criticalThreshold: parseInt(process.env['CPU_CRITICAL_THRESHOLD'] || '85', 10),

    /**
     * Интервал проверки CPU (мс)
     * @default 10000 (10 секунд)
     */
    checkInterval: parseInt(process.env['CPU_CHECK_INTERVAL'] || '10000', 10),

    /**
     * Включить throttling при высокой загрузке
     * @default true
     */
    enableThrottling: process.env['CPU_THROTTLING'] !== 'false',

    /**
     * Задержка при throttling (мс)
     * @default 100
     */
    throttleDelay: parseInt(process.env['CPU_THROTTLE_DELAY'] || '100', 10),
  },

  /**
   * Таймауты для различных операций
   */
  timeouts: {
    /**
     * HTTP запросы
     */
    http: {
      /**
       * Таймаут подключения (мс)
       * @default 5000 (5 секунд)
       */
      connect: parseInt(process.env['HTTP_CONNECT_TIMEOUT'] || '5000', 10),

      /**
       * Таймаут ответа (мс)
       * @default 30000 (30 секунд)
       */
      response: parseInt(process.env['HTTP_RESPONSE_TIMEOUT'] || '30000', 10),

      /**
       * Таймаут keep-alive (мс)
       * @default 5000 (5 секунд)
       */
      keepAlive: parseInt(process.env['HTTP_KEEPALIVE_TIMEOUT'] || '5000', 10),

      /**
       * Максимальное время запроса (мс)
       * @default 120000 (2 минуты)
       */
      request: parseInt(process.env['HTTP_REQUEST_TIMEOUT'] || '120000', 10),
    },

    /**
     * База данных
     */
    database: {
      /**
       * Таймаут подключения (мс)
       * @default 10000 (10 секунд)
       */
      connect: parseInt(process.env['DB_CONNECT_TIMEOUT'] || '10000', 10),

      /**
       * Таймаут запроса (мс)
       * @default 30000 (30 секунд)
       */
      query: parseInt(process.env['DB_QUERY_TIMEOUT'] || '30000', 10),

      /**
       * Таймаут транзакции (мс)
       * @default 60000 (1 минута)
       */
      transaction: parseInt(process.env['DB_TRANSACTION_TIMEOUT'] || '60000', 10),

      /**
       * Таймаут пула соединений (мс)
       * @default 10000 (10 секунд)
       */
      pool: parseInt(process.env['DB_POOL_TIMEOUT'] || '10000', 10),
    },

    /**
     * Файловые операции
     */
    file: {
      /**
       * Таймаут чтения файла (мс)
       * @default 30000 (30 секунд)
       */
      read: parseInt(process.env['FILE_READ_TIMEOUT'] || '30000', 10),

      /**
       * Таймаут записи файла (мс)
       * @default 60000 (1 минута)
       */
      write: parseInt(process.env['FILE_WRITE_TIMEOUT'] || '60000', 10),

      /**
       * Таймаут загрузки файла (мс)
       * @default 300000 (5 минут)
       */
      upload: parseInt(process.env['FILE_UPLOAD_TIMEOUT'] || '300000', 10),

      /**
       * Таймаут обработки файла (мс)
       * @default 600000 (10 минут)
       */
      processing: parseInt(process.env['FILE_PROCESSING_TIMEOUT'] || '600000', 10),
    },

    /**
     * AI операции
     */
    ai: {
      /**
       * Таймаут генерации текста (мс)
       * @default 180000 (3 минуты)
       */
      generation: parseInt(process.env['AI_GENERATION_TIMEOUT'] || '180000', 10),

      /**
       * Таймаут анализа (мс)
       * @default 120000 (2 минуты)
       */
      analysis: parseInt(process.env['AI_ANALYSIS_TIMEOUT'] || '120000', 10),

      /**
       * Таймаут embedding (мс)
       * @default 60000 (1 минута)
       */
      embedding: parseInt(process.env['AI_EMBEDDING_TIMEOUT'] || '60000', 10),

      /**
       * Таймаут поиска (мс)
       * @default 30000 (30 секунд)
       */
      search: parseInt(process.env['AI_SEARCH_TIMEOUT'] || '30000', 10),
    },

    /**
     * Кэш операции
     */
    cache: {
      /**
       * Таймаут чтения (мс)
       * @default 1000 (1 секунда)
       */
      read: parseInt(process.env['CACHE_READ_TIMEOUT'] || '1000', 10),

      /**
       * Таймаут записи (мс)
       * @default 2000 (2 секунды)
       */
      write: parseInt(process.env['CACHE_WRITE_TIMEOUT'] || '2000', 10),

      /**
       * Таймаут удаления (мс)
       * @default 1000 (1 секунда)
       */
      delete: parseInt(process.env['CACHE_DELETE_TIMEOUT'] || '1000', 10),
    },
  },

  /**
   * Настройки оптимизации
   */
  optimization: {
    /**
     * Включить сжатие ответов
     * @default true
     */
    enableCompression: process.env['ENABLE_COMPRESSION'] !== 'false',

    /**
     * Минимальный размер для сжатия (bytes)
     * @default 1024 (1KB)
     */
    compressionThreshold: parseInt(process.env['COMPRESSION_THRESHOLD'] || '1024', 10),

    /**
     * Включить HTTP/2
     * @default true
     */
    enableHttp2: process.env['ENABLE_HTTP2'] !== 'false',

    /**
     * Включить кэширование статики
     * @default true
     */
    enableStaticCache: process.env['ENABLE_STATIC_CACHE'] !== 'false',

    /**
     * TTL для статического кэша (секунды)
     * @default 86400 (24 часа)
     */
    staticCacheTTL: parseInt(process.env['STATIC_CACHE_TTL'] || '86400', 10),

    /**
     * Включить предварительную загрузку модулей
     * @default true
     */
    enablePreload: process.env['ENABLE_PRELOAD'] !== 'false',
  },

  /**
   * Настройки rate limiting
   */
  rateLimiting: {
    /**
     * Включить rate limiting
     * @default true
     */
    enabled: process.env['RATE_LIMIT_ENABLED'] !== 'false',

    /**
     * Окно времени (мс)
     * @default 60000 (1 минута)
     */
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW'] || '60000', 10),

    /**
     * Максимум запросов в окне
     * @default 100
     */
    max: parseInt(process.env['RATE_LIMIT_MAX'] || '100', 10),

    /**
     * Пропускать успешные запросы
     * @default false
     */
    skipSuccessful: process.env['RATE_LIMIT_SKIP_SUCCESSFUL'] === 'true',

    /**
     * Пропускать неудачные запросы
     * @default false
     */
    skipFailed: process.env['RATE_LIMIT_SKIP_FAILED'] === 'true',
  },
}));

/**
 * Тип конфигурации производительности
 */
export interface PerformanceConfig {
  workerPool: {
    minWorkers: number;
    maxWorkers: number;
    idleTimeout: number;
    maxTasksPerWorker: number;
    taskTimeout: number;
    autoScale: boolean;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
  };
  memory: {
    maxHeapSize: number;
    warningThreshold: number;
    criticalThreshold: number;
    enableMonitoring: boolean;
    checkInterval: number;
    forceGCOnThreshold: boolean;
    maxBufferSize: number;
  };
  cpu: {
    maxUsage: number;
    warningThreshold: number;
    criticalThreshold: number;
    checkInterval: number;
    enableThrottling: boolean;
    throttleDelay: number;
  };
  timeouts: {
    http: {
      connect: number;
      response: number;
      keepAlive: number;
      request: number;
    };
    database: {
      connect: number;
      query: number;
      transaction: number;
      pool: number;
    };
    file: {
      read: number;
      write: number;
      upload: number;
      processing: number;
    };
    ai: {
      generation: number;
      analysis: number;
      embedding: number;
      search: number;
    };
    cache: {
      read: number;
      write: number;
      delete: number;
    };
  };
  optimization: {
    enableCompression: boolean;
    compressionThreshold: number;
    enableHttp2: boolean;
    enableStaticCache: boolean;
    staticCacheTTL: number;
    enablePreload: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    max: number;
    skipSuccessful: boolean;
    skipFailed: boolean;
  };
}
