import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';

/**
 * Сервис для управления кэшированием промежуточных расчетов
 *
 * Поддерживает кэширование вычислений смет, результатов AI обработки,
 * справочных данных ФСБТС и других промежуточных результатов.
 *
 * @example
 * ```typescript
 * // Кэширование результата вычисления
 * const result = await this.cacheService.getOrSet(
 *   'estimate:calculation',
 *   { estimateId, parameters },
 *   () => this.performCalculation(estimateId, parameters),
 *   { ttl: 3600 }
 * );
 *
 * // Кэширование с тегами для группового удаления
 * await this.cacheService.setWithTags(
 *   'fsbts:item:123',
 *   itemData,
 *   ['fsbts', 'reference-data'],
 *   { ttl: 7200 }
 * );
 * ```
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  /**
   * Получение значения из кэша по ключу
   *
   * @param key Ключ кэша
   * @returns Значение из кэша или undefined
   *
   * @example
   * ```typescript
   * const cachedResult = await this.cacheService.get<CalculationResult>('calculation:123');
   * ```
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value !== undefined) {
        this.logger.debug(`Cache hit for key: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Сохранение значения в кэш
   *
   * @param key Ключ кэша
   * @param value Значение для сохранения
   * @param options Опции кэширования
   *
   * @example
   * ```typescript
   * await this.cacheService.set('user:123', userData, { ttl: 3600 });
   * ```
   */
  async set<T>(
    key: string,
    value: T,
    options: { ttl?: number } = {}
  ): Promise<void> {
    try {
      const ttlValue = options.ttl ?? this.configService.get('redis.ttl', 300);
      await this.cacheManager.set(key, value, ttlValue * 1000); // Конвертируем в мс
      this.logger.debug(`Cache set for key: ${key}, TTL: ${ttlValue}s`);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Получение или установка значения (pattern cache-aside)
   *
   * @param key Ключ кэша
   * @param fallback Функция для получения значения если его нет в кэше
   * @param options Опции кэширования
   * @returns Значение из кэша или результат выполнения fallback
   *
   * @example
   * ```typescript
   * const estimate = await this.cacheService.getOrSet(
   *   `estimate:${id}`,
   *   () => this.estimateRepository.findById(id),
   *   { ttl: 1800 }
   * );
   * ```
   */
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    options: { ttl?: number } = {}
  ): Promise<T> {
    const cachedValue = await this.get<T>(key);

    if (cachedValue !== undefined) {
      return cachedValue;
    }

    this.logger.debug(`Cache miss for key: ${key}, executing fallback`);
    const value = await fallback();
    await this.set(key, value, options);

    return value;
  }

  /**
   * Кэширование результата расчета с хешированием параметров
   *
   * @param namespace Пространство имен для ключа
   * @param parameters Параметры для хеширования
   * @param calculator Функция расчета
   * @param options Опции кэширования
   * @returns Результат расчета
   *
   * @example
   * ```typescript
   * const result = await this.cacheService.computeWithCache(
   *   'estimate:calculation',
   *   { estimateId, coefficients, region },
   *   () => this.calculateEstimate(estimateId, coefficients, region),
   *   { ttl: 3600 }
   * );
   * ```
   */
  async computeWithCache<T>(
    namespace: string,
    parameters: Record<string, any>,
    calculator: () => Promise<T>,
    options: { ttl?: number } = {}
  ): Promise<T> {
    const paramsHash = this.hashParameters(parameters);
    const key = `${namespace}:${paramsHash}`;

    return this.getOrSet(key, calculator, options);
  }

  /**
   * Удаление значения из кэша
   *
   * @param key Ключ для удаления
   *
   * @example
   * ```typescript
   * await this.cacheService.del('outdated:data');
   * ```
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Удаление всех ключей по паттерну
   *
   * @param pattern Паттерн для поиска ключей
   *
   * @example
   * ```typescript
   * // Удаление всех кэшированных данных пользователя
   * await this.cacheService.delPattern('user:123:*');
   * ```
   */  async delPattern(pattern: string): Promise<void> {
    try {
      // Получаем Redis store из cache manager
      const store = (this.cacheManager as any).store;

      if (store && store.getClient && typeof store.getClient === 'function') {
        const client = store.getClient();
        const keys = await client.keys(pattern);

        if (keys.length > 0) {
          await client.del(...keys);
          this.logger.debug(`Cache pattern deleted: ${pattern}, keys: ${keys.length}`);
        }
      } else {
        this.logger.warn(`Pattern deletion not supported for current cache store`);
      }
    } catch (error) {
      this.logger.error(`Cache pattern delete error for pattern ${pattern}:`, error);
    }
  }

  /**
   * Кэширование с тегами для группового управления
   *
   * @param key Ключ кэша
   * @param value Значение
   * @param tags Теги для группировки
   * @param options Опции кэширования
   *
   * @example
   * ```typescript
   * await this.cacheService.setWithTags(
   *   'fsbts:item:123',
   *   itemData,
   *   ['fsbts', 'reference-data', 'region:msk'],
   *   { ttl: 7200 }
   * );
   * ```
   */
  async setWithTags<T>(
    key: string,
    value: T,
    tags: string[],
    options: { ttl?: number } = {}
  ): Promise<void> {
    await this.set(key, value, options);

    // Сохраняем связь между тегами и ключами
    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      const taggedKeys = await this.get<string[]>(tagKey) || [];

      if (!taggedKeys.includes(key)) {
        taggedKeys.push(key);
        await this.set(tagKey, taggedKeys, { ttl: options.ttl });
      }
    }
  }

  /**
   * Удаление всех ключей по тегу
   *
   * @param tag Тег для удаления
   *
   * @example
   * ```typescript
   * // Удаление всех кэшированных данных ФСБТС
   * await this.cacheService.delByTag('fsbts');
   * ```
   */
  async delByTag(tag: string): Promise<void> {
    const tagKey = `tag:${tag}`;
    const taggedKeys = await this.get<string[]>(tagKey);

    if (taggedKeys && taggedKeys.length > 0) {
      // Удаляем все ключи с этим тегом
      await Promise.all(taggedKeys.map(key => this.del(key)));

      // Удаляем сам тег
      await this.del(tagKey);

      this.logger.debug(`Cache tag deleted: ${tag}, keys: ${taggedKeys.length}`);
    }
  }

  /**
   * Инкремент числового значения в кэше
   *
   * @param key Ключ кэша
   * @param increment Значение инкремента
   * @param options Опции кэширования
   * @returns Новое значение
   *
   * @example
   * ```typescript
   * const views = await this.cacheService.increment('page:views:123', 1, { ttl: 3600 });
   * ```
   */
  async increment(
    key: string,
    increment: number = 1,
    options: { ttl?: number } = {}
  ): Promise<number> {
    try {
      const currentValue = await this.get<number>(key) || 0;
      const newValue = currentValue + increment;
      await this.set(key, newValue, options);
      return newValue;
    } catch (error) {
      this.logger.error(`Cache increment error for key ${key}:`, error);
      return increment;
    }
  }

  /**
   * Мемоизация результатов функции
   *
   * @param fn Функция для мемоизации
   * @param keyGenerator Генератор ключа кэша
   * @param options Опции кэширования
   * @returns Мемоизированная функция
   *
   * @example
   * ```typescript
   * const memoizedCalculation = this.cacheService.memoize(
   *   (params) => this.expensiveCalculation(params),
   *   (params) => `calculation:${JSON.stringify(params)}`,
   *   { ttl: 3600 }
   * );
   * ```
   */
  memoize<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyGenerator: (...args: Parameters<T>) => string,
    options: { ttl?: number } = {}
  ): T {
    return (async (...args: Parameters<T>) => {
      const key = keyGenerator(...args);
      return this.getOrSet(key, () => fn(...args), options);
    }) as T;
  }

  /**
   * Получение статистики кэша
   *
   * @returns Статистика использования кэша
   *
   * @example
   * ```typescript
   * const stats = await this.cacheService.getStats();
   * console.log(`Cache hit rate: ${stats.hitRate}%`);
   * ```
   */  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage?: string;
    hitRate?: number;
  }> {
    try {
      const store = (this.cacheManager as any).store;

      if (store && store.getClient && typeof store.getClient === 'function') {
        const client = store.getClient();
        const info = await client.info('memory');
        const keyspace = await client.info('keyspace');

        // Парсим информацию о ключах
        const dbMatch = keyspace.match(/db\d+:keys=(\d+)/);
        const totalKeys = dbMatch ? parseInt(dbMatch[1], 10) : 0;

        // Парсим информацию о памяти
        const memoryMatch = info.match(/used_memory_human:(.+)/);
        const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'unknown';

        return {
          totalKeys,
          memoryUsage,
        };
      }

      return { totalKeys: 0 };
    } catch (error) {
      this.logger.error('Error getting cache stats:', error);
      return { totalKeys: 0 };
    }
  }

  /**
   * Генерация ключа кэша для пользователя
   *
   * @param userId ID пользователя
   * @param suffix Дополнительный суффикс
   * @returns Ключ кэша
   *
   * @example
   * ```typescript
   * const key = this.cacheService.generateUserCacheKey('123', 'profile');
   * // Результат: 'user:123:profile'
   * ```
   */
  generateUserCacheKey(userId: string, suffix?: string): string {
    return `user:${userId}${suffix ? `:${suffix}` : ''}`;
  }

  /**
   * Генерация ключа кэша для сметы
   *
   * @param estimateId ID сметы
   * @param suffix Дополнительный суффикс
   * @returns Ключ кэша
   *
   * @example
   * ```typescript
   * const key = this.cacheService.generateEstimateCacheKey('456', 'calculation');
   * // Результат: 'estimate:456:calculation'
   * ```
   */
  generateEstimateCacheKey(estimateId: string, suffix?: string): string {
    return `estimate:${estimateId}${suffix ? `:${suffix}` : ''}`;
  }

  /**
   * Генерация ключа кэша для списков с параметрами
   *
   * @param type Тип списка
   * @param params Параметры для хеширования
   * @returns Ключ кэша
   *
   * @example
   * ```typescript
   * const key = this.cacheService.generateListCacheKey('estimates', {
   *   userId: '123',
   *   page: 1,
   *   limit: 20
   * });
   * // Результат: 'list:estimates:limit:20|page:1|userId:123'
   * ```
   */
  generateListCacheKey(type: string, params: Record<string, any>): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `list:${type}:${paramString}`;
  }

  /**
   * Сброс всего кэша (осторожно использовать!)
   *
   * @example
   * ```typescript
   * await this.cacheService.reset();
   * ```
   */  async reset(): Promise<void> {
    try {
      const store = (this.cacheManager as any).store;

      if (store && store.getClient && typeof store.getClient === 'function') {
        const client = store.getClient();
        await client.flushdb();
        this.logger.warn('Cache completely reset');
      } else {
        this.logger.warn('Cache reset called - not all cache stores support this operation');
      }
    } catch (error) {
      this.logger.error('Cache reset error:', error);
    }
  }

  /**
   * Хеширование параметров для создания стабильного ключа кэша
   *
   * @param parameters Параметры для хеширования
   * @returns SHA256 хеш параметров
   *
   * @private
   */
  private hashParameters(parameters: Record<string, any>): string {
    const sortedParams = Object.keys(parameters)
      .sort()
      .reduce((result, key) => {
        result[key] = parameters[key];
        return result;
      }, {} as Record<string, any>);

    const paramsString = JSON.stringify(sortedParams);
    return createHash('sha256').update(paramsString).digest('hex').substring(0, 16);
  }
}
