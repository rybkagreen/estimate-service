import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../shared/cache/cache.service';
import { CacheService as EnhancedCacheService } from '../../shared/cache/enhanced-cache.service';
import { CircuitBreakerService } from '../../shared/circuit-breaker/circuit-breaker.service';
import { EstimateStreamingService } from '../../shared/streaming/streaming.service';
import { CreateEstimateDto, UpdateEstimateDto, EstimateFilterDto } from './dto';
import { EstimateStatus, Prisma } from '@prisma/client';
import { transformDecimalFields } from '../../common/utils/decimal.utils';

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
   * Получение всех смет с фильтрацией, пагинацией и кэшированием
   *
   * @example
   * ```typescript
   * const estimates = await estimateService.findAll({ status: [EstimateStatus.APPROVED], page: 1 });
   * ```
   */
  async findAll(filter: EstimateFilterDto = {}) {
    const cacheKey = `estimates:list:${JSON.stringify(filter)}`;

    return this.enhancedCacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          const where: Prisma.EstimateWhereInput = {};

          // Применяем фильтры
          if (filter.projectId) {
            where.projectId = filter.projectId;
          }

          if (filter.status && filter.status.length > 0) {
            where.status = { in: filter.status };
          }

          if (filter.createdById) {
            where.createdById = filter.createdById;
          }

          if (filter.dateFrom || filter.dateTo) {
            where.createdAt = {};
            if (filter.dateFrom) {
              where.createdAt.gte = new Date(filter.dateFrom);
            }
            if (filter.dateTo) {
              where.createdAt.lte = new Date(filter.dateTo);
            }
          }

          if (filter.minCost !== undefined || filter.maxCost !== undefined) {
            where.totalCost = {};
            if (filter.minCost !== undefined) {
              where.totalCost.gte = filter.minCost;
            }
            if (filter.maxCost !== undefined) {
              where.totalCost.lte = filter.maxCost;
            }
          }

          if (filter.search) {
            where.OR = [
              { name: { contains: filter.search, mode: 'insensitive' } },
              { description: { contains: filter.search, mode: 'insensitive' } },
            ];
          }

          // Подсчет общего количества
          const total = await this.prisma.estimate.count({ where });

          // Сортировка
          const orderBy: any = {};
          orderBy[filter.sortBy || 'createdAt'] = filter.sortOrder || 'desc';

          // Пагинация
          const page = filter.page || 1;
          const pageSize = filter.pageSize || 20;
          const skip = (page - 1) * pageSize;

          // Получение данных
          const estimates = await this.prisma.estimate.findMany({
            where,
            orderBy,
            skip,
            take: pageSize,
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  status: true,
                },
              },
              createdBy: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
              approvedBy: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
              _count: {
                select: {
                  items: true,
                },
              },
            },
          });

          return {
            data: estimates.map(estimate =>
              transformDecimalFields(estimate, ['laborCostPerHour', 'materialCost', 'laborCost', 'overheadCost', 'profitCost', 'totalCost'])
            ),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
          };
        } catch (error) {
          throw new InternalServerErrorException('Ошибка при получении списка смет');
        }
      },
      { ttl: 300 } // 5 минут
    );
  }

  /**
   * Получение сметы по ID
   *
   * @param id - ID сметы
   * @example
   * ```typescript
   * const estimate = await estimateService.findOne('estimate-id');
   * ```
   */
  async findOne(id: string) {
    const cacheKey = this.cacheService.generateEstimateCacheKey(id);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          const estimate = await this.prisma.estimate.findUnique({
            where: { id },
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  status: true,
                  location: true,
                  regionCode: true,
                },
              },
              createdBy: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
              approvedBy: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
              items: {
                orderBy: {
                  sortOrder: 'asc',
                },
              },
              _count: {
                select: {
                  items: true,
                  versions: true,
                },
              },
            },
          });

          if (!estimate) {
            throw new NotFoundException(`Смета с ID ${id} не найдена`);
          }

          return transformDecimalFields(estimate, ['laborCostPerHour', 'materialCost', 'laborCost', 'overheadCost', 'profitCost', 'totalCost']);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw error;
          }
          throw new InternalServerErrorException('Ошибка при получении сметы');
        }
      },
      600000, // 10 минут
    );
  }

  /**
   * Создание новой сметы
   *
   * @param createEstimateDto - Данные для создания сметы
   * @param userId - ID пользователя, создающего смету
   * @example
   * ```typescript
   * const estimate = await estimateService.create({
   *   name: 'Новая смета',
   *   projectId: 'project-id'
   * }, 'user-id');
   * ```
   */
  async create(createEstimateDto: CreateEstimateDto, userId: string) {
    try {
      // Проверяем существование проекта
      const project = await this.prisma.project.findUnique({
        where: { id: createEstimateDto.projectId },
      });

      if (!project) {
        throw new NotFoundException('Проект не найден');
      }

      // Создаем смету
      const estimate = await this.prisma.estimate.create({
        data: {
          ...createEstimateDto,
          createdById: userId,
          status: EstimateStatus.DRAFT,
          materialCost: 0,
          laborCost: 0,
          overheadCost: 0,
          profitCost: 0,
          totalCost: 0,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      // Очищаем кэш списка смет
      await this.enhancedCacheService.delByTag('estimates:list:*');

      return transformDecimalFields(estimate, ['laborCostPerHour', 'materialCost', 'laborCost', 'overheadCost', 'profitCost', 'totalCost']);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при создании сметы');
    }
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
async calculateIntermediateResults(estimateId: string, parameters: Record<string, unknown>) {
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
async callExternalEstimateAPI(estimateData: Record<string, unknown>) {
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
