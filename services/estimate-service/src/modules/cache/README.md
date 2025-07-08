# Cache Module

This module provides a comprehensive caching solution for the AI-powered estimation service with support for both in-memory and Redis-based caching.

## Features

- **Hybrid Caching**: Automatic fallback from Redis to in-memory cache
- **Cache Key Generation**: Deterministic key generation from prompts, models, and parameters
- **TTL Support**: Time-based cache expiration
- **Tag-based Invalidation**: Invalidate related cache entries using tags
- **Statistics**: Track cache hits, misses, and performance metrics
- **Decorators**: Easy-to-use decorators for method caching
- **REST API**: Management endpoints for cache operations

## Installation

The cache module is automatically initialized when the application starts. To enable Redis caching, set the following environment variables:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here  # Optional
```

If Redis is not available, the system will automatically fall back to in-memory caching.

## Usage

### Basic Usage

```typescript
import { CacheService } from '../cache';

@Injectable()
export class MyService {
  constructor(private readonly cacheService: CacheService) {}

  async getExpensiveData(id: string): Promise<any> {
    const cacheKey = `expensive-data:${id}`;
    
    // Try to get from cache
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Compute expensive operation
    const result = await this.computeExpensiveOperation(id);
    
    // Store in cache with 1-hour TTL
    await this.cacheService.set(cacheKey, result, { ttl: 3600 });
    
    return result;
  }
}
```

### Using Cache Wrapper

```typescript
async getDataWithCaching(id: string): Promise<any> {
  const cacheKey = `data:${id}`;
  
  return await this.cacheService.wrap(
    cacheKey,
    async () => {
      // This function is only called on cache miss
      return await this.fetchDataFromDatabase(id);
    },
    { ttl: 3600, tags: ['database', `entity:${id}`] }
  );
}
```

### AI Response Caching

The cache module is integrated with the AI assistant service to cache AI responses:

```typescript
// Automatic caching in AI provider
const cacheKey = this.cacheService.generateCacheKey(
  prompt,
  modelIdentifier,
  { temperature, maxTokens, systemPrompt }
);

const response = await this.cacheService.wrap(
  cacheKey,
  () => this.aiProvider.generateResponse(request),
  { ttl: 3600, tags: ['ai-response', `model:${model}`] }
);
```

### Using Decorators

```typescript
import { Cacheable, CacheInvalidate } from '../cache';

@Injectable()
export class EstimateService {
  constructor(private readonly cacheService: CacheService) {}

  @Cacheable({ ttl: 3600, tags: ['estimates'] })
  async getEstimate(id: string): Promise<Estimate> {
    // This method's results will be automatically cached
    return await this.computeEstimate(id);
  }

  @CacheInvalidate(['estimates'])
  async updateEstimate(id: string, data: UpdateEstimateDto): Promise<Estimate> {
    // This will invalidate all cache entries with 'estimates' tag
    return await this.saveEstimate(id, data);
  }
}
```

## API Endpoints

### Get Cache Statistics
```http
GET /api/cache/stats
```

Response:
```json
{
  "hits": 150,
  "misses": 50,
  "evictions": 10,
  "size": 45,
  "hitRate": 0.75
}
```

### Clear Cache
```http
DELETE /api/cache
```

### Invalidate by Tag
```http
DELETE /api/cache/tag/{tag}
```

### Warm Cache
```http
POST /api/cache/warm
Content-Type: application/json

{
  "prompts": ["Analyze cost", "Calculate risk"],
  "model": "deepseek-r1"
}
```

### Get Cached Value
```http
GET /api/cache/key/{key}
```

## Cache Key Generation

Cache keys are generated using SHA256 hash of:
- Prompt text
- Model identifier
- Normalized parameters (sorted by key)

Example:
```typescript
const key = cacheService.generateCacheKey(
  "Analyze construction costs",
  "deepseek-r1",
  { temperature: 0.7, maxTokens: 1000 }
);
// Returns: "a1b2c3d4e5f6..." (64-character hex string)
```

## TTL Strategy

- **High Temperature (>0.8)**: 30 minutes (creative/varied responses)
- **Low Temperature (<0.3)**: 24 hours (deterministic responses)
- **Default**: 1 hour

## Tags

Tags are used for grouped cache invalidation:
- `ai-response`: All AI-generated responses
- `model:{model}`: Responses from specific model
- `provider:{provider}`: Responses from specific provider
- `context:{type}`: Responses with specific context type
- `project:{id}`: Responses for specific project

## Performance Considerations

1. **Memory Usage**: In-memory cache has automatic cleanup every minute
2. **Redis Connection**: Automatic fallback if Redis is unavailable
3. **Key Generation**: Fast SHA256 hashing for consistent keys
4. **Statistics**: Minimal overhead for tracking metrics

## Testing

Run the cache service tests:
```bash
npm test cache.service.spec.ts
```

## Configuration

Environment variables:
- `REDIS_HOST`: Redis server hostname
- `REDIS_PORT`: Redis server port (default: 6379)
- `REDIS_PASSWORD`: Redis password (optional)
- `CACHE_DEFAULT_TTL`: Default cache TTL in seconds (default: 3600)
- `CACHE_CLEANUP_INTERVAL`: Cleanup interval in ms (default: 60000)
