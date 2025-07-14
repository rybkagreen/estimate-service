import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../shared/cache/enhanced-cache.service';

export interface FSBTSPriceData {
  code: string;
  name: string;
  unit: string;
  laborCost: number;
  materialCost: number;
  machineCost: number;
  description?: string;
  category?: string;
}

export interface RegionalCoefficient {
  regionCode: string;
  laborCoefficient: number;
  materialCoefficient: number;
  machineCoefficient: number;
  overheadCoefficient: number;
  profitCoefficient: number;
}

export interface CalculationResult {
  basePrice: number;
  laborCost: number;
  materialCost: number;
  machineCost: number;
  overheadCost: number;
  profitCost: number;
  totalCost: number;
  appliedCoefficients: Record<string, number>;
}

/**
 * Сервис для работы с ценами ФСБЦ-2022
 * Обеспечивает расчеты по федеральным сметным базовым ценам
 */
@Injectable()
export class FSBTSPricingService {
  private readonly logger = new Logger(FSBTSPricingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Получить базовую цену по коду ФСБЦ-2022
   */
  async getBasePrice(fsbtsCode: string): Promise<FSBTSPriceData | null> {
    const cacheKey = `fsbts:price:${fsbtsCode}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // В реальной реализации здесь будет запрос к базе данных ФСБЦ
        // Для демонстрации используем моковые данные
        const mockPrices: Record<string, FSBTSPriceData> = {
          '01.02.03-123.4567': {
            code: '01.02.03-123.4567',
            name: 'Разработка грунта экскаватором',
            unit: 'м3',
            laborCost: 125.50,
            materialCost: 0,
            machineCost: 456.80,
            category: 'Земляные работы',
          },
          '08.01.01-001.0001': {
            code: '08.01.01-001.0001',
            name: 'Устройство бетонной подготовки',
            unit: 'м3',
            laborCost: 245.30,
            materialCost: 3450.00,
            machineCost: 125.60,
            category: 'Бетонные работы',
          },
        };

        return mockPrices[fsbtsCode] || null;
      },
      { ttl: 86400 } // 24 часа
    );
  }

  /**
   * Получить региональные коэффициенты
   */
  async getRegionalCoefficients(regionCode: string): Promise<RegionalCoefficient> {
    const cacheKey = `fsbts:coefficients:${regionCode}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // В реальной реализации здесь будет запрос к базе данных
        const mockCoefficients: Record<string, RegionalCoefficient> = {
          '77': { // Москва
            regionCode: '77',
            laborCoefficient: 1.15,
            materialCoefficient: 1.10,
            machineCoefficient: 1.12,
            overheadCoefficient: 1.18,
            profitCoefficient: 1.20,
          },
          '78': { // Санкт-Петербург
            regionCode: '78',
            laborCoefficient: 1.12,
            materialCoefficient: 1.08,
            machineCoefficient: 1.10,
            overheadCoefficient: 1.15,
            profitCoefficient: 1.18,
          },
          'default': {
            regionCode: 'default',
            laborCoefficient: 1.0,
            materialCoefficient: 1.0,
            machineCoefficient: 1.0,
            overheadCoefficient: 1.0,
            profitCoefficient: 1.0,
          },
        };

        return mockCoefficients[regionCode] || mockCoefficients['default'];
      },
      { ttl: 86400 } // 24 часа
    );
  }

  /**
   * Рассчитать стоимость позиции с учетом всех коэффициентов
   */
  async calculateItemCost(
    fsbtsCode: string,
    quantity: number,
    regionCode: string,
    additionalCoefficients: Record<string, number> = {}
  ): Promise<CalculationResult | null> {
    try {
      // Получаем базовую цену
      const basePrice = await this.getBasePrice(fsbtsCode);
      if (!basePrice) {
        this.logger.warn(`Базовая цена для кода ${fsbtsCode} не найдена`);
        return null;
      }

      // Получаем региональные коэффициенты
      const regionalCoeff = await this.getRegionalCoefficients(regionCode);

      // Применяем коэффициенты
      const laborCost = basePrice.laborCost * quantity * regionalCoeff.laborCoefficient;
      const materialCost = basePrice.materialCost * quantity * regionalCoeff.materialCoefficient;
      const machineCost = basePrice.machineCost * quantity * regionalCoeff.machineCoefficient;

      // Базовая стоимость
      const baseCost = laborCost + materialCost + machineCost;

      // Накладные расходы (обычно процент от ФОТ)
      const overheadPercentage = 0.95; // 95% от ФОТ
      const overheadCost = laborCost * overheadPercentage * regionalCoeff.overheadCoefficient;

      // Сметная прибыль (обычно процент от ФОТ)
      const profitPercentage = 0.65; // 65% от ФОТ
      const profitCost = laborCost * profitPercentage * regionalCoeff.profitCoefficient;

      // Применяем дополнительные коэффициенты
      let totalCost = baseCost + overheadCost + profitCost;
      const appliedCoefficients: Record<string, number> = {
        regional_labor: regionalCoeff.laborCoefficient,
        regional_material: regionalCoeff.materialCoefficient,
        regional_machine: regionalCoeff.machineCoefficient,
        regional_overhead: regionalCoeff.overheadCoefficient,
        regional_profit: regionalCoeff.profitCoefficient,
      };

      // Применяем дополнительные коэффициенты
      for (const [key, value] of Object.entries(additionalCoefficients)) {
        totalCost *= value;
        appliedCoefficients[key] = value;
      }

      return {
        basePrice: baseCost / quantity,
        laborCost,
        materialCost,
        machineCost,
        overheadCost,
        profitCost,
        totalCost,
        appliedCoefficients,
      };
    } catch (error) {
      this.logger.error('Ошибка при расчете стоимости позиции', error);
      throw error;
    }
  }

  /**
   * Рассчитать итоговую стоимость сметы
   */
  async calculateEstimateTotal(
    estimateId: string,
    regionCode: string
  ): Promise<CalculationResult> {
    try {
      const estimate = await this.prisma.estimate.findUnique({
        where: { id: estimateId },
        include: {
          items: true,
        },
      });

      if (!estimate) {
        throw new Error(`Смета ${estimateId} не найдена`);
      }

      let totalLaborCost = 0;
      let totalMaterialCost = 0;
      let totalMachineCost = 0;
      let totalOverheadCost = 0;
      let totalProfitCost = 0;

      // Рассчитываем стоимость каждой позиции
      for (const item of estimate.items) {
        if (item.fsbtsCode) {
          const itemCost = await this.calculateItemCost(
            item.fsbtsCode,
            item.quantity,
            regionCode,
            item.additionalCoefficients as Record<string, number>
          );

          if (itemCost) {
            totalLaborCost += itemCost.laborCost;
            totalMaterialCost += itemCost.materialCost;
            totalMachineCost += itemCost.machineCost;
            totalOverheadCost += itemCost.overheadCost;
            totalProfitCost += itemCost.profitCost;
          }
        }
      }

      const totalCost = totalLaborCost + totalMaterialCost + totalMachineCost + 
                       totalOverheadCost + totalProfitCost;

      // Обновляем смету в базе данных
      await this.prisma.estimate.update({
        where: { id: estimateId },
        data: {
          laborCost: totalLaborCost,
          materialCost: totalMaterialCost,
          overheadCost: totalOverheadCost,
          profitCost: totalProfitCost,
          totalCost,
        },
      });

      return {
        basePrice: totalLaborCost + totalMaterialCost + totalMachineCost,
        laborCost: totalLaborCost,
        materialCost: totalMaterialCost,
        machineCost: totalMachineCost,
        overheadCost: totalOverheadCost,
        profitCost: totalProfitCost,
        totalCost,
        appliedCoefficients: {},
      };
    } catch (error) {
      this.logger.error('Ошибка при расчете итогов сметы', error);
      throw error;
    }
  }

  /**
   * Проверить актуальность цен ФСБЦ
   */
  async checkPriceActuality(fsbtsCode: string): Promise<boolean> {
    // В реальной реализации здесь будет проверка даты последнего обновления
    return true;
  }

  /**
   * Импортировать цены из файла ФСБЦ
   */
  async importPricesFromFile(filePath: string): Promise<number> {
    // В реальной реализации здесь будет парсинг и импорт файла
    this.logger.log(`Импорт цен из файла: ${filePath}`);
    return 0;
  }
}
