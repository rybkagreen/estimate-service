import { CacheOptions } from './cache.service';

/**
 * Decorator factory for caching method results
 */
export function Cacheable(options: CacheOptions & { keyPrefix?: string } = {}) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Get cache service from this context
      const cacheService = (this as any).cacheService;
      
      if (!cacheService) {
        // If no cache service is available, just execute the method
        return originalMethod.apply(this, args);
      }

      // Generate cache key
      const keyPrefix = options.keyPrefix || `${target.constructor.name}:${propertyName}`;
      const keyData = JSON.stringify(args);
      const cacheKey = `${keyPrefix}:${Buffer.from(keyData).toString('base64')}`;

      try {
        // Try to get from cache
        const cached = await cacheService.get(cacheKey);
        if (cached !== null) {
          return cached;
        }

        // Execute method and cache result
        const result = await originalMethod.apply(this, args);
        await cacheService.set(cacheKey, result, {
          ttl: options.ttl,
          tags: options.tags,
        });

        return result;
      } catch (error) {
        // On error, just execute the method without caching
        console.error(`Cache decorator error: ${error}`);
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * Decorator for invalidating cache by tags
 */
export function CacheInvalidate(tags: string[]) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      // Get cache service from this context
      const cacheService = (this as any).cacheService;
      
      if (cacheService) {
        // Invalidate cache entries with specified tags
        for (const tag of tags) {
          await cacheService.invalidateByTag(tag);
        }
      }

      return result;
    };

    return descriptor;
  };
}
