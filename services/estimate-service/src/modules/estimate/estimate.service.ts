import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../shared/cache/cache.service';
import { CacheService as EnhancedCacheService } from '../../shared/cache/enhanced-cache.service';
import { CircuitBreakerService } from '../../shared/circuit-breaker/circuit-breaker.service';
import { EstimateStreamingService } from '../../shared/streaming/streaming.service';

/**
 * Сервис для работы со сметами
 *
 * Предоставляет функциональность для создания, обновления, поиска и расчета смет
 * с поддержкой кэширования, стриминга и отказоустойчивости.
 *
 * @example
 * ```typescript
 * // Создание новой сметы
 * const estimate = await estimateService.create({
 *   title: 'Смета на строительство',
 *   description: 'Детальная смета с материалами и работами'
 * });
 *
 * // Получение сметы с кэшированием
 * const estimate = await estimateService.findOne('estimate-id');
 *
 * // Расчет большой сметы со стримингом
 * const stream = await estimateService.calculateLargeEstimate('estimate-id');
 * for await (const chunk of stream) {
 *   console.log('Промежуточный результат:', chunk);
 * }
 * ```
 */
@Injectable()
export class EstimateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly enhancedCacheService: EnhancedCacheService,
    private readonly streamingService: EstimateStreamingService,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  /**
   * Получение всех смет с улучшенным кэшированием
   *
   * @example
   * ```typescript
   * const estimates = await estimateService.findAll();
   * ```
   */
  async findAll() {
    return this.enhancedCacheService.getOrSet(
      'estimates:all',
      async () => {
        // Mock data for now
        return [
          { id: '1', title: 'Смета №1', status: 'draft' },
          { id: '2', title: 'Смета №2', status: 'approved' },
        ];
      },
      { ttl: 300 }
    );
  }

  async findOne(id: string) {
    const cacheKey = this.cacheService.generateEstimateCacheKey(id);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Mock data for now
        if (id === '1' || id === '2') {
          return {
            id,
            title: `Смета №${id}`,
            status: id === '1' ? 'draft' : 'approved',
            items: [
              { id: `${id}-1`, description: 'Материалы', quantity: 100, price: 1500 },
              { id: `${id}-2`, description: 'Работы', quantity: 50, price: 2000 },
            ]
          };
        }
        throw new NotFoundException(`Смета с ID ${id} не найдена`);
      },
      600000, // 10 minutes
    );
  }

  async create(createEstimateDto: any) {
    // Mock creation
    const newEstimate = {
      id: Date.now().toString(),
      ...createEstimateDto,
      status: 'draft',
      createdAt: new Date(),
    };

    // Clear cache for estimates list
    await this.cacheService.del('estimates:all');

    return newEstimate;
  }

  /**
   * Расчет промежуточных результатов с кэшированием
   *
   * @param estimateId ID сметы
   * @param parameters Параметры расчета
   * @example
   * ```typescript
   * const result = await estimateService.calculateIntermediateResults('123', {
   *   category: 'materials',
   *   region: 'moscow'
   * });
   * ```
   */
  async calculateIntermediateResults(estimateId: string, parameters: any) {
    const cacheKey = `estimate:calculation:${estimateId}:${JSON.stringify(parameters)}`;

    return this.enhancedCacheService.getOrSet(
      cacheKey,
      async () => {
        // Симуляция сложного расчета
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          materials: { total: 150000, items: 25 },
          labor: { total: 80000, hours: 120 },
          overhead: { total: 23000, percentage: 10 }
        };
      },
      { ttl: 1800 } // 30 минут
    );
  }

  /**
   * Обработка большой сметы со стримингом
   *
   * @param estimateId ID сметы
   * @example
   * ```typescript
   * const result = await estimateService.processLargeEstimate('123');
   * console.log('Обработано:', result.processed);
   * ```
   */
  async processLargeEstimate(estimateId: string) {
    // Симуляция пути к файлу сметы
    const filePath = `/tmp/estimate-${estimateId}.json`;

    return this.streamingService.processLargeEstimate(filePath, {
      chunkSize: 100,
      onProgress: (progress: number) => {
        console.log(`Обработка сметы ${estimateId}: ${Math.round(progress * 100)}%`);
      }
    });
  }

  /**
   * Вызов внешнего API с Circuit Breaker
   *
   * @param estimateData Данные сметы
   * @example
   * ```typescript
   * const result = await estimateService.callExternalEstimateAPI({
   *   items: [...],
   *   region: 'moscow'
   * });
   * ```
   */
  async callExternalEstimateAPI(estimateData: any) {
    // Используем Circuit Breaker сервис напрямую
    return this.circuitBreakerService.execute(
      'external-estimate-api',
      async () => {
        // Симуляция вызова внешнего API с простой реализацией
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Случайная ошибка для демонстрации Circuit Breaker
        if (Math.random() < 0.3) {
          throw new Error('API временно недоступен');
        }

        return {
          success: true,
          estimateId: Date.now().toString(),
          calculations: estimateData
        };
      }
    );
  }

  /**
   * Получение статистики кэширования
   *
   * @example
   * ```typescript
   * const stats = await estimateService.getCacheStatistics();
   * console.log('Hit rate:', stats.hitRate);
   * ```
   */
  async getCacheStatistics() {
    return this.enhancedCacheService.getStats();
  }

  /**
   * Очистка кэша для конкретной сметы
   *
   * @param estimateId ID сметы
   * @example
   * ```typescript
   * await estimateService.clearEstimateCache('123');
   * ```
   */
  async clearEstimateCache(estimateId: string) {
    await this.enhancedCacheService.delByTag(`estimate:${estimateId}`);
    await this.enhancedCacheService.del(`estimate:${estimateId}`);
  }
}
