import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@ez-eco/shared-cache';
import { RegionalZone } from '@ez-eco/shared-contracts';

/**
 * Сервис кэширования региональных данных
 * Обеспечивает быстрый доступ к часто используемым коэффициентам
 */
@Injectable()
export class RegionalCacheService {
  private readonly logger = new Logger(RegionalCacheService.name);
  private readonly CACHE_PREFIX = 'regional:';
  private readonly DEFAULT_TTL = 3600; // 1 час

  constructor(private readonly redis: RedisService) {}

  /**
   * Получение коэффициента из кэша
   */
  async getCoefficient(key: string): Promise<number | null> {
    try {
      const cached = await this.redis.get(`${this.CACHE_PREFIX}${key}`);
      return cached ? parseFloat(cached) : null;
    } catch (error) {
      this.logger.error(`Failed to get coefficient from cache: ${key}`, error);
      return null;
    }
  }

  /**
   * Сохранение коэффициента в кэш
   */
  async setCoefficient(key: string, value: number, ttl?: number): Promise<void> {
    try {
      await this.redis.set(
        `${this.CACHE_PREFIX}${key}`,
        value.toString(),
        { ttl: ttl || this.DEFAULT_TTL }
      );
    } catch (error) {
      this.logger.error(`Failed to set coefficient in cache: ${key}`, error);
    }
  }

  /**
   * Получение региональных зон из кэша
   */
  async getZones(): Promise<RegionalZone[] | null> {
    try {
      const cached = await this.redis.get(`${this.CACHE_PREFIX}zones`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.error('Failed to get zones from cache', error);
      return null;
    }
  }

  /**
   * Сохранение региональных зон в кэш
   */
  async setZones(zones: RegionalZone[], ttl?: number): Promise<void> {
    try {
      await this.redis.set(
        `${this.CACHE_PREFIX}zones`,
        JSON.stringify(zones),
        { ttl: ttl || this.DEFAULT_TTL * 4 } // 4 часа для зон
      );
    } catch (error) {
      this.logger.error('Failed to set zones in cache', error);
    }
  }

  /**
   * Массовое получение коэффициентов
   */
  async getBulk(keys: string[]): Promise<Map<string, number>> {
    const results = new Map<string, number>();
    
    try {
      const pipeline = this.redis.pipeline();
      const prefixedKeys = keys.map(key => `${this.CACHE_PREFIX}${key}`);
      
      for (const key of prefixedKeys) {
        pipeline.get(key);
      }
      
      const values = await pipeline.exec();
      
      keys.forEach((key, index) => {
        const value = values?.[index]?.[1];
        if (value) {
          results.set(key, parseFloat(value as string));
        }
      });
    } catch (error) {
      this.logger.error('Failed to get bulk coefficients from cache', error);
    }
    
    return results;
  }

  /**
   * Массовое сохранение коэффициентов
   */
  async setBulk(data: Map<string, number>, ttl?: number): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of data) {
        pipeline.set(
          `${this.CACHE_PREFIX}${key}`,
          value.toString(),
          'EX',
          ttl || this.DEFAULT_TTL
        );
      }
      
      await pipeline.exec();
    } catch (error) {
      this.logger.error('Failed to set bulk coefficients in cache', error);
    }
  }

  /**
   * Инвалидация конкретного коэффициента
   */
  async invalidateCoefficient(key: string): Promise<void> {
    try {
      await this.redis.del(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate coefficient: ${key}`, error);
    }
  }

  /**
   * Инвалидация всех региональных данных
   */
  async invalidateAll(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(`Invalidated ${keys.length} regional cache entries`);
      }
    } catch (error) {
      this.logger.error('Failed to invalidate all regional cache', error);
    }
  }

  /**
   * Прогрев кэша для конкретного региона
   */
  async warmupRegion(regionCode: string, data: Map<string, number>): Promise<void> {
    const regionData = new Map<string, number>();
    
    for (const [key, value] of data) {
      if (key.includes(regionCode)) {
        regionData.set(key, value);
      }
    }
    
    if (regionData.size > 0) {
      await this.setBulk(regionData);
      this.logger.log(`Warmed up cache for region ${regionCode}: ${regionData.size} entries`);
    }
  }
}
