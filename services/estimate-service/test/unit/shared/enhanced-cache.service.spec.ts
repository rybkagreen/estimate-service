import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from '../../../src/shared/cache/enhanced-cache.service';

/**
 * Unit тесты для Enhanced Cache Service
 * 
 * Тестирует:
 * - Кэширование с тегами
 * - Статистику кэша
 * - Мемоизацию функций
 * - Автоматическую инвалидацию
 */
describe('Enhanced Cache Service', () => {
  let service: CacheService;
  let cacheManager: any;

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
      keys: jest.fn().mockResolvedValue([]),
      store: {
        keys: jest.fn().mockResolvedValue([]),
        del: jest.fn(),
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              const config = {
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6379,
                REDIS_PASSWORD: '',
                REDIS_DB: 0,
                CACHE_TTL: 300,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  describe('Базовые операции кэширования', () => {
    it('должен сохранить и получить значение', async () => {
      // Arrange
      const key = 'test:key';
      const value = { data: 'test value' };
      
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      // Act
      await service.set(key, value, { ttl: 300 });
      const result = await service.getOrSet(
        key,
        async () => value,
        { ttl: 300 }
      );

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(key, value, 300000);
      expect(result).toEqual(value);
    });

    it('должен вернуть cached значение если оно существует', async () => {
      // Arrange
      const key = 'test:key';
      const cachedValue = { data: 'cached value' };
      
      cacheManager.get.mockResolvedValue(cachedValue);

      // Act
      const result = await service.getOrSet(
        key,
        async () => ({ data: 'new value' }),
        { ttl: 300 }
      );

      // Assert
      expect(result).toEqual(cachedValue);
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('Статистика кэша', () => {
    it('должен возвращать статистику', async () => {
      // Arrange
      cacheManager.keys.mockResolvedValue(['key1', 'key2', 'key3']);

      // Act
      const stats = await service.getStats();

      // Assert
      expect(stats).toBeDefined();
      expect(stats.hits).toBeDefined();
      expect(stats.misses).toBeDefined();
      expect(stats.hitRate).toBeDefined();
      expect(stats.totalRequests).toBeDefined();
    });

    it('должен подсчитывать hit rate правильно', async () => {
      // Arrange
      const key = 'test:key';
      
      // Симулируем cache hit
      cacheManager.get.mockResolvedValueOnce({ data: 'value' });
      await service.get(key);
      
      // Симулируем cache miss
      cacheManager.get.mockResolvedValueOnce(null);
      await service.get('another:key');

      // Act
      const stats = await service.getStats();

      // Assert
      expect(stats.totalRequests).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Удаление по тегам', () => {
    it('должен удалить ключи по тегу', async () => {
      // Arrange
      const tag = 'estimate:123';
      const keys = ['estimate:123:data', 'estimate:123:meta'];
      
      cacheManager.store.keys.mockResolvedValue(keys);
      cacheManager.store.del.mockResolvedValue(undefined);

      // Act
      await service.delByTag(tag);

      // Assert
      expect(cacheManager.store.keys).toHaveBeenCalledWith(`*${tag}*`);
      expect(cacheManager.store.del).toHaveBeenCalledTimes(keys.length);
    });
  });

  describe('Паттерны удаления', () => {
    it('должен удалить ключи по паттерну', async () => {
      // Arrange
      const pattern = 'user:*:profile';
      const keys = ['user:1:profile', 'user:2:profile'];
      
      cacheManager.store.keys.mockResolvedValue(keys);
      cacheManager.store.del.mockResolvedValue(undefined);

      // Act
      await service.delPattern(pattern);

      // Assert
      expect(cacheManager.store.keys).toHaveBeenCalledWith(pattern);
      expect(cacheManager.store.del).toHaveBeenCalledTimes(keys.length);
    });
  });

  describe('Счетчики', () => {
    it('должен увеличить счетчик', async () => {
      // Arrange
      const key = 'counter:test';
      
      cacheManager.get.mockResolvedValue(5);
      cacheManager.set.mockResolvedValue(undefined);

      // Act
      const result = await service.increment(key, 3, { ttl: 300 });

      // Assert
      expect(result).toBe(8);
      expect(cacheManager.set).toHaveBeenCalledWith(key, 8, 300000);
    });

    it('должен создать новый счетчик если его нет', async () => {
      // Arrange
      const key = 'counter:new';
      
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      // Act
      const result = await service.increment(key, 1, { ttl: 300 });

      // Assert
      expect(result).toBe(1);
      expect(cacheManager.set).toHaveBeenCalledWith(key, 1, 300000);
    });
  });

  describe('Мемоизация', () => {
    it('должен кэшировать результат функции', async () => {
      // Arrange
      const expensiveFunction = jest.fn().mockResolvedValue('computed result');
      const key = 'memoized:function';
      
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      // Act
      const memoized = service.memoize(expensiveFunction, { ttl: 300 });
      const result1 = await memoized(key, 'arg1', 'arg2');
      
      // Второй вызов должен взять из кэша
      cacheManager.get.mockResolvedValue('computed result');
      const result2 = await memoized(key, 'arg1', 'arg2');

      // Assert
      expect(result1).toBe('computed result');
      expect(result2).toBe('computed result');
      expect(expensiveFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Обработка ошибок', () => {
    it('должен обработать ошибку при сохранении в кэш', async () => {
      // Arrange
      const key = 'error:key';
      const value = { data: 'test' };
      
      cacheManager.set.mockRejectedValue(new Error('Cache error'));

      // Act & Assert
      await expect(service.set(key, value)).rejects.toThrow('Cache error');
    });

    it('должен обработать ошибку при получении из кэша', async () => {
      // Arrange
      const key = 'error:key';
      
      cacheManager.get.mockRejectedValue(new Error('Cache error'));

      // Act & Assert
      await expect(service.get(key)).rejects.toThrow('Cache error');
    });
  });
});
