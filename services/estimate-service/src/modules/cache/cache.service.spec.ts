import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    configService = module.get<ConfigService>(ConfigService);
    
    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  describe('generateCacheKey', () => {
    it('should generate consistent cache keys for same inputs', () => {
      const prompt = 'Analyze this construction cost';
      const model = 'deepseek-r1';
      const params = { temperature: 0.7, maxTokens: 1000 };

      const key1 = service.generateCacheKey(prompt, model, params);
      const key2 = service.generateCacheKey(prompt, model, params);

      expect(key1).toBe(key2);
      expect(key1).toHaveLength(64); // SHA256 hash length
    });

    it('should generate different keys for different prompts', () => {
      const model = 'deepseek-r1';
      const params = { temperature: 0.7 };

      const key1 = service.generateCacheKey('prompt1', model, params);
      const key2 = service.generateCacheKey('prompt2', model, params);

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different models', () => {
      const prompt = 'Analyze this';
      const params = { temperature: 0.7 };

      const key1 = service.generateCacheKey(prompt, 'model1', params);
      const key2 = service.generateCacheKey(prompt, 'model2', params);

      expect(key1).not.toBe(key2);
    });

    it('should normalize parameters order', () => {
      const prompt = 'test';
      const model = 'test-model';

      const key1 = service.generateCacheKey(prompt, model, { b: 2, a: 1 });
      const key2 = service.generateCacheKey(prompt, model, { a: 1, b: 2 });

      expect(key1).toBe(key2);
    });
  });

  describe('set and get', () => {
    it('should store and retrieve values', async () => {
      const key = 'test-key';
      const value = { data: 'test-value', timestamp: new Date() };

      await service.set(key, value);
      const retrieved = await service.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should return null for non-existent keys', async () => {
      const result = await service.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should respect TTL', async () => {
      const key = 'ttl-test';
      const value = 'test-value';

      // Set with 1 second TTL
      await service.set(key, value, { ttl: 1 });
      
      // Should exist immediately
      let retrieved = await service.get(key);
      expect(retrieved).toBe(value);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be expired
      retrieved = await service.get(key);
      expect(retrieved).toBeNull();
    });

    it('should handle tags', async () => {
      const value1 = 'value1';
      const value2 = 'value2';
      const value3 = 'value3';

      await service.set('key1', value1, { tags: ['tag1', 'tag2'] });
      await service.set('key2', value2, { tags: ['tag1'] });
      await service.set('key3', value3, { tags: ['tag2'] });

      // Invalidate by tag1
      await service.invalidateByTag('tag1');

      // key1 and key2 should be invalidated
      expect(await service.get('key1')).toBeNull();
      expect(await service.get('key2')).toBeNull();
      
      // key3 should still exist
      expect(await service.get('key3')).toBe(value3);
    });
  });

  describe('wrap', () => {
    it('should cache function results', async () => {
      const key = 'wrap-test';
      let callCount = 0;
      
      const expensiveFunction = async () => {
        callCount++;
        return { result: 'expensive-computation', count: callCount };
      };

      // First call should execute the function
      const result1 = await service.wrap(key, expensiveFunction);
      expect(result1.count).toBe(1);
      expect(callCount).toBe(1);

      // Second call should return cached result
      const result2 = await service.wrap(key, expensiveFunction);
      expect(result2.count).toBe(1); // Same as first call
      expect(callCount).toBe(1); // Function not called again
    });
  });

  describe('statistics', () => {
    it('should track cache hits and misses', async () => {
      const key = 'stats-test';
      const value = 'test-value';

      // Initial stats
      let stats = service.getStats();
      const initialHits = stats.hits;
      const initialMisses = stats.misses;

      // Cache miss
      await service.get(key);
      stats = service.getStats();
      expect(stats.misses).toBe(initialMisses + 1);

      // Set value
      await service.set(key, value);

      // Cache hit
      await service.get(key);
      stats = service.getStats();
      expect(stats.hits).toBe(initialHits + 1);
    });

    it('should track cache size', async () => {
      let stats = service.getStats();
      const initialSize = stats.size;

      await service.set('key1', 'value1');
      await service.set('key2', 'value2');

      stats = service.getStats();
      expect(stats.size).toBe(initialSize + 2);

      await service.delete('key1');
      
      stats = service.getStats();
      expect(stats.size).toBe(initialSize + 1);
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', async () => {
      await service.set('key1', 'value1');
      await service.set('key2', 'value2');
      await service.set('key3', 'value3');

      await service.clear();

      expect(await service.get('key1')).toBeNull();
      expect(await service.get('key2')).toBeNull();
      expect(await service.get('key3')).toBeNull();

      const stats = service.getStats();
      expect(stats.size).toBe(0);
    });
  });
});
