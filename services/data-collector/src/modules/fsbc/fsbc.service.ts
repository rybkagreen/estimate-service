import { Injectable, Logger } from '@nestjs/common';
import { FerItem, FerService } from '../fer/fer.service';
import { GesnItem, GesnService } from '../gesn/gesn.service';
import { TerItem, TerService } from '../ter/ter.service';

export interface FsbcItem {
  code: string;
  name: string;
  unit: string;
  basePrice: number;
  laborCost: number;
  materialCost: number;
  machineCost: number;
  totalCost: number;
  region?: string;
  category: 'FER' | 'TER' | 'GESN';
  source: string;
  chapter?: string;
  section?: string;
  validFrom: Date;
  validTo?: Date;
  materials?: any[];
  laborConsumption?: number;
  machineTime?: number;
}

@Injectable()
export class FsbcService {
  private readonly logger = new Logger(FsbcService.name);

  constructor(
    private readonly ferService: FerService,
    private readonly terService: TerService,
    private readonly gesnService: GesnService,
  ) {}

  /**
   * Получает объединенные данные ФСБЦ-2022 из всех источников
   */
  async getFsbcData(region?: string, category?: 'FER' | 'TER' | 'GESN'): Promise<FsbcItem[]> {
    this.logger.log(`Формирование ФСБЦ-2022${region ? ` для региона: ${region}` : ''}${category ? ` категория: ${category}` : ''}`);

    const results: FsbcItem[] = [];

    try {
      // Получаем данные из ФЕР
      if (!category || category === 'FER') {
        this.logger.log('Загрузка данных ФЕР...');
        const ferData = await this.ferService.getFerData(region);

        for (const ferItem of ferData) {
          const fsbcItem = this.convertFerToFsbc(ferItem);
          results.push(fsbcItem);
        }

        this.logger.log(`Добавлено ${ferData.length} записей ФЕР`);
      }

      // Получаем данные из ТЕР
      if (!category || category === 'TER') {
        this.logger.log('Загрузка данных ТЕР...');
        const terData = await this.terService.getTerData(region);

        for (const terItem of terData) {
          const fsbcItem = this.convertTerToFsbc(terItem);
          results.push(fsbcItem);
        }

        this.logger.log(`Добавлено ${terData.length} записей ТЕР`);
      }

      // Получаем данные из ГЭСН
      if (!category || category === 'GESN') {
        this.logger.log('Загрузка данных ГЭСН...');
        const gesnData = await this.gesnService.getGesnData();

        for (const gesnItem of gesnData) {
          const fsbcItem = this.convertGesnToFsbc(gesnItem);
          results.push(fsbcItem);
        }

        this.logger.log(`Добавлено ${gesnData.length} записей ГЭСН`);
      }

      this.logger.log(`Сформирована ФСБЦ-2022: ${results.length} записей`);
      return results;

    } catch (error) {
      this.logger.error('Ошибка при формировании ФСБЦ-2022:', error);
      return [];
    }
  }

  /**
   * Поиск в ФСБЦ-2022 по коду
   */
  async getFsbcByCode(code: string, region?: string): Promise<FsbcItem | null> {
    this.logger.log(`Поиск в ФСБЦ-2022 по коду: ${code}`);

    try {
      // Проверяем все источники
      const ferItem = await this.ferService.getFerByCode(code);
      if (ferItem) {
        return this.convertFerToFsbc(ferItem);
      }

      const terItem = await this.terService.getTerByCode(code, region);
      if (terItem) {
        return this.convertTerToFsbc(terItem);
      }

      const gesnItem = await this.gesnService.getGesnByCode(code);
      if (gesnItem) {
        return this.convertGesnToFsbc(gesnItem);
      }

      this.logger.warn(`Позиция с кодом ${code} не найдена в ФСБЦ-2022`);
      return null;

    } catch (error) {
      this.logger.error(`Ошибка при поиске в ФСБЦ-2022 по коду ${code}:`, error);
      return null;
    }
  }

  /**
   * Поиск в ФСБЦ-2022 по названию работ
   */
  async searchFsbc(searchTerm: string, region?: string, category?: 'FER' | 'TER' | 'GESN'): Promise<FsbcItem[]> {
    this.logger.log(`Поиск в ФСБЦ-2022 по термину: ${searchTerm}`);

    const results: FsbcItem[] = [];

    try {
      // Поиск в ГЭСН по названию (у них есть такой метод)
      if (!category || category === 'GESN') {
        const gesnResults = await this.gesnService.searchGesnByName(searchTerm);
        for (const gesnItem of gesnResults) {
          results.push(this.convertGesnToFsbc(gesnItem));
        }
      }

      // Для ФЕР и ТЕР нужно получить все данные и отфильтровать
      if (!category || category === 'FER') {
        const ferData = await this.ferService.getFerData(region);
        const ferResults = ferData.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase())
        );

        for (const ferItem of ferResults) {
          results.push(this.convertFerToFsbc(ferItem));
        }
      }

