import { registerAs } from '@nestjs/config';

/**
 * Конфигурация Redis для кэширования и очередей
 *
 * @example
 * ```typescript
 * // Получение конфигурации в сервисе
 * const redisConfig = this.configService.get('redis');
 * ```
 */
export default registerAs('redis', () => ({
  /**
   * Хост Redis сервера
   * @default 'localhost'
   */
  host: process.env['REDIS_HOST'] || 'localhost',

  /**
   * Порт Redis сервера
   * @default 6379
   */
  port: parseInt(process.env['REDIS_PORT'] || '6379', 10),

  /**
   * Пароль для подключения к Redis
   */
  password: process.env['REDIS_PASSWORD'],

  /**
   * База данных Redis для кэширования
   * @default 0
   */
  db: parseInt(process.env['REDIS_DB'] || '0', 10),

  /**
   * TTL для кэша по умолчанию (в секундах)
   * @default 300 (5 минут)
   */
  ttl: parseInt(process.env['CACHE_TTL'] || '300', 10),

  /**
   * Максимальное количество ключей в кэше
   * @default 1000
   */
  max: parseInt(process.env['CACHE_MAX_KEYS'] || '1000', 10),

  /**
   * Конфигурация для очередей (использует отдельную БД)
   */
  queue: {
    db: parseInt(process.env['REDIS_QUEUE_DB'] || '1', 10),
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true,
  },

  /**
   * Настройки кластера Redis (для production)
   */
  cluster: {
    enabled: process.env['REDIS_CLUSTER_ENABLED'] === 'true',
    nodes: process.env['REDIS_CLUSTER_NODES']?.split(',') || [],
  },

  /**
   * Настройки подключения
   */
  connection: {
    /**
     * Таймаут подключения (мс)
     * @default 10000
     */
    connectTimeout: parseInt(process.env['REDIS_CONNECT_TIMEOUT'] || '10000', 10),

    /**
     * Таймаут команды (мс)
     * @default 5000
     */
    commandTimeout: parseInt(process.env['REDIS_COMMAND_TIMEOUT'] || '5000', 10),

    /**
     * Количество попыток переподключения
     * @default 5
     */
    retryAttempts: parseInt(process.env['REDIS_RETRY_ATTEMPTS'] || '5', 10),

    /**
     * Задержка между попытками переподключения (мс)
     * @default 1000
     */
    retryDelay: parseInt(process.env['REDIS_RETRY_DELAY'] || '1000', 10),

    /**
     * Максимальная задержка между попытками (мс)
     * @default 10000
     */
    maxRetriesPerRequest: parseInt(process.env['REDIS_MAX_RETRIES'] || '3', 10),
  }
}));
