import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from './cache.decorators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(CACHE_KEY_METADATA, context.getHandler());
    const cacheTTL = this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler());

    if (!cacheKey) {
      return next.handle();
    }

    // Generate full cache key with request parameters
    const request = context.switchToHttp().getRequest();
    const fullCacheKey = this.generateCacheKey(cacheKey, request);

    // Try to get cached value
    const cachedValue = await this.cacheManager.get(fullCacheKey);
    if (cachedValue !== undefined) {
      return of(cachedValue);
    }

    // Execute original method and cache result
    return next.handle().pipe(
      tap(async (result) => {
        if (result !== undefined) {
          await this.cacheManager.set(fullCacheKey, result, cacheTTL);
        }
      }),
    );
  }

  private generateCacheKey(baseKey: string, request: any): string {
    const params = { ...request.params, ...request.query };
    const userId = request.user?.id;

    const keyParts = [baseKey];

    if (userId) {
      keyParts.push(`user:${userId}`);
    }

    if (Object.keys(params).length > 0) {
      const paramString = Object.keys(params)
        .sort()
        .map(key => `${key}:${params[key]}`)
        .join('|');
      keyParts.push(`params:${paramString}`);
    }

    return keyParts.join(':');
  }
}
