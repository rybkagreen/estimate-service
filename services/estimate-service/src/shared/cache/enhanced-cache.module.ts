import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import redisConfig from '../../config/redis.config';
import { CacheInterceptor } from './cache.interceptor';
import { CacheService } from './cache.service';
import { CacheService as EnhancedCacheService } from './enhanced-cache.service';

/**
 * Глобальный модуль кэширования с поддержкой Redis
 *
 * Предоставляет:
 * - Базовые операции кэширования
 * - Кэширование промежуточных расчетов
 * - Тегированное кэширование
 * - Статистику использования кэша
 * - Автоматическую инвалидацию
 *
 * @example
 * ```typescript
 * // Использование в сервисе
 * constructor(
 *   private cacheService: CacheService,
 *   private enhancedCacheService: EnhancedCacheService
 * ) {}
 *
 * // Простое кэширование
 * const data = await this.cacheService.getOrSet(
 *   'key',
 *   () => this.fetchData()
 * );
 *
 * // Кэширование расчетов
 * const result = await this.enhancedCacheService.computeWithCache(
 *   'estimate:calculation',
 *   { estimateId, parameters },
 *   () => this.performCalculation()
 * );
 * ```
 */
@Global()
@Module({
  imports: [
    ConfigModule.forFeature(redisConfig),
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisConf = configService.get('redis');

        // Если кластер включен, используем кластерную конфигурацию
        if (redisConf.cluster.enabled && redisConf.cluster.nodes.length > 0) {
          return {
            store: redisStore,
            cluster: {
              nodes: redisConf.cluster.nodes.map((node: string) => {
                const [host, port] = node.split(':');
                return { host, port: parseInt(port || '6379', 10) };
              }),
              options: {
                password: redisConf.password,
                connectTimeout: redisConf.connection.connectTimeout,
                commandTimeout: redisConf.connection.commandTimeout,
                retryDelayOnFailover: redisConf.queue.retryDelayOnFailover,
                maxRetriesPerRequest: redisConf.connection.maxRetriesPerRequest,
              },
            },
            ttl: redisConf.ttl,
            max: redisConf.max,
          };
        }

        // Обычная конфигурация Redis
        return {
          store: redisStore,
          host: redisConf.host,
          port: redisConf.port,
          password: redisConf.password,
          db: redisConf.db,
          ttl: redisConf.ttl,
          max: redisConf.max,
          connectTimeout: redisConf.connection.connectTimeout,
          commandTimeout: redisConf.connection.commandTimeout,
          retryAttempts: redisConf.connection.retryAttempts,
          retryDelay: redisConf.connection.retryDelay,
          onClientReady: (client: any) => {
            console.log('Redis cache client ready');

            client.on('error', (err: Error) => {
              console.error('Redis cache client error:', err);
            });

            client.on('connect', () => {
              console.log('Redis cache client connected');
            });

            client.on('reconnecting', () => {
              console.log('Redis cache client reconnecting');
            });
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    CacheService,
    EnhancedCacheService,
    CacheInterceptor,
  ],
  exports: [
    CacheService,
    EnhancedCacheService,
    CacheInterceptor,
    NestCacheModule,
  ],
})
export class SharedCacheModule {}
