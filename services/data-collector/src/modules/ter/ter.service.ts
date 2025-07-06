import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface TerItem {
  code: string;
  name: string;
  unit: string;
  laborCost: number;
  materialCost: number;
  machineCost: number;
  totalCost: number;
  region: string;
  chapter?: string;
  section?: string;
  climateZone?: string;
}

@Injectable()
export class TerService {
  private readonly logger = new Logger(TerService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Получает данные ТЕР с официального сайта Минстроя
   */
  async getTerData(region?: string): Promise<TerItem[]> {
    this.logger.log(`Начинаем сбор данных ТЕР${region ? ` для региона: ${region}` : ''}`);

    try {
      // URL для получения данных ТЕР (примерный, нужно уточнить актуальный)
      const baseUrl = 'https://www.minstroyrf.ru/trades/normy-i-raschyety/territorialnyye-yedinichnyye-rastsenki/';

      const response = await this.httpService.get(baseUrl).toPromise();

      if (!response?.data) {
        this.logger.warn('Получен пустой ответ от сервера ТЕР');
        return [];
      }

      const $ = cheerio.load(response.data);

      const terItems: TerItem[] = [];

      // Парсим таблицы с данными ТЕР
      $('table tr').each((index, element) => {
        const cells = $(element).find('td');
        if (cells.length >= 6) {
          const terItem: TerItem = {
            code: $(cells[0]).text().trim(),
            name: $(cells[1]).text().trim(),
            unit: $(cells[2]).text().trim(),
            laborCost: parseFloat($(cells[3]).text().replace(',', '.')) || 0,
            materialCost: parseFloat($(cells[4]).text().replace(',', '.')) || 0,
            machineCost: parseFloat($(cells[5]).text().replace(',', '.')) || 0,
            totalCost: 0,
            region: region || 'default'
          };

          terItem.totalCost = terItem.laborCost + terItem.materialCost + terItem.machineCost;

          if (this.validateTerItem(terItem)) {
            terItems.push(terItem);
          }
        }
      });

      this.logger.log(`Собрано ${terItems.length} записей ТЕР`);
      return terItems;

    } catch (error) {
      this.logger.error('Ошибка при сборе данных ТЕР:', error);
      return [];
    }
  }

  /**
   * Получает данные ТЕР по конкретному коду
   */
  async getTerByCode(code: string, region?: string): Promise<TerItem | null> {
    this.logger.log(`Поиск ТЕР по коду: ${code} в регионе: ${region || 'default'}`);

    try {
      const allData = await this.getTerData(region);
      const item = allData.find(item => item.code === code);

      if (item) {
        this.logger.log(`Найден ТЕР: ${item.name}`);
        return item;
      } else {
        this.logger.warn(`ТЕР с кодом ${code} не найден`);
        return null;
      }

    } catch (error) {
      this.logger.error(`Ошибка при поиске ТЕР по коду ${code}:`, error);
      return null;
    }
  }

  /**
   * Получает список региональных коэффициентов ТЕР
   */
  async getTerRegions(): Promise<string[]> {
    this.logger.log('Получение списка регионов ТЕР');

    try {
      // Список регионов с территориальными расценками
      const regions = [
        'Московская область',
        'Санкт-Петербург и Ленинградская область',
        'Краснодарский край',
        'Свердловская область',
        'Новосибирская область',
        'Татарстан',
        'Башкортостан',
        'Челябинская область',
        'Ростовская область',
        'Омская область',
        // ... остальные регионы
      ];

      return regions;

    } catch (error) {
      this.logger.error('Ошибка при получении регионов ТЕР:', error);
      return [];
    }
  }

  /**
   * Получает список глав ТЕР
   */
  async getTerChapters(): Promise<string[]> {
    this.logger.log('Получение списка глав ТЕР');

    try {
      // Главы ТЕР аналогичны ФЕР, но с региональными особенностями
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
        'Глава 11. Сантехнические работы',
        'Глава 12. Электромонтажные работы',
        'Глава 13. Слаботочные сети',
        'Глава 14. Отопление и вентиляция',
        'Глава 15. Наружные инженерные сети',
        // ... остальные главы с региональной спецификой
      ];

      return chapters;

    } catch (error) {
      this.logger.error('Ошибка при получении глав ТЕР:', error);
      return [];
    }
  }

  /**
   * Валидация данных ТЕР
   */
  private validateTerItem(item: TerItem): boolean {
    return !!(
      item.code &&
      item.name &&
      item.unit &&
      item.region &&
      typeof item.laborCost === 'number' &&
      typeof item.materialCost === 'number' &&
      typeof item.machineCost === 'number'
    );
  }
}
