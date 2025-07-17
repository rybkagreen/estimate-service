import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FerService } from '../modules/fer/fer.service';
import { TerService } from '../modules/ter/ter.service';
import { GesnService } from '../modules/gesn/gesn.service';
import { TsnService } from '../modules/tsn/tsn.service';
import { FsscService } from '../modules/fssc/fssc.service';
import { PrismaService } from '../prisma/prisma.service';

export interface SyncStatus {
  service: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  lastSync?: Date;
  error?: string;
  recordsProcessed?: number;
}

@Injectable()
export class NormativeCollectorService {
  private readonly logger = new Logger(NormativeCollectorService.name);
  private syncStatus: Map<string, SyncStatus> = new Map();
  private isSyncing = false;

  constructor(
    private readonly ferService: FerService,
    private readonly terService: TerService,
    private readonly gesnService: GesnService,
    private readonly tsnService: TsnService,
    private readonly fsscService: FsscService,
    private readonly prisma: PrismaService
  ) {
    this.initializeSyncStatus();
  }

  private initializeSyncStatus() {
    const services = ['FER', 'TER', 'GESN', 'TSN', 'FSSC', 'TSSC'];
    services.forEach(service => {
      this.syncStatus.set(service, {
        service,
        status: 'pending',
      });
    });
  }

  /**
   * Ежедневная синхронизация нормативных данных
   * Запускается каждый день в 3:00 ночи
   */
  @Cron('0 3 * * *')
  async scheduledSync() {
    this.logger.log('Запуск плановой синхронизации нормативных данных');
    await this.syncAllNormativeData();
  }

