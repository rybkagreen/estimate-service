import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as cheerio from 'cheerio';

export interface FsscItem {
  code: string;
  name: string;
  unit: string;
  basePrice: number;
  priceWithoutVAT: number;
  transportationCost?: number;
  storageCost?: number;
  materialGroup?: string;
  materialType?: string;
  manufacturer?: string;
  gostTu?: string;
  characteristics?: string;
}

export interface TsscItem extends FsscItem {
  regionCode: string;
  regionName: string;
  localManufacturer?: string;
  deliveryConditions?: string;
}

@Injectable()
export class FsscService {
  private readonly logger = new Logger(FsscService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Синхронизация данных ФССЦ (Федеральные сборники сметных цен)
   */
  async syncFsscData(): Promise<void> {
    this.logger.log('Начинаем синхронизацию данных ФССЦ');

    try {
      const items = await this.fetchFsscData();
      
      // Сохраняем или обновляем данные в БД
      for (const item of items) {
        await this.prisma.fsscItem.upsert({
          where: {
            code_validFrom: {
              code: item.code,
              validFrom: new Date()
            }
          },
          update: {
            name: item.name,
            unit: item.unit,
            basePrice: item.basePrice,
            priceWithoutVAT: item.priceWithoutVAT,
            transportationCost: item.transportationCost || 0,
            storageCost: item.storageCost || 0,
            materialGroup: item.materialGroup,
            materialType: item.materialType,
            manufacturer: item.manufacturer,
            gstTu: item.gostTu,
            characteristics: item.characteristics,
            updatedAt: new Date()
          },
          create: {
            code: item.code,
            name: item.name,
            unit: item.unit,
            basePrice: item.basePrice,
            priceWithoutVAT: item.priceWithoutVAT,
            transportationCost: item.transportationCost || 0,
            storageCost: item.storageCost || 0,
            materialGroup: item.materialGroup,
            materialType: item.materialType,
            manufacturer: item.manufacturer,
            gstTu: item.gostTu,
            characteristics: item.characteristics,
            validFrom: new Date(),
            isActive: true,
            version: '1.0',
            source: 'minstroyrf.ru'
          }
        });
      }

      this.logger.log(`Синхронизировано ${items.length} записей ФССЦ`);
    } catch (error) {
      this.logger.error('Ошибка при синхронизации ФССЦ:', error);
      throw error;
    }
  }

  /**
   * Синхронизация данных ТССЦ (Территориальные сборники сметных цен)
   */
  async syncTsscData(regionCode: string): Promise<void> {
    this.logger.log(`Начинаем синхронизацию данных ТССЦ для региона ${regionCode}`);

    try {
      const items = await this.fetchTsscData(regionCode);
      
      // Сохраняем или обновляем данные в БД
      for (const item of items) {
        await this.prisma.tsscItem.upsert({
          where: {
            code_regionCode_validFrom: {
              code: item.code,
              regionCode: item.regionCode,
              validFrom: new Date()
            }
          },
          update: {
            name: item.name,
            unit: item.unit,
            basePrice: item.basePrice,
            priceWithoutVAT: item.priceWithoutVAT,
            transportationCost: item.transportationCost || 0,
            storageCost: item.storageCost || 0,
            materialGroup: item.materialGroup,
            materialType: item.materialType,
            localManufacturer: item.localManufacturer,
            deliveryConditions: item.deliveryConditions,
            gstTu: item.gostTu,
            characteristics: item.characteristics,
            updatedAt: new Date()
          },
          create: {
            code: item.code,
            name: item.name,
            unit: item.unit,
            basePrice: item.basePrice,
            priceWithoutVAT: item.priceWithoutVAT,
            transportationCost: item.transportationCost || 0,
            storageCost: item.storageCost || 0,
            regionCode: item.regionCode,
            regionName: item.regionName,
            materialGroup: item.materialGroup,
            materialType: item.materialType,
            localManufacturer: item.localManufacturer,
            deliveryConditions: item.deliveryConditions,
            gstTu: item.gostTu,
            characteristics: item.characteristics,
            validFrom: new Date(),
            isActive: true,
            version: '1.0',
            source: 'regional-minstroyrf'
          }
        });
      }

      this.logger.log(`Синхронизировано ${items.length} записей ТССЦ для региона ${regionCode}`);
    } catch (error) {
      this.logger.error(`Ошибка при синхронизации ТССЦ для региона ${regionCode}:`, error);
      throw error;
    }
  }

  /**
   * Получение данных ФССЦ
   */
  private async fetchFsscData(): Promise<FsscItem[]> {
    // В реальной реализации здесь будет HTTP запрос к источнику данных
    // Сейчас возвращаем тестовые данные
    return [
      {
        code: 'ФССЦ-01.1.01.01-0001',
        name: 'Портландцемент общестроительного назначения ПЦ 400-Д0',
        unit: 'т',
        basePrice: 5200,
        priceWithoutVAT: 4333.33,
        transportationCost: 150,
        storageCost: 50,
        materialGroup: 'Вяжущие материалы',
        materialType: 'Цемент',
        manufacturer: 'АО "Новоросцемент"',
        gostTu: 'ГОСТ 31108-2016',
        characteristics: 'Марка 400, без добавок'
      },
      {
        code: 'ФССЦ-01.2.01.01-0001',
        name: 'Песок природный для строительных работ средний',
        unit: 'м3',
        basePrice: 750,
        priceWithoutVAT: 625,
        transportationCost: 100,
        storageCost: 20,
        materialGroup: 'Нерудные строительные материалы',
        materialType: 'Песок',
        gostTu: 'ГОСТ 8736-2014',
        characteristics: 'Модуль крупности 2,0-2,5'
      }
    ];
  }

  /**
   * Получение данных ТССЦ для региона
   */
  private async fetchTsscData(regionCode: string): Promise<TsscItem[]> {
    // В реальной реализации здесь будет HTTP запрос к региональному источнику данных
    // Сейчас возвращаем тестовые данные
    const regionNames: Record<string, string> = {
      '77': 'г. Москва',
      '78': 'г. Санкт-Петербург',
      '23': 'Краснодарский край',
      '66': 'Свердловская область'
    };

    return [
      {
        code: `ТССЦ-${regionCode}-01.1.01.01-0001`,
        name: 'Портландцемент местного производства ПЦ 400-Д0',
        unit: 'т',
        basePrice: 4800,
        priceWithoutVAT: 4000,
        transportationCost: 100,
        storageCost: 40,
        regionCode,
        regionName: regionNames[regionCode] || 'Неизвестный регион',
        materialGroup: 'Вяжущие материалы',
        materialType: 'Цемент',
        localManufacturer: 'ООО "Региональный цементный завод"',
        deliveryConditions: 'Франко-склад покупателя',
        gostTu: 'ГОСТ 31108-2016',
        characteristics: 'Марка 400, без добавок, местное производство'
      }
    ];
  }

  /**
   * Поиск материалов в ФССЦ по группе или типу
   */
  async searchFsscByGroup(materialGroup?: string, materialType?: string): Promise<any[]> {
    const where: any = {
      isActive: true,
      validTo: {
        OR: [
          { equals: null },
          { gt: new Date() }
        ]
      }
    };

    if (materialGroup) {
      where.materialGroup = { contains: materialGroup, mode: 'insensitive' };
    }

    if (materialType) {
      where.materialType = { contains: materialType, mode: 'insensitive' };
    }

    return this.prisma.fsscItem.findMany({
      where,
      orderBy: [
        { materialGroup: 'asc' },
        { code: 'asc' }
      ],
      take: 50
    });
  }

  /**
   * Получение актуальных коэффициентов пересчета
   */
  async getIndexCoefficients(
    coefficientType: string,
    targetPeriod: string,
    regionCode?: string
  ): Promise<any[]> {
    const where: any = {
      coefficientType,
      targetPeriod,
      isActive: true
    };

    if (regionCode) {
      where.regionCode = regionCode;
    }

    return this.prisma.indexCoefficient.findMany({
      where,
      orderBy: { targetPeriod: 'desc' }
    });
  }
}
