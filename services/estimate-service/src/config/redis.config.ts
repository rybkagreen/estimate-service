import { registerAs } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

/**
 * Конфигурация Redis для кэширования и очередей
 * Поддерживает Redis Cluster, Sentinel и TLS
 *
 * @example
 * ```typescript
 * // Получение конфигурации в сервисе
 * const redisConfig = this.configService.get('redis');
 * ```
 */
export default registerAs('redis', () => {
  // Определяем режим работы Redis
  const mode = process.env['REDIS_MODE'] || 'standalone'; // 'standalone', 'cluster', 'sentinel'
  
  // Базовая конфигурация для всех режимов
  const baseConfig = {
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
     * Настройки TLS для безопасного подключения
     */
    tls: process.env['REDIS_TLS_ENABLED'] === 'true' ? {
      port: parseInt(process.env['REDIS_TLS_PORT'] || '6380', 10),
      ca: process.env['REDIS_TLS_CA'],
      cert: process.env['REDIS_TLS_CERT'],
      key: process.env['REDIS_TLS_KEY'],
      rejectUnauthorized: process.env['REDIS_TLS_REJECT_UNAUTHORIZED'] !== 'false',
      servername: process.env['REDIS_TLS_SERVERNAME'],
      checkServerIdentity: () => undefined, // Отключаем проверку для самоподписанных сертификатов
    } : undefined,

    /**
     * Опции подключения
     */
    enableOfflineQueue: true,
    enableReadyCheck: true,
    lazyConnect: false,
    keepAlive: 10000,
    family: 4, // IPv4
    
    /**
     * Настройки переподключения
     */
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    
    /**
     * Таймауты
     */
    connectTimeout: parseInt(process.env['REDIS_CONNECT_TIMEOUT'] || '10000', 10),
    commandTimeout: parseInt(process.env['REDIS_COMMAND_TIMEOUT'] || '5000', 10),
  };

  // Конфигурация для разных режимов работы
  let connectionConfig: any = {};

  switch (mode) {
    case 'cluster':
      connectionConfig = {
        ...baseConfig,
        /**
         * Настройки Redis Cluster
         */
        isCluster: true,
        nodes: process.env['REDIS_CLUSTER_NODES']?.split(',').map(node => {
          const [host, port] = node.split(':');
          return { host, port: parseInt(port || '6379', 10) };
        }) || [
          { host: 'localhost', port: 6379 }
        ],
        clusterOptions: {
          scaleReads: 'slave',
          maxRedirections: 16,
          retryDelayOnFailover: 100,
          retryDelayOnClusterDown: 300,
          slotsRefreshTimeout: 2000,
          slotsRefreshInterval: 5000,
          // Connection options from baseConfig are already applied at the node level
          password: baseConfig.password,
          family: baseConfig.family,
          tls: baseConfig.tls,
          connectTimeout: baseConfig.connectTimeout,
          commandTimeout: baseConfig.commandTimeout,
          retryStrategy: baseConfig.retryStrategy,
        },
      };
      break;

    case 'sentinel':
      connectionConfig = {
        ...baseConfig,
        /**
         * Настройки Redis Sentinel для высокой доступности
         */
        sentinels: process.env['REDIS_SENTINELS']?.split(',').map(sentinel => {
          const [host, port] = sentinel.split(':');
          return { host, port: parseInt(port || '26379', 10) };
        }) || [
          { host: 'localhost', port: 26379 }
        ],
        name: process.env['REDIS_SENTINEL_MASTER_NAME'] || 'mymaster',
        sentinelPassword: process.env['REDIS_SENTINEL_PASSWORD'],
        sentinelRetryStrategy: (times: number) => {
          const delay = Math.min(times * 10, 1000);
          return delay;
        },
        role: 'master', // 'master' или 'slave'
        preferredSlaves: [
          { ip: 'localhost', port: '6380', prio: 1 },
          { ip: 'localhost', port: '6381', prio: 2 }
        ],
        sentinelCommandTimeout: 5000,
      };
      break;

    default: // standalone
      connectionConfig = {
        ...baseConfig,
        /**
         * Настройки для standalone Redis
         */
        host: process.env['REDIS_HOST'] || 'localhost',
        port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
      };
  }

  // Конфигурация для Bull Queue
  const bullConfig = {
    redis: {
      ...connectionConfig,
      db: parseInt(process.env['REDIS_QUEUE_DB'] || '1', 10),
      maxRetriesPerRequest: null, // Bull управляет повторами самостоятельно
    },
    defaultJobOptions: {
      removeOnComplete: {
        age: 24 * 3600, // 24 часа в секундах
        count: 100, // Максимум 100 выполненных задач
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // 7 дней в секундах
      },
      attempts: parseInt(process.env['BULL_JOB_ATTEMPTS'] || '3', 10),
      backoff: {
        type: 'exponential',
        delay: parseInt(process.env['BULL_BACKOFF_DELAY'] || '2000', 10),
      },
    },
    settings: {
      stalledInterval: parseInt(process.env['BULL_STALLED_INTERVAL'] || '30000', 10),
      maxStalledCount: parseInt(process.env['BULL_MAX_STALLED_COUNT'] || '3', 10),
      guardInterval: parseInt(process.env['BULL_GUARD_INTERVAL'] || '5000', 10),
      retryProcessDelay: parseInt(process.env['BULL_RETRY_DELAY'] || '5000', 10),
      lockDuration: parseInt(process.env['BULL_LOCK_DURATION'] || '30000', 10),
      lockRenewTime: parseInt(process.env['BULL_LOCK_RENEW_TIME'] || '15000', 10),
    },
  };

  // Метрики и мониторинг
  const monitoring = {
    enableMetrics: process.env['REDIS_METRICS_ENABLED'] === 'true',
    enableCommandMetrics: process.env['REDIS_COMMAND_METRICS_ENABLED'] === 'true',
    metricsInterval: parseInt(process.env['REDIS_METRICS_INTERVAL'] || '60000', 10),
  };

  return {
    mode,
    connection: connectionConfig,
    bull: bullConfig,
    monitoring,
    
    // Вспомогательные методы для получения URL подключения
    getRedisUrl: () => {
      if (process.env['REDIS_URL']) {
        return process.env['REDIS_URL'];
      }
      
      const protocol = connectionConfig.tls ? 'rediss' : 'redis';
      const auth = connectionConfig.password ? `:${connectionConfig.password}@` : '';
      
      if (mode === 'cluster') {
        const nodes = connectionConfig.nodes.map((node: any) => `${node.host}:${node.port}`).join(',');
        return `${protocol}://${auth}${nodes}`;
      } else if (mode === 'sentinel') {
        const sentinels = connectionConfig.sentinels.map((s: any) => `${s.host}:${s.port}`).join(',');
        return `${protocol}+sentinel://${auth}${sentinels}/${connectionConfig.name}`;
      } else {
        return `${protocol}://${auth}${connectionConfig.host}:${connectionConfig.port}/${connectionConfig.db}`;
      }
    },
  };
});
