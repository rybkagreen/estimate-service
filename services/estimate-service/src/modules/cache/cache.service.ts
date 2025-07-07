import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private memoryCache: Map<string, { value: any; expiry: number; tags: string[] }>;
  private redisClient: any = null;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
  };
  private cleanupInterval: NodeJS.Timer | null = null;
  private isRedisAvailable = false;

  constructor(private readonly configService: ConfigService) {
    this.memoryCache = new Map();
  }

  async onModuleInit() {
    // Try to initialize Redis if available
    if (this.configService.get('REDIS_HOST')) {
      try {
        // Dynamically import Redis to avoid errors if not installed
        const { createClient } = await import('redis').catch(() => null);
        if (createClient) {
          this.redisClient = createClient({
            socket: {
              host: this.configService.get('REDIS_HOST', 'localhost'),
              port: this.configService.get('REDIS_PORT', 6379),
            },
            password: this.configService.get('REDIS_PASSWORD'),
          });

          this.redisClient.on('error', (err: any) => {
            this.logger.error('Redis connection error:', err);
            this.isRedisAvailable = false;
          });

          this.redisClient.on('connect', () => {
            this.logger.log('Connected to Redis');
            this.isRedisAvailable = true;
          });

          await this.redisClient.connect();
        }
      } catch (error) {
        this.logger.warn('Redis not available, using in-memory cache only');
      }
    }

    // Start cleanup interval for expired entries
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // Run every minute
  }

  async onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    if (this.redisClient && this.isRedisAvailable) {
      await this.redisClient.quit();
    }
  }

  /**
   * Generate cache key from prompt, model, and parameters
   */
  generateCacheKey(
    prompt: string,
    modelIdentifier: string,
    parameters: Record<string, any> = {},
  ): string {
    const keyData = {
      prompt,
      model: modelIdentifier,
      params: this.normalizeParameters(parameters),
    };

    const keyString = JSON.stringify(keyData);
    return crypto.createHash('sha256').update(keyString).digest('hex');
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first if available
      if (this.isRedisAvailable && this.redisClient) {
        const redisValue = await this.redisClient.get(key);
        if (redisValue) {
          this.stats.hits++;
          return JSON.parse(redisValue);
        }
      }

      // Fallback to memory cache
      const cached = this.memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        this.stats.hits++;
        return cached.value;
      }

      if (cached && cached.expiry <= Date.now()) {
        // Clean up expired entry
        this.memoryCache.delete(key);
        this.stats.evictions++;
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || 3600; // Default 1 hour
    const tags = options.tags || [];

    try {
      // Set in Redis if available
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.setEx(key, ttl, JSON.stringify(value));
        
        // Store tags in Redis for invalidation
        if (tags.length > 0) {
          for (const tag of tags) {
            await this.redisClient.sAdd(`tag:${tag}`, key);
            await this.redisClient.expire(`tag:${tag}`, ttl);
          }
        }
      }

      // Always set in memory cache as fallback
      const expiry = Date.now() + (ttl * 1000);
      this.memoryCache.set(key, { value, expiry, tags });
      this.stats.size = this.memoryCache.size;
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.del(key);
      }
      this.memoryCache.delete(key);
      this.stats.size = this.memoryCache.size;
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.flushDb();
      }
      this.memoryCache.clear();
      this.stats.size = 0;
    } catch (error) {
      this.logger.error('Cache clear error:', error);
    }
  }

  /**
   * Invalidate cache entries by tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    try {
      // Invalidate in Redis
      if (this.isRedisAvailable && this.redisClient) {
        const keys = await this.redisClient.sMembers(`tag:${tag}`);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
          await this.redisClient.del(`tag:${tag}`);
        }
      }

      // Invalidate in memory cache
      const keysToDelete: string[] = [];
      this.memoryCache.forEach((value, key) => {
        if (value.tags.includes(tag)) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => this.memoryCache.delete(key));
      this.stats.size = this.memoryCache.size;
    } catch (error) {
      this.logger.error(`Cache invalidate by tag error for tag ${tag}:`, error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      size: this.memoryCache.size,
    };
  }

  /**
   * Cache wrapper function for easy integration
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn();
    await this.set(key, result, options);
    return result;
  }

  /**
   * Normalize parameters for consistent cache key generation
   */
  private normalizeParameters(params: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = {};
    const sortedKeys = Object.keys(params).sort();

    for (const key of sortedKeys) {
      const value = params[key];
      if (value !== undefined && value !== null) {
        normalized[key] = value;
      }
    }

    return normalized;
  }

  /**
   * Clean up expired entries from memory cache
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let evictedCount = 0;

    this.memoryCache.forEach((value, key) => {
      if (value.expiry <= now) {
        this.memoryCache.delete(key);
        evictedCount++;
      }
    });

    if (evictedCount > 0) {
      this.stats.evictions += evictedCount;
      this.stats.size = this.memoryCache.size;
      this.logger.debug(`Evicted ${evictedCount} expired cache entries`);
    }
  }
}
