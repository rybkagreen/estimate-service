import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface FerItem {
  code: string;
  name: string;
  unit: string;
  laborCost: number;
  materialCost: number;
  machineCost: number;
  totalCost: number;
  region?: string;
  chapter?: string;
  section?: string;
}

@Injectable()
export class FerService {
  private readonly logger = new Logger(FerService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Получает данные ФЕР с официального сайта Минстроя
   */
  async getFerData(region?: string): Promise<FerItem[]> {
    this.logger.log(`Начинаем сбор данных ФЕР${region ? ` для региона: ${region}` : ''}`);

    try {
      // URL для получения данных ФЕР (примерный, нужно уточнить актуальный)
      const baseUrl = 'https://www.minstroyrf.ru/trades/normy-i-raschyety/federalnyye-yedinichnyye-rastsenki/';

      const response = await this.httpService.get(baseUrl).toPromise();

      if (!response?.data) {
        this.logger.warn('Получен пустой ответ от сервера ФЕР');
        return [];
      }

      const $ = cheerio.load(response.data);

      const ferItems: FerItem[] = [];

      // Парсим таблицы с данными ФЕР
      $('table tr').each((index, element) => {
        const cells = $(element).find('td');
        if (cells.length >= 6) {
          const ferItem: FerItem = {
            code: $(cells[0]).text().trim(),
            name: $(cells[1]).text().trim(),
            unit: $(cells[2]).text().trim(),
            laborCost: parseFloat($(cells[3]).text().replace(',', '.')) || 0,
            materialCost: parseFloat($(cells[4]).text().replace(',', '.')) || 0,
            machineCost: parseFloat($(cells[5]).text().replace(',', '.')) || 0,
            totalCost: 0,
            region: region
          };

          ferItem.totalCost = ferItem.laborCost + ferItem.materialCost + ferItem.machineCost;

          if (ferItem.code && ferItem.name) {
            ferItems.push(ferItem);
          }
        }
      });

      this.logger.log(`Собрано ${ferItems.length} записей ФЕР`);
      return ferItems;

    } catch (error) {
      this.logger.error('Ошибка при сборе данных ФЕР:', error);
      return [];
    }
  }

  /**
   * Получает данные ФЕР по конкретному коду
   */
  async getFerByCode(code: string): Promise<FerItem | null> {
    this.logger.log(`Поиск ФЕР по коду: ${code}`);

    try {
      const allData = await this.getFerData();
      const item = allData.find(item => item.code === code);

      if (item) {
        this.logger.log(`Найден ФЕР: ${item.name}`);
        return item;
      } else {
        this.logger.warn(`ФЕР с кодом ${code} не найден`);
        return null;
      }

    } catch (error) {
      this.logger.error(`Ошибка при поиске ФЕР по коду ${code}:`, error);
      return null;
    }
  }

  /**
   * Получает список глав ФЕР
   */
  async getFerChapters(): Promise<string[]> {
    this.logger.log('Получение списка глав ФЕР');

    try {
      // Здесь должна быть логика для получения структуры глав ФЕР
      const chapters = [
        'Глава 1. Земляные работы',
        'Глава 2. Основания и фундаменты',
        'Глава 3. Каменные работы',
        'Глава 4. Бетонные и железобетонные работы',
        'Глава 5. Металлические конструкции',
        'Глава 6. Деревянные конструкции',
        'Глава 7. Кровли',
        'Глава 8. Полы',
        'Глава 9. Отделочные работы',
        'Глава 10. Защита строительных конструкций и оборудования',
        // ... остальные главы
      ];

      return chapters;

    } catch (error) {
      this.logger.error('Ошибка при получении глав ФЕР:', error);
      return [];
    }
  }

  /**
   * Валидация данных ФЕР
   */
  private validateFerItem(item: FerItem): boolean {
    return !!(
      item.code &&
      item.name &&
      item.unit &&
      typeof item.laborCost === 'number' &&
      typeof item.materialCost === 'number' &&
      typeof item.machineCost === 'number'
    );
  }
}
