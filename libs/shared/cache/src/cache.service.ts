import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly redisClient: Redis;

  private readonly memoryCache: Map<string, string>;

  private readonly useRedis: boolean;

  constructor() {
    this.useRedis = process.env.REDIS_URL !== undefined;

    if (this.useRedis) {
      this.redisClient = new Redis(process.env.REDIS_URL);
    } else {
      this.memoryCache = new Map();
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.useRedis) {
      return this.redisClient.get(key);
    } else {
      return this.memoryCache.get(key) || null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (this.useRedis) {
      if (ttl) {
        await this.redisClient.set(key, value, 'EX', ttl);
      } else {
        await this.redisClient.set(key, value);
      }
    } else {
      this.memoryCache.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (this.useRedis) {
      await this.redisClient.del(key);
    } else {
      this.memoryCache.delete(key);
    }
  }
}
