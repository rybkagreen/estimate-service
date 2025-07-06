import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EstimateService } from '../../src/modules/estimate/estimate.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CacheService } from '../../src/shared/cache/cache.service';
import { CacheService as EnhancedCacheService } from '../../src/shared/cache/enhanced-cache.service';
import { EstimateStreamingService } from '../../src/shared/streaming/streaming.service';
import { CircuitBreakerService } from '../../src/shared/circuit-breaker/circuit-breaker.service';

/**
 * Интеграционные тесты для EstimateService с новой функциональностью
 * 
 * Тестирует:
 * - Кэширование промежуточных расчетов
 * - Streaming обработку больших смет
 * - Circuit Breaker для внешних API
 * - Статистику кэширования
 */
describe('EstimateService Integration Tests', () => {
  let service: EstimateService;
  let module: TestingModule;
  let enhancedCacheService: EnhancedCacheService;
  let streamingService: EstimateStreamingService;
  let circuitBreakerService: CircuitBreakerService;

  // Mock данные для тестов
  const mockEstimate = {
    id: 'test-estimate-1',
    title: 'Тестовая смета',
    status: 'draft',
    items: [
      { id: '1', description: 'Материалы', quantity: 100, price: 1500 },
      { id: '2', description: 'Работы', quantity: 50, price: 2000 },
    ]
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstimateService,
        {
          provide: PrismaService,
          useValue: {
            // Mock PrismaService methods
          },
        },
        {
          provide: CacheService,
          useValue: {
            getOrSet: jest.fn(),
            del: jest.fn(),
            generateEstimateCacheKey: jest.fn((id) => `estimate:${id}`),
          },
        },
        {
          provide: EnhancedCacheService,
          useValue: {
            getOrSet: jest.fn(),
            del: jest.fn(),
            delByTag: jest.fn(),
            getStats: jest.fn(),
          },
        },
        {
          provide: EstimateStreamingService,
          useValue: {
            processLargeEstimate: jest.fn(),
          },
        },
        {
          provide: CircuitBreakerService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              const config = {
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6379,
                CIRCUIT_BREAKER_FAILURE_THRESHOLD: 5,
                CIRCUIT_BREAKER_TIMEOUT: 60000,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EstimateService>(EstimateService);
    enhancedCacheService = module.get<EnhancedCacheService>(EnhancedCacheService);
    streamingService = module.get<EstimateStreamingService>(EstimateStreamingService);
    circuitBreakerService = module.get<CircuitBreakerService>(CircuitBreakerService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('Кэширование промежуточных расчетов', () => {
    it('должен кэшировать результаты расчетов', async () => {
      // Arrange
      const parameters = { category: 'materials', region: 'moscow' };
      const expectedResult = {
        materials: { total: 150000, items: 25 },
        labor: { total: 80000, hours: 120 },
        overhead: { total: 23000, percentage: 10 }
      };

      jest.spyOn(enhancedCacheService, 'getOrSet').mockResolvedValue(expectedResult);

      // Act
      const result = await service.calculateIntermediateResults('test-estimate-1', parameters);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(enhancedCacheService.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('estimate:calculation:test-estimate-1'),
        expect.any(Function),
        { ttl: 1800 }
      );
    });

    it('должен выполнить вычисления при отсутствии в кэше', async () => {
      // Arrange
      const parameters = { category: 'materials', region: 'moscow' };

      jest.spyOn(enhancedCacheService, 'getOrSet').mockImplementation(
        async (key, fallback, options) => {
          return await fallback();
        }
      );

      // Act
      const result = await service.calculateIntermediateResults('test-estimate-1', parameters);

      // Assert
      expect(result).toBeDefined();
      expect(result.materials).toBeDefined();
      expect(result.labor).toBeDefined();
      expect(result.overhead).toBeDefined();
    });
  });

  describe('Streaming обработка больших смет', () => {
    it('должен обрабатывать большие сметы через streaming', async () => {
      // Arrange
      const expectedResult = {
        processed: 1000,
        errors: [],
        duration: 5000
      };

      jest.spyOn(streamingService, 'processLargeEstimate').mockResolvedValue(expectedResult);

      // Act
      const result = await service.processLargeEstimate('test-estimate-1');

      // Assert
      expect(result).toEqual(expectedResult);
      expect(streamingService.processLargeEstimate).toHaveBeenCalledWith(
        expect.stringContaining('/tmp/estimate-test-estimate-1.json'),
        expect.objectContaining({
          chunkSize: 100,
          onProgress: expect.any(Function)
        })
      );
    });

    it('должен вызывать callback onProgress', async () => {
      // Arrange
      const progressCallback = jest.fn();
      
      jest.spyOn(streamingService, 'processLargeEstimate').mockImplementation(
        async (filePath, options) => {
          // Симулируем вызов onProgress
          if (options?.onProgress) {
            options.onProgress(0.5); // 50% прогресс
          }
          return { processed: 500, errors: [], duration: 2500 };
        }
      );

      // Перехватываем console.log для проверки вызова
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await service.processLargeEstimate('test-estimate-1');

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Обработка сметы test-estimate-1: 50%')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Circuit Breaker для внешних API', () => {
    it('должен выполнить запрос через Circuit Breaker', async () => {
      // Arrange
      const estimateData = { items: [], region: 'moscow' };
      const expectedResult = {
        success: true,
        estimateId: '12345',
        calculations: estimateData
      };

      jest.spyOn(circuitBreakerService, 'execute').mockResolvedValue(expectedResult);

      // Act
      const result = await service.callExternalEstimateAPI(estimateData);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(circuitBreakerService.execute).toHaveBeenCalledWith(
        'external-estimate-api',
        expect.any(Function)
      );
    });

    it('должен обработать ошибку API через Circuit Breaker', async () => {
      // Arrange
      const estimateData = { items: [], region: 'moscow' };
      const error = new Error('API временно недоступен');

      jest.spyOn(circuitBreakerService, 'execute').mockRejectedValue(error);

      // Act & Assert
      await expect(service.callExternalEstimateAPI(estimateData)).rejects.toThrow(error);
    });
  });

  describe('Статистика кэширования', () => {
    it('должен возвращать статистику кэша', async () => {
      // Arrange
      const expectedStats = {
        hits: 150,
        misses: 50,
        hitRate: 0.75,
        totalRequests: 200,
        size: 1024,
        lastUpdated: new Date()
      };

      jest.spyOn(enhancedCacheService, 'getStats').mockResolvedValue(expectedStats);

      // Act
      const result = await service.getCacheStatistics();

      // Assert
      expect(result).toEqual(expectedStats);
      expect(enhancedCacheService.getStats).toHaveBeenCalled();
    });
  });

  describe('Очистка кэша', () => {
    it('должен очистить кэш для конкретной сметы', async () => {
      // Arrange
      const estimateId = 'test-estimate-1';

      jest.spyOn(enhancedCacheService, 'delByTag').mockResolvedValue();
      jest.spyOn(enhancedCacheService, 'del').mockResolvedValue();

      // Act
      await service.clearEstimateCache(estimateId);

      // Assert
      expect(enhancedCacheService.delByTag).toHaveBeenCalledWith(`estimate:${estimateId}`);
      expect(enhancedCacheService.del).toHaveBeenCalledWith(`estimate:${estimateId}`);
    });
  });

  describe('Интеграция с улучшенным кэшированием', () => {
    it('должен использовать улучшенное кэширование для findAll', async () => {
      // Arrange
      const expectedEstimates = [
        { id: '1', title: 'Смета №1', status: 'draft' },
        { id: '2', title: 'Смета №2', status: 'approved' },
      ];

      jest.spyOn(enhancedCacheService, 'getOrSet').mockResolvedValue(expectedEstimates);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(expectedEstimates);
      expect(enhancedCacheService.getOrSet).toHaveBeenCalledWith(
        'estimates:all',
        expect.any(Function),
        { ttl: 300 }
      );
    });
  });
});
