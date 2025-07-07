/**
 * Сервис-агрегатор для сбора и ETL-обработки данных ФСБЦ-2022
 * Согласно ROADMAP Этап 1.1 - Система сбора данных ФСБЦ-2022
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinstroyParserService } from './minstroyrf-parser.service';
import { RegionalDataService } from './regional-data.service';
import { NormativesParserService } from './normatives-parser.service';
import { MarketPricesService } from './market-prices.service';

import { CollectionResult, FsbtsWorkItem, DataSource } from '../types/common.types';

@Injectable()
export class FsbtsCollectorService {
  private readonly logger = new Logger(FsbtsCollectorService.name);

  constructor(
    private readonly minstroyParser: MinstroyParserService,
    private readonly regionalDataService: RegionalDataService,
    private readonly normativesParser: NormativesParserService,
    private readonly marketPricesService: MarketPricesService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Полный сбор данных из всех источников
   */
  async collectAllData(): Promise<CollectionResult> {
    const overallResult: CollectionResult = {
      success: true,
      totalItems: 0,
      processedItems: 0,
      errors: [],
      source: 'all',
      timestamp: new Date(),
    };

    try {
      this.logger.log('🚀 Начало полного сбора данных ФСБЦ-2022');

      // 1. Сбор данных с сайта Минстроя РФ
      const minstroyResult = await this.collectMinstroyData();
      this.mergeResults(overallResult, minstroyResult);

      // 2. Сбор региональных данных
      const regionalResult = await this.collectRegionalData();
      this.mergeResults(overallResult, regionalResult);

      // 3. Сбор нормативных данных
      const normativeResult = await this.collectNormativeData();
      this.mergeResults(overallResult, normativeResult);

      // 4. Сбор рыночных данных
      const marketResult = await this.collectMarketPrices();
      this.mergeResults(overallResult, marketResult);

      this.logger.log(
        `✅ Сбор данных завершен. Обработано: ${overallResult.processedItems}/${overallResult.totalItems}`,
      );
    } catch (error) {
      this.logger.error('❌ Критическая ошибка при сборе данных:', error);
      overallResult.success = false;
      overallResult.errors.push(
        `Критическая ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }

    return overallResult;
  }

  /**
   * Сбор данных с сайта Минстроя РФ
   */
  private async collectMinstroyData(): Promise<CollectionResult> {
    this.logger.log('Сбор данных с сайта Минстроя РФ');

    try {
      const result = await this.minstroyParser.collectAndParseDocuments();
      return result;
    } catch (error) {
      this.logger.error('Ошибка сбора данных с сайта Минстроя:', error);
      return {
        success: false,
        totalItems: 0,
        processedItems: 0,
        errors: [error instanceof Error ? error.message : 'Неизвестная ошибка'],
        source: 'minstroyrf',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Сбор региональных данных
   */
  private async collectRegionalData(): Promise<CollectionResult> {
    this.logger.log('Сбор региональных данных');

    try {
      const regions = await this.regionalDataService.getAvailableRegions();
      const results = await Promise.all(
        regions.map(region => this.regionalDataService.collectRegionalData(region)),
      );

      const totalItems = results.reduce((sum, r) => sum + r.items.length, 0);
      const successfulItems = results.filter(r => r.success).length;
      const allErrors = results.flatMap(r => r.errors);

      return {
        success: allErrors.length === 0,
        totalItems,
        processedItems: successfulItems,
        errors: allErrors,
        source: 'regional',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Ошибка сбора региональных данных:', error);
      return {
        success: false,
        totalItems: 0,
        processedItems: 0,
        errors: [error instanceof Error ? error.message : 'Неизвестная ошибка'],
        source: 'regional',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Сбор нормативных данных
   */
  private async collectNormativeData(): Promise<CollectionResult> {
    this.logger.log('Сбор нормативных данных');

    try {
      const documents = await this.normativesParser.getAvailableDocuments();
      const results = await Promise.all(
        documents.map(doc => this.normativesParser.parseNormativeDocument(doc)),
      );

      const totalItems = results.reduce((sum, r) => sum + r.items.length, 0);
      const successfulItems = results.filter(r => r.success).length;
      const allErrors = results.flatMap(r => r.errors);

      return {
        success: allErrors.length === 0,
        totalItems,
        processedItems: successfulItems,
        errors: allErrors,
        source: 'normatives',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Ошибка сбора нормативных данных:', error);
      return {
        success: false,
        totalItems: 0,
        processedItems: 0,
        errors: [error instanceof Error ? error.message : 'Неизвестная ошибка'],
        source: 'normatives',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Сбор рыночных цен
   */
  private async collectMarketPrices(): Promise<CollectionResult> {
    this.logger.log('Сбор рыночных цен');

    try {
      const updateResult = await this.marketPricesService.updateMarketPrices();

      return {
        success: updateResult.errors.length === 0,
        totalItems: updateResult.updated,
        processedItems: updateResult.updated,
        errors: updateResult.errors,
        source: 'market',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Ошибка сбора рыночных данных:', error);
      return {
        success: false,
        totalItems: 0,
        processedItems: 0,
        errors: [error instanceof Error ? error.message : 'Неизвестная ошибка'],
        source: 'market',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Получение всех элементов ФСБЦ-2022
   */
  async getAllItems(): Promise<any[]> {
    try {
      const items = await this.prisma.fSBTSItem.findMany({
        take: 1000, // Ограничиваем количество для производительности
      });

      return items;
    } catch (error) {
      this.logger.error('Ошибка при получении всех элементов ФСБЦ:', error);
      return [];
    }
  }

  /**
   * Объединение результатов сбора
   */
  private mergeResults(target: CollectionResult, source: CollectionResult): void {
    target.totalItems += source.totalItems;
    target.processedItems += source.processedItems;
    target.errors.push(...source.errors);

    if (!source.success) {
      target.success = false;
    }
  }
}
