import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FgisCSApiService } from './fgis-cs-api.service';
import { FgisCSParserService } from './fgis-cs-parser.service';
import { FgisSyncStatus, FgisDataType } from './constants/fgis-cs.constants';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Сервис для синхронизации данных из ФГИС ЦС с локальной базой данных
 */
@Injectable()
export class FgisCSDataSyncService {
  private readonly logger = new Logger(FgisCSDataSyncService.name);
  private readonly dataDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly apiService: FgisCSApiService,
    private readonly parserService: FgisCSParserService,
  ) {
    this.dataDir = path.join(__dirname, 'data');
  }

  /**
   * Синхронизировать все данные из ФГИС ЦС
   */
  async syncAllData(): Promise<{
    status: FgisSyncStatus;
    syncedTypes: FgisDataType[];
    errors: any[];
  }> {
    const syncedTypes: FgisDataType[] = [];
    const errors: any[] = [];
    let overallStatus = FgisSyncStatus.COMPLETED;

    try {
      // Синхронизация КСР (Классификатор строительных ресурсов)
      try {
        await this.syncKSRData();
        syncedTypes.push(FgisDataType.KSR);
      } catch (error) {
        errors.push({ type: FgisDataType.KSR, error: error.message });
        overallStatus = FgisSyncStatus.PARTIAL;
      }

      // Синхронизация ценовых зон
      try {
        await this.syncPriceZones();
        syncedTypes.push(FgisDataType.PRICE_ZONES);
      } catch (error) {
        errors.push({ type: FgisDataType.PRICE_ZONES, error: error.message });
        overallStatus = FgisSyncStatus.PARTIAL;
      }

      // Синхронизация данных по оплате труда
      try {
        await this.syncLaborCosts();
        syncedTypes.push(FgisDataType.LABOR_COSTS);
      } catch (error) {
        errors.push({ type: FgisDataType.LABOR_COSTS, error: error.message });
        overallStatus = FgisSyncStatus.PARTIAL;
      }

      // Синхронизация ФСНБ данных
      try {
        await this.syncFSNBData();
        syncedTypes.push(FgisDataType.FSNB_2022);
      } catch (error) {
        errors.push({ type: FgisDataType.FSNB_2022, error: error.message });
        overallStatus = FgisSyncStatus.PARTIAL;
      }

      // Синхронизация локальных XML файлов
      await this.syncLocalXMLData();

    } catch (error) {
      this.logger.error('Failed to sync data:', error);
      overallStatus = FgisSyncStatus.FAILED;
    }

    return {
      status: overallStatus,
      syncedTypes,
      errors,
    };
  }

  /**
   * Синхронизировать данные КСР
   */
  private async syncKSRData(): Promise<void> {
    this.logger.log('Syncing KSR data...');
    
    const ksrData = await this.apiService.getConstructionResourcesClassifier();
    
    // Сохраняем в базу данных
    for (const resource of ksrData) {
      await this.prisma.constructionResource.upsert({
        where: { code: resource.code },
        update: {
          name: resource.name,
          unit: resource.unit,
          category: resource.category,
          subcategory: resource.subcategory,
          description: resource.description,
          updatedAt: new Date(),
        },
        create: {
          code: resource.code,
          name: resource.name,
          unit: resource.unit,
          category: resource.category,
          subcategory: resource.subcategory,
          description: resource.description,
        },
      });
    }
    
    this.logger.log(`Synced ${ksrData.length} KSR resources`);
  }

  /**
   * Синхронизировать ценовые зоны
   */
  private async syncPriceZones(): Promise<void> {
    this.logger.log('Syncing price zones...');
    
    const priceZones = await this.apiService.getPriceZones();
    
    for (const zone of priceZones) {
      await this.prisma.priceZone.upsert({
        where: {
          regionCode_zoneCode: {
            regionCode: zone.regionCode,
            zoneCode: zone.zoneCode,
          },
        },
        update: {
          regionName: zone.regionName,
          zoneName: zone.zoneName,
          coefficient: zone.coefficient,
          updatedAt: new Date(),
        },
        create: {
          regionCode: zone.regionCode,
          regionName: zone.regionName,
          zoneCode: zone.zoneCode,
          zoneName: zone.zoneName,
          coefficient: zone.coefficient,
        },
      });
    }
    
    this.logger.log(`Synced ${priceZones.length} price zones`);
  }

  /**
   * Синхронизировать данные по оплате труда
   */
  private async syncLaborCosts(): Promise<void> {
    this.logger.log('Syncing labor costs...');
    
    const laborCosts = await this.apiService.getLaborCosts();
    
    for (const cost of laborCosts) {
      await this.prisma.laborCost.upsert({
        where: {
          regionCode_year_month_category: {
            regionCode: cost.regionCode,
            year: cost.year,
            month: cost.month,
            category: cost.category,
          },
        },
        update: {
          regionName: cost.regionName,
          averageSalary: cost.averageSalary,
          updatedAt: new Date(),
        },
        create: {
          regionCode: cost.regionCode,
          regionName: cost.regionName,
          year: cost.year,
          month: cost.month,
          averageSalary: cost.averageSalary,
          category: cost.category,
        },
      });
    }
    
    this.logger.log(`Synced ${laborCosts.length} labor cost records`);
  }

  /**
   * Синхронизировать данные ФСНБ
   */
  private async syncFSNBData(): Promise<void> {
    this.logger.log('Syncing FSNB data...');
    
    const fsnbData = await this.apiService.getFSNBData('2022');
    
    for (const item of fsnbData) {
      await this.prisma.priceBase.upsert({
        where: { code: item.code },
        update: {
          name: item.name,
          unit: item.unit,
          laborCost: item.laborCost,
          materialCost: item.materialCost,
          machineCost: item.machineCost,
          totalCost: item.totalCost,
          category: item.category,
          year: item.year,
          updatedAt: new Date(),
        },
        create: {
          code: item.code,
          name: item.name,
          unit: item.unit,
          laborCost: item.laborCost,
          materialCost: item.materialCost,
          machineCost: item.machineCost,
          totalCost: item.totalCost,
          category: item.category,
          year: item.year,
          type: 'FSNB',
        },
      });
    }
    
    this.logger.log(`Synced ${fsnbData.length} FSNB items`);
  }

  /**
   * Синхронизировать локальные XML файлы из папки data
   */
  private async syncLocalXMLData(): Promise<void> {
    this.logger.log('Syncing local XML data...');
    
    try {
      const files = await fs.readdir(this.dataDir);
      const xmlFiles = files.filter(file => file.endsWith('.xml'));
      
      for (const file of xmlFiles) {
        await this.processLocalXMLFile(file);
      }
      
      this.logger.log(`Processed ${xmlFiles.length} local XML files`);
    } catch (error) {
      this.logger.error('Failed to sync local XML data:', error);
    }
  }

  /**
   * Обработать локальный XML файл
   */
  private async processLocalXMLFile(fileName: string): Promise<void> {
    const filePath = path.join(this.dataDir, fileName);
    
    try {
      const xmlData = await fs.readFile(filePath, 'utf-8');
      
      // Определяем тип файла по имени
      if (fileName.startsWith('ГЭСН')) {
        await this.processGESNFile(xmlData, fileName);
      } else if (fileName.startsWith('ФСБЦ')) {
        await this.processFSBTSFile(xmlData, fileName);
      } else if (fileName.includes('База ТГ')) {
        await this.processTechGroupsFile(xmlData);
      }
    } catch (error) {
      this.logger.error(`Failed to process file ${fileName}:`, error);
    }
  }

  /**
   * Обработать файл ГЭСН
   */
  private async processGESNFile(xmlData: string, fileName: string): Promise<void> {
    let type: 'GESN' | 'GESN_M' | 'GESN_MR' | 'GESN_P' | 'GESN_R' = 'GESN';
    
    if (fileName.includes('ГЭСНм')) type = 'GESN_M';
    else if (fileName.includes('ГЭСНмр')) type = 'GESN_MR';
    else if (fileName.includes('ГЭСНп')) type = 'GESN_P';
    else if (fileName.includes('ГЭСНр')) type = 'GESN_R';
    
    const gesnData = await this.parserService.parseGESNData(xmlData, type);
    
    // Сохраняем в базу данных
    for (const item of gesnData) {
      await this.prisma.gESN.upsert({
        where: { code: item.code },
        update: {
          name: item.name,
          unit: item.unit,
          laborHours: item.laborHours,
          type: type,
          updatedAt: new Date(),
        },
        create: {
          code: item.code,
          name: item.name,
          unit: item.unit,
          laborHours: item.laborHours,
          type: type,
        },
      });
    }
    
    this.logger.log(`Processed ${gesnData.length} ${type} items from ${fileName}`);
  }

  /**
   * Обработать файл ФСБЦ
   */
  private async processFSBTSFile(xmlData: string, fileName: string): Promise<void> {
    const type = fileName.includes('Мат&Оборуд') ? 'materials' : 'machines';
    const fsbtsData = await this.parserService.parseFSBTSData(xmlData, type);
    
    if (type === 'materials') {
      for (const item of fsbtsData) {
        await this.prisma.material.upsert({
          where: { code: item.code },
          update: {
            name: item.name,
            unit: item.unit,
            price: item.price,
            category: item.category,
            supplier: item.supplier,
            updatedAt: new Date(),
          },
          create: {
            code: item.code,
            name: item.name,
            unit: item.unit,
            price: item.price,
            category: item.category,
            supplier: item.supplier,
          },
        });
      }
    } else {
      for (const item of fsbtsData) {
        await this.prisma.machine.upsert({
          where: { code: item.code },
          update: {
            name: item.name,
            unit: item.unit,
            hourlyRate: item.hourlyRate,
            category: item.category,
            updatedAt: new Date(),
          },
          create: {
            code: item.code,
            name: item.name,
            unit: item.unit,
            hourlyRate: item.hourlyRate,
            category: item.category,
          },
        });
      }
    }
    
    this.logger.log(`Processed ${fsbtsData.length} ${type} items from ${fileName}`);
  }

  /**
   * Обработать файл технологических групп
   */
  private async processTechGroupsFile(xmlData: string): Promise<void> {
    const techGroups = await this.parserService.parseTechGroupsData(xmlData);
    
    for (const group of techGroups) {
      await this.prisma.techGroup.upsert({
        where: { code: group.code },
        update: {
          name: group.name,
          description: group.description,
          updatedAt: new Date(),
        },
        create: {
          code: group.code,
          name: group.name,
          description: group.description,
        },
      });
    }
    
    this.logger.log(`Processed ${techGroups.length} technology groups`);
  }

  /**
   * Получить статистику синхронизации
   */
  async getSyncStatistics(): Promise<any> {
    const stats = await this.prisma.$transaction([
      this.prisma.constructionResource.count(),
      this.prisma.priceZone.count(),
      this.prisma.laborCost.count(),
      this.prisma.priceBase.count(),
      this.prisma.gESN.count(),
      this.prisma.material.count(),
      this.prisma.machine.count(),
      this.prisma.techGroup.count(),
    ]);

    return {
      constructionResources: stats[0],
      priceZones: stats[1],
      laborCosts: stats[2],
      priceBase: stats[3],
      gesn: stats[4],
      materials: stats[5],
      machines: stats[6],
      techGroups: stats[7],
      lastSync: new Date(),
    };
  }
}
