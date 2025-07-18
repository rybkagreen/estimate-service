import { Injectable, Logger } from '@nestjs/common';
import { RegionalCacheService } from './regional-cache.service';
import { 
  RegionalCoefficient, 
  RegionalZone,
  FsbcCategory,
  FsbcDocumentType 
} from '@ez-eco/shared-contracts';

/**
 * Централизованный сервис для управления региональными коэффициентами
 * Устраняет дублирование логики между data-collector и estimate-service
 */
@Injectable()
export class RegionalCoefficientsService {
  private readonly logger = new Logger(RegionalCoefficientsService.name);

  constructor(
    private readonly cacheService: RegionalCacheService
  ) {}

  /**
   * Получение коэффициента для региона с учетом категории и типа документа
   */
  async getCoefficient(
    regionCode: string,
    category?: FsbcCategory,
    type?: FsbcDocumentType,
    date?: Date
  ): Promise<number> {
    const cacheKey = this.buildCacheKey(regionCode, category, type);
    
    // Проверяем кэш
    const cached = await this.cacheService.getCoefficient(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Если не в кэше, загружаем из БД
    const coefficient = await this.loadCoefficientFromDb(regionCode, category, type, date);
    
    // Кэшируем результат
    await this.cacheService.setCoefficient(cacheKey, coefficient);
    
    return coefficient;
  }

  /**
   * Массовое получение коэффициентов для оптимизации производительности
   */
  async getBulkCoefficients(
    requests: Array<{
      regionCode: string;
      category?: FsbcCategory;
      type?: FsbcDocumentType;
    }>
  ): Promise<Map<string, number>> {
    const results = new Map<string, number>();
    const uncachedRequests: typeof requests = [];

    // Сначала проверяем кэш
    for (const req of requests) {
      const cacheKey = this.buildCacheKey(req.regionCode, req.category, req.type);
      const cached = await this.cacheService.getCoefficient(cacheKey);
      
      if (cached !== null) {
        results.set(cacheKey, cached);
      } else {
        uncachedRequests.push(req);
      }
    }

    // Загружаем некэшированные данные
    if (uncachedRequests.length > 0) {
      const dbResults = await this.loadBulkCoefficientsFromDb(uncachedRequests);
      
      // Кэшируем и добавляем к результатам
      for (const [key, value] of dbResults) {
        await this.cacheService.setCoefficient(key, value);
        results.set(key, value);
      }
    }

    return results;
  }

  /**
   * Получение всех активных региональных зон
   */
  async getRegionalZones(): Promise<RegionalZone[]> {
    const cached = await this.cacheService.getZones();
    if (cached) {
      return cached;
    }

    const zones = await this.loadZonesFromDb();
    await this.cacheService.setZones(zones);
    
    return zones;
  }

  /**
   * Обновление коэффициента с инвалидацией кэша
   */
  async updateCoefficient(
    regionCode: string,
    coefficient: number,
    category?: FsbcCategory,
    type?: FsbcDocumentType
  ): Promise<void> {
    const cacheKey = this.buildCacheKey(regionCode, category, type);
    
    // Обновляем в БД
    await this.updateCoefficientInDb(regionCode, coefficient, category, type);
    
    // Инвалидируем кэш
    await this.cacheService.invalidateCoefficient(cacheKey);
    
    this.logger.log(`Updated coefficient for ${regionCode}: ${coefficient}`);
  }

  /**
   * Инвалидация всего кэша региональных данных
   */
  async invalidateCache(): Promise<void> {
    await this.cacheService.invalidateAll();
    this.logger.log('Regional cache invalidated');
  }

  /**
   * Построение ключа кэша
   */
  private buildCacheKey(
    regionCode: string,
    category?: FsbcCategory,
    type?: FsbcDocumentType
  ): string {
    const parts = ['coef', regionCode];
    if (category) parts.push(category);
    if (type) parts.push(type);
    return parts.join(':');
  }

  /**
   * Загрузка коэффициента из БД (заглушка - должна быть реализована в конкретном сервисе)
   */
  private async loadCoefficientFromDb(
    regionCode: string,
    category?: FsbcCategory,
    type?: FsbcDocumentType,
    date?: Date
  ): Promise<number> {
    // TODO: Implement actual DB query
    // This is a placeholder implementation
    return 1.0;
  }

  /**
   * Массовая загрузка коэффициентов из БД
   */
  private async loadBulkCoefficientsFromDb(
    requests: Array<{
      regionCode: string;
      category?: FsbcCategory;
      type?: FsbcDocumentType;
    }>
  ): Promise<Map<string, number>> {
    // TODO: Implement actual DB query
    const results = new Map<string, number>();
    
    for (const req of requests) {
      const key = this.buildCacheKey(req.regionCode, req.category, req.type);
      results.set(key, 1.0); // Placeholder
    }
    
    return results;
  }

  /**
   * Загрузка зон из БД
   */
  private async loadZonesFromDb(): Promise<RegionalZone[]> {
    // TODO: Implement actual DB query
    return [];
  }

  /**
   * Обновление коэффициента в БД
   */
  private async updateCoefficientInDb(
    regionCode: string,
    coefficient: number,
    category?: FsbcCategory,
    type?: FsbcDocumentType
  ): Promise<void> {
    // TODO: Implement actual DB update
    this.logger.log(`DB update placeholder: ${regionCode} = ${coefficient}`);
  }
}