      if (!category || category === 'TER') {
        const terData = await this.terService.getTerData(region);
        const terResults = terData.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase())
        );

        for (const terItem of terResults) {
          results.push(this.convertTerToFsbc(terItem));
        }
      }

      this.logger.log(`Найдено ${results.length} позиций в ФСБЦ-2022 по запросу: ${searchTerm}`);
      return results;

    } catch (error) {
      this.logger.error(`Ошибка при поиске в ФСБЦ-2022 по термину ${searchTerm}:`, error);
      return [];
    }
  }

  /**
   * Получение статистики ФСБЦ-2022
   */
  async getFsbcStats(region?: string): Promise<{
    total: number;
    fer: number;
    ter: number;
    gesn: number;
    byChapter: Record<string, number>;
  }> {
    this.logger.log('Получение статистики ФСБЦ-2022');

    try {
      const allData = await this.getFsbcData(region);

      const stats = {
        total: allData.length,
        fer: allData.filter(item => item.category === 'FER').length,
        ter: allData.filter(item => item.category === 'TER').length,
        gesn: allData.filter(item => item.category === 'GESN').length,
        byChapter: {} as Record<string, number>
      };

      // Подсчет по главам
      for (const item of allData) {
        if (item.chapter) {
          stats.byChapter[item.chapter] = (stats.byChapter[item.chapter] || 0) + 1;
        }
      }

      this.logger.log(`Статистика ФСБЦ-2022: ${stats.total} позиций (ФЕР: ${stats.fer}, ТЕР: ${stats.ter}, ГЭСН: ${stats.gesn})`);
      return stats;

    } catch (error) {
      this.logger.error('Ошибка при получении статистики ФСБЦ-2022:', error);
      return {
        total: 0,
        fer: 0,
        ter: 0,
        gesn: 0,
        byChapter: {}
      };
    }
  }

  /**
   * Конвертация ФЕР в формат ФСБЦ
   */
  private convertFerToFsbc(ferItem: FerItem): FsbcItem {
    return {
      code: ferItem.code,
      name: ferItem.name,
      unit: ferItem.unit,
      basePrice: ferItem.totalCost,
      laborCost: ferItem.laborCost,
      materialCost: ferItem.materialCost,
      machineCost: ferItem.machineCost,
      totalCost: ferItem.totalCost,
      region: ferItem.region,
      category: 'FER',
      source: 'ФЕР-2001',
      chapter: ferItem.chapter,
      section: ferItem.section,
      validFrom: new Date('2001-01-01'), // Дата введения ФЕР-2001
    };
  }

  /**
   * Конвертация ТЕР в формат ФСБЦ
   */
  private convertTerToFsbc(terItem: TerItem): FsbcItem {
    return {
      code: terItem.code,
      name: terItem.name,
      unit: terItem.unit,
      basePrice: terItem.totalCost,
      laborCost: terItem.laborCost,
      materialCost: terItem.materialCost,
      machineCost: terItem.machineCost,
      totalCost: terItem.totalCost,
      region: terItem.region,
      category: 'TER',
      source: `ТЕР-${terItem.region}`,
      chapter: terItem.chapter,
      section: terItem.section,
      validFrom: new Date('2001-01-01'), // Базовая дата для ТЕР
    };
  }

  /**
   * Конвертация ГЭСН в формат ФСБЦ
   */
  private convertGesnToFsbc(gesnItem: GesnItem): FsbcItem {
    // Для ГЭСН расчет стоимости должен производиться на основе трудозатрат и материалов
    const estimatedLaborCost = gesnItem.laborConsumption * 100; // Примерная стоимость чел.-час
    const estimatedMachineCost = gesnItem.machineTime * 500; // Примерная стоимость маш.-час
    const totalCost = estimatedLaborCost + estimatedMachineCost;

    return {
      code: gesnItem.code,
      name: gesnItem.name,
      unit: gesnItem.unit,
      basePrice: totalCost,
      laborCost: estimatedLaborCost,
      materialCost: 0, // В ГЭСН материалы учитываются отдельно
      machineCost: estimatedMachineCost,
      totalCost: totalCost,
      category: 'GESN',
      source: 'ГЭСН-2001',
      chapter: gesnItem.chapter,
      section: gesnItem.section,
      validFrom: new Date('2001-01-01'), // Дата введения ГЭСН-2001
      materials: gesnItem.materials,
      laborConsumption: gesnItem.laborConsumption,
      machineTime: gesnItem.machineTime,
    };
  }
}