  /**
   * Полная синхронизация всех нормативных баз данных
   */
  async syncAllNormativeData(): Promise<void> {
    if (this.isSyncing) {
      this.logger.warn('Синхронизация уже запущена');
      return;
    }

    this.isSyncing = true;
    this.logger.log('Начало полной синхронизации нормативных данных');

    try {
      // Синхронизация ГЭСН
      await this.syncService('GESN', async () => {
        const data = await this.gesnService.getGesnData();
        return data.length;
      });

      // Синхронизация ФЕР
      await this.syncService('FER', async () => {
        const data = await this.ferService.getFerData();
        return data.length;
      });

      // Синхронизация ТЕР (для основных регионов)
      const regions = ['77', '78', '23', '66', '16', '52']; // Москва, СПб, Краснодар, Екатеринбург, Татарстан, Нижний Новгород
      for (const regionCode of regions) {
        await this.syncService(`TER-${regionCode}`, async () => {
          const data = await this.terService.getTerData(regionCode);
          return data.length;
        });
      }

      // Синхронизация ТСН
      await this.syncService('TSN', async () => {
        await this.tsnService.syncTsnData();
        return 0; // TSN service doesn't return count yet
      });

      // Синхронизация ФССЦ
      await this.syncService('FSSC', async () => {
        await this.fsscService.syncFsscData();
        return 0; // FSSC service doesn't return count yet
      });

      // Синхронизация ТССЦ для основных регионов
      for (const regionCode of regions) {
        await this.syncService(`TSSC-${regionCode}`, async () => {
          await this.fsscService.syncTsscData(regionCode);
          return 0; // TSSC service doesn't return count yet
        });
      }

      // Обновление коэффициентов
      await this.updateIndexCoefficients();

      this.logger.log('Полная синхронизация нормативных данных завершена');
    } catch (error) {
      this.logger.error('Ошибка при синхронизации нормативных данных', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Синхронизация конкретного сервиса с обработкой ошибок
   */
  private async syncService(serviceName: string, syncFunction: () => Promise<number>): Promise<void> {
    const status = this.syncStatus.get(serviceName) || { service: serviceName, status: 'pending' };
    
    try {
      this.logger.log(`Начало синхронизации ${serviceName}`);
      status.status = 'running';
      this.syncStatus.set(serviceName, status);

      const recordsProcessed = await syncFunction();

      status.status = 'completed';
      status.lastSync = new Date();
      status.recordsProcessed = recordsProcessed;
      status.error = undefined;
      this.syncStatus.set(serviceName, status);

      this.logger.log(`Синхронизация ${serviceName} завершена. Обработано записей: ${recordsProcessed}`);
    } catch (error) {
      status.status = 'failed';
      status.error = error.message;
      this.syncStatus.set(serviceName, status);

      this.logger.error(`Ошибка при синхронизации ${serviceName}:`, error);
    }
  }

  /**
   * Обновление индексных коэффициентов
   */
  private async updateIndexCoefficients(): Promise<void> {
    this.logger.log('Обновление индексных коэффициентов');

    try {
      // Получаем текущий квартал
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      const year = now.getFullYear();
      const targetPeriod = `${year}-Q${quarter}`;

      // Примерные коэффициенты для демонстрации
      const coefficients = [
        // Москва
        { regionCode: '77', regionName: 'г. Москва', labor: 1.25, material: 1.18, machine: 1.15 },
        // Санкт-Петербург
        { regionCode: '78', regionName: 'г. Санкт-Петербург', labor: 1.22, material: 1.16, machine: 1.14 },
        // Краснодарский край
        { regionCode: '23', regionName: 'Краснодарский край', labor: 0.98, material: 0.95, machine: 0.97 },
        // Свердловская область
        { regionCode: '66', regionName: 'Свердловская область', labor: 1.08, material: 1.05, machine: 1.06 },
      ];

      for (const coef of coefficients) {
        // Коэффициент для труда
        await this.prisma.indexCoefficient.upsert({
          where: {
            coefficientType_basePeriod_targetPeriod_regionCode_constructionType: {
              coefficientType: 'labor',
              basePeriod: '2001',
              targetPeriod,
              regionCode: coef.regionCode,
              constructionType: null,
            },
          },
          update: {
            coefficientValue: coef.labor,
            regionName: coef.regionName,
            updatedAt: new Date(),
          },
          create: {
            coefficientType: 'labor',
            basePeriod: '2001',
            targetPeriod,
            regionCode: coef.regionCode,
            regionName: coef.regionName,
            coefficientValue: coef.labor,
            calculationMethod: 'Индекс изменения оплаты труда в строительстве',
            validFrom: new Date(),
            isActive: true,
          },
        });

        // Коэффициент для материалов
        await this.prisma.indexCoefficient.upsert({
          where: {
            coefficientType_basePeriod_targetPeriod_regionCode_constructionType: {
              coefficientType: 'material',
              basePeriod: '2001',
              targetPeriod,
              regionCode: coef.regionCode,
              constructionType: null,
            },
          },
          update: {
            coefficientValue: coef.material,
            regionName: coef.regionName,
            updatedAt: new Date(),
          },
          create: {
            coefficientType: 'material',
            basePeriod: '2001',
            targetPeriod,
            regionCode: coef.regionCode,
            regionName: coef.regionName,
            coefficientValue: coef.material,
            calculationMethod: 'Индекс цен производителей строительных материалов',
            validFrom: new Date(),
            isActive: true,
          },
        });

        // Коэффициент для машин
        await this.prisma.indexCoefficient.upsert({
          where: {
            coefficientType_basePeriod_targetPeriod_regionCode_constructionType: {
              coefficientType: 'machine',
              basePeriod: '2001',
              targetPeriod,
              regionCode: coef.regionCode,
              constructionType: null,
            },
          },
          update: {
            coefficientValue: coef.machine,
            regionName: coef.regionName,
            updatedAt: new Date(),
          },
          create: {
            coefficientType: 'machine',
            basePeriod: '2001',
            targetPeriod,
            regionCode: coef.regionCode,
            regionName: coef.regionName,
            coefficientValue: coef.machine,
            calculationMethod: 'Индекс цен на эксплуатацию строительных машин',
            validFrom: new Date(),
            isActive: true,
          },
        });
      }

      this.logger.log('Индексные коэффициенты обновлены');
    } catch (error) {
      this.logger.error('Ошибка при обновлении индексных коэффициентов:', error);
    }
  }

  /**
   * Получение статуса синхронизации
   */
  getSyncStatus(): SyncStatus[] {
    return Array.from(this.syncStatus.values());
  }

  /**
   * Ручной запуск синхронизации конкретной базы
   */
  async syncSpecificDatabase(databaseType: string): Promise<void> {
    this.logger.log(`Ручной запуск синхронизации ${databaseType}`);

    switch (databaseType.toUpperCase()) {
      case 'GESN':
        await this.syncService('GESN', async () => {
          const data = await this.gesnService.getGesnData();
          return data.length;
        });
        break;
      case 'FER':
        await this.syncService('FER', async () => {
          const data = await this.ferService.getFerData();
          return data.length;
        });
        break;
      case 'TSN':
        await this.syncService('TSN', async () => {
          await this.tsnService.syncTsnData();
          return 0;
        });
        break;
      case 'FSSC':
        await this.syncService('FSSC', async () => {
          await this.fsscService.syncFsscData();
          return 0;
        });
        break;
      default:
        throw new Error(`Неизвестный тип базы данных: ${databaseType}`);
    }
  }
}
