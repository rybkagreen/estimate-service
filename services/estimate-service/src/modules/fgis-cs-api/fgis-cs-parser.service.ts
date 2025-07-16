import { Injectable, Logger } from '@nestjs/common';
import { FgisDataType } from './constants/fgis-cs.constants';

// Временные заглушки для зависимостей, которые нужно установить
const xml2js = { Parser: class Parser { parseStringPromise(data: any) { return Promise.resolve({}); } } };
const Papa = { parse: (data: any, options: any) => ({ data: [] }) };

/**
 * Сервис для парсинга данных из ФГИС ЦС в различных форматах
 */
@Injectable()
export class FgisCSParserService {
  private readonly logger = new Logger(FgisCSParserService.name);
  private readonly xmlParser: xml2js.Parser;

  constructor() {
    this.xmlParser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      normalizeTags: true,
      explicitRoot: false,
    });
  }

  /**
   * Парсинг списка наборов данных
   */
  async parseDatasetList(xmlData: string): Promise<any[]> {
    try {
      const result = await this.xmlParser.parseStringPromise(xmlData);
      const items = result.meta?.item || [];
      return Array.isArray(items) ? items : [items];
    } catch (error) {
      this.logger.error('Failed to parse dataset list:', error);
      throw error;
    }
  }

  /**
   * Парсинг данных реестра
   */
  async parseRegistryData(data: any, type: FgisDataType): Promise<any> {
    switch (type) {
      case FgisDataType.FSNB_2020:
      case FgisDataType.FSNB_2022:
      case FgisDataType.TECH_GROUPS:
        return this.parseXMLData(data);
      
      case FgisDataType.KSR:
      case FgisDataType.PRICE_ZONES:
      case FgisDataType.LABOR_COSTS:
        return this.parseCSVData(data);
      
      default:
        return data;
    }
  }

  /**
   * Парсинг данных классификатора строительных ресурсов (КСР)
   */
  async parseKSRData(csvData: string): Promise<any[]> {
    try {
      const result = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
      });

      return result.data.map((row: any) => ({
        code: row['Код'] || row['code'],
        name: row['Наименование'] || row['name'],
        unit: row['Единица измерения'] || row['unit'],
        category: row['Категория'] || row['category'],
        subcategory: row['Подкатегория'] || row['subcategory'],
        description: row['Описание'] || row['description'],
      }));
    } catch (error) {
      this.logger.error('Failed to parse KSR data:', error);
      throw error;
    }
  }

  /**
   * Парсинг данных ценовых зон
   */
  async parsePriceZonesData(csvData: string): Promise<any[]> {
    try {
      const result = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
      });

      return result.data.map((row: any) => ({
        regionCode: row['Код региона'] || row['region_code'],
        regionName: row['Наименование региона'] || row['region_name'],
        zoneCode: row['Код зоны'] || row['zone_code'],
        zoneName: row['Наименование зоны'] || row['zone_name'],
        coefficient: parseFloat(row['Коэффициент'] || row['coefficient'] || '1.0'),
      }));
    } catch (error) {
      this.logger.error('Failed to parse price zones data:', error);
      throw error;
    }
  }

  /**
   * Парсинг данных по оплате труда
   */
  async parseLaborCostsData(csvData: string): Promise<any[]> {
    try {
      const result = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
      });

      return result.data.map((row: any) => ({
        regionCode: row['Код региона'] || row['region_code'],
        regionName: row['Наименование региона'] || row['region_name'],
        year: parseInt(row['Год'] || row['year'], 10),
        month: parseInt(row['Месяц'] || row['month'], 10),
        averageSalary: parseFloat(row['Средняя зарплата'] || row['average_salary'] || '0'),
        category: row['Категория работников'] || row['worker_category'],
      }));
    } catch (error) {
      this.logger.error('Failed to parse labor costs data:', error);
      throw error;
    }
  }

  /**
   * Парсинг данных ФСНБ (Федеральные сметные нормативы базы)
   */
  async parseFSNBData(xmlData: string, year: '2020' | '2022'): Promise<any[]> {
    try {
      const result = await this.xmlParser.parseStringPromise(xmlData);
      const items = this.extractItemsFromXML(result);

      return items.map((item: any) => ({
        code: item.code || item.Код,
        name: item.name || item.Наименование,
        unit: item.unit || item.ЕдиницаИзмерения,
        laborCost: parseFloat(item.laborCost || item.ЗатратыТруда || '0'),
        materialCost: parseFloat(item.materialCost || item.Материалы || '0'),
        machineCost: parseFloat(item.machineCost || item.Машины || '0'),
        totalCost: parseFloat(item.totalCost || item.Всего || '0'),
        category: item.category || item.Категория,
        year,
      }));
    } catch (error) {
      this.logger.error(`Failed to parse FSNB ${year} data:`, error);
      throw error;
    }
  }

  /**
   * Парсинг данных технологических групп
   */
  async parseTechGroupsData(xmlData: string): Promise<any[]> {
    try {
      const result = await this.xmlParser.parseStringPromise(xmlData);
      const items = this.extractItemsFromXML(result);

      return items.map((item: any) => ({
        code: item.code || item.Код,
        name: item.name || item.Наименование,
        description: item.description || item.Описание,
        resources: this.parseTechGroupResources(item.resources || item.Ресурсы),
      }));
    } catch (error) {
      this.logger.error('Failed to parse tech groups data:', error);
      throw error;
    }
  }

  /**
   * Парсинг ГЭСН данных из локальных XML файлов
   */
  async parseGESNData(xmlData: string, type: 'GESN' | 'GESN_M' | 'GESN_MR' | 'GESN_P' | 'GESN_R'): Promise<any[]> {
    try {
      const result = await this.xmlParser.parseStringPromise(xmlData);
      const items = this.extractItemsFromXML(result);

      return items.map((item: any) => ({
        code: item.code || item.Код,
        name: item.name || item.Наименование,
        unit: item.unit || item.ЕдиницаИзмерения,
        laborHours: parseFloat(item.laborHours || item.ТрудозатратыЧелЧас || '0'),
        machineHours: this.parseMachineHours(item.machineHours || item.МашиноЧасы),
        materials: this.parseMaterials(item.materials || item.Материалы),
        type,
      }));
    } catch (error) {
      this.logger.error(`Failed to parse ${type} data:`, error);
      throw error;
    }
  }

  /**
   * Парсинг ФСБЦ данных (материалы и машины)
   */
  async parseFSBTSData(xmlData: string, type: 'materials' | 'machines'): Promise<any[]> {
    try {
      const result = await this.xmlParser.parseStringPromise(xmlData);
      const items = this.extractItemsFromXML(result);

      if (type === 'materials') {
        return items.map((item: any) => ({
          code: item.code || item.Код,
          name: item.name || item.Наименование,
          unit: item.unit || item.ЕдиницаИзмерения,
          price: parseFloat(item.price || item.Цена || '0'),
          category: item.category || item.Категория,
          supplier: item.supplier || item.Поставщик,
        }));
      } else {
        return items.map((item: any) => ({
          code: item.code || item.Код,
          name: item.name || item.Наименование,
          unit: item.unit || item.ЕдиницаИзмерения,
          hourlyRate: parseFloat(item.hourlyRate || item.СтоимостьМашЧаса || '0'),
          category: item.category || item.Категория,
        }));
      }
    } catch (error) {
      this.logger.error(`Failed to parse FSBTS ${type} data:`, error);
      throw error;
    }
  }

  /**
   * Общий метод для парсинга XML данных
   */
  private async parseXMLData(xmlData: string): Promise<any> {
    try {
      return await this.xmlParser.parseStringPromise(xmlData);
    } catch (error) {
      this.logger.error('Failed to parse XML data:', error);
      throw error;
    }
  }

  /**
   * Общий метод для парсинга CSV данных
   */
  private parseCSVData(csvData: string): any {
    try {
      return Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
      });
    } catch (error) {
      this.logger.error('Failed to parse CSV data:', error);
      throw error;
    }
  }

  /**
   * Извлечение элементов из XML структуры
   */
  private extractItemsFromXML(xmlObject: any): any[] {
    // Попытка найти элементы в разных возможных местах
    const possiblePaths = [
      xmlObject.items?.item,
      xmlObject.data?.item,
      xmlObject.records?.record,
      xmlObject.элементы?.элемент,
      xmlObject.данные?.запись,
    ];

    for (const path of possiblePaths) {
      if (path) {
        return Array.isArray(path) ? path : [path];
      }
    }

    return [];
  }

  /**
   * Парсинг ресурсов технологической группы
   */
  private parseTechGroupResources(resources: any): any[] {
    if (!resources) return [];
    
    const resourceList = Array.isArray(resources) ? resources : [resources];
    return resourceList.map((res: any) => ({
      code: res.code || res.Код,
      quantity: parseFloat(res.quantity || res.Количество || '0'),
    }));
  }

  /**
   * Парсинг машино-часов
   */
  private parseMachineHours(machineHours: any): any[] {
    if (!machineHours) return [];
    
    const hoursList = Array.isArray(machineHours) ? machineHours : [machineHours];
    return hoursList.map((mh: any) => ({
      machineCode: mh.machineCode || mh.КодМашины,
      hours: parseFloat(mh.hours || mh.Часы || '0'),
    }));
  }

  /**
   * Парсинг материалов
   */
  private parseMaterials(materials: any): any[] {
    if (!materials) return [];
    
    const materialsList = Array.isArray(materials) ? materials : [materials];
    return materialsList.map((mat: any) => ({
      materialCode: mat.materialCode || mat.КодМатериала,
      quantity: parseFloat(mat.quantity || mat.Количество || '0'),
    }));
  }
}
