import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    // Reset functionality may not be available in all cache implementations
    // This is a fallback implementation
    console.warn('Cache reset called - not all cache stores support this operation');
  }

  // Utility methods for common cache patterns
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    let value = await this.get<T>(key);

    if (value === undefined) {
      value = await factory();
      await this.set(key, value, ttl);
    }

    return value;
  }

  // Cache key generators
  generateUserCacheKey(userId: string, suffix?: string): string {
    return `user:${userId}${suffix ? `:${suffix}` : ''}`;
  }

  generateEstimateCacheKey(estimateId: string, suffix?: string): string {
    return `estimate:${estimateId}${suffix ? `:${suffix}` : ''}`;
  }

  generateListCacheKey(type: string, params: Record<string, any>): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `list:${type}:${paramString}`;
  }
}
