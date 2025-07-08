import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface GesnItem {
  code: string;
  name: string;
  unit: string;
  laborConsumption: number; // Затраты труда рабочих (чел.-ч)
  machineTime: number; // Время использования машин (маш.-ч)
  materials: Material[]; // Материалы
  chapter?: string;
  section?: string;
  complexity?: string; // Группа сложности работ
  conditions?: string; // Условия выполнения работ
}

export interface Material {
  code: string;
  name: string;
  unit: string;
  consumption: number; // Расход на единицу измерения
  wasteCoefficient?: number; // Коэффициент отходов
}

@Injectable()
export class GesnService {
  private readonly logger = new Logger(GesnService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Получает данные ГЭСН с официального сайта Минстроя
   */
  async getGesnData(chapter?: string): Promise<GesnItem[]> {
    this.logger.log(`Начинаем сбор данных ГЭСН${chapter ? ` для главы: ${chapter}` : ''}`);

    try {
      // URL для получения данных ГЭСН (примерный, нужно уточнить актуальный)
      const baseUrl = 'https://www.minstroyrf.ru/trades/normy-i-raschyety/gosudarstvennyye-elementnyye-smetnyye-normy/';

      const response = await this.httpService.get(baseUrl).toPromise();

      if (!response?.data) {
        this.logger.warn('Получен пустой ответ от сервера ГЭСН');
        return [];
      }

      const $ = cheerio.load(response.data);
      const gesnItems: GesnItem[] = [];

      // Парсим таблицы с данными ГЭСН
      $('table tr').each((index, element) => {
        const cells = $(element).find('td');
        if (cells.length >= 4) {
          const gesnItem: GesnItem = {
            code: $(cells[0]).text().trim(),
            name: $(cells[1]).text().trim(),
            unit: $(cells[2]).text().trim(),
            laborConsumption: parseFloat($(cells[3]).text().replace(',', '.')) || 0,
            machineTime: parseFloat($(cells[4]).text().replace(',', '.')) || 0,
            materials: this.parseMaterials($(cells[5]).text()),
            chapter: chapter
          };

          if (this.validateGesnItem(gesnItem)) {
            gesnItems.push(gesnItem);
          }
        }
      });

      this.logger.log(`Собрано ${gesnItems.length} записей ГЭСН`);
      return gesnItems;

    } catch (error) {
      this.logger.error('Ошибка при сборе данных ГЭСН:', error);
      return [];
    }
  }

  /**
   * Получает данные ГЭСН по конкретному коду
   */
  async getGesnByCode(code: string): Promise<GesnItem | null> {
    this.logger.log(`Поиск ГЭСН по коду: ${code}`);

    try {
      const allData = await this.getGesnData();
      const item = allData.find(item => item.code === code);

      if (item) {
        this.logger.log(`Найден ГЭСН: ${item.name}`);
        return item;
      } else {
        this.logger.warn(`ГЭСН с кодом ${code} не найден`);
        return null;
      }

    } catch (error) {
      this.logger.error(`Ошибка при поиске ГЭСН по коду ${code}:`, error);
      return null;
    }
  }

  /**
   * Получает список глав ГЭСН
   */
  async getGesnChapters(): Promise<string[]> {
    this.logger.log('Получение списка глав ГЭСН');

    try {
      // Главы ГЭСН - элементные сметные нормы
      const chapters = [
        'Глава 1. ГЭСН-2001-01. Земляные работы',
        'Глава 2. ГЭСН-2001-02. Основания и фундаменты',
        'Глава 3. ГЭСН-2001-03. Каменные работы',
        'Глава 4. ГЭСН-2001-04. Бетонные и железобетонные конструкции монолитные',
        'Глава 5. ГЭСН-2001-05. Конструкции из кирпича и блоков',
        'Глава 6. ГЭСН-2001-06. Металлические конструкции',
        'Глава 7. ГЭСН-2001-07. Деревянные конструкции',
        'Глава 8. ГЭСН-2001-08. Конструкции из пластических масс',
        'Глава 9. ГЭСН-2001-09. Кровли',
        'Глава 10. ГЭСН-2001-10. Полы',
        'Глава 11. ГЭСН-2001-11. Отделочные работы',
        'Глава 12. ГЭСН-2001-12. Защита строительных конструкций и оборудования от коррозии',
        'Глава 13. ГЭСН-2001-13. Конструкции в сборе',
        'Глава 14. ГЭСН-2001-14. Временные здания и сооружения',
        'Глава 15. ГЭСН-2001-15. Сантехнические работы - внутренние',
        'Глава 16. ГЭСН-2001-16. Электромонтажные работы',
        'Глава 17. ГЭСН-2001-17. Слаботочные устройства',
        'Глава 18. ГЭСН-2001-18. Отопление - внутренние системы',
        'Глава 19. ГЭСН-2001-19. Газоснабжение - внутренние устройства',
        'Глава 20. ГЭСН-2001-20. Вентиляция и кондиционирование',
        'Глава 21. ГЭСН-2001-21. Автомобильные дороги',
        'Глава 22. ГЭСН-2001-22. Железные дороги',
        'Глава 23. ГЭСН-2001-23. Аэродромы',
        'Глава 24. ГЭСН-2001-24. Мосты и трубы',
        'Глава 25. ГЭСН-2001-25. Тоннели и метрополитены',
        'Глава 26. ГЭСН-2001-26. Трубопроводы наружные',
        'Глава 27. ГЭСН-2001-27. Водопровод и канализация',
        'Глава 28. ГЭСН-2001-28. Магистральные и промысловые трубопроводы',
        'Глава 29. ГЭСН-2001-29. Электроснабжение и электрооборудование',
        'Глава 30. ГЭСН-2001-30. Теплоснабжение - наружные сети',
        'Глава 31. ГЭСН-2001-31. Газоснабжение - наружные сети',
        'Глава 32. ГЭСН-2001-32. Сооружения связи и сигнализации',
        'Глава 33. ГЭСН-2001-33. Промышленные печи и трубы',
        'Глава 34. ГЭСН-2001-34. Строительные работы в особых условиях',
        'Глава 35. ГЭСН-2001-35. Горноразведочные работы',
        'Глава 36. ГЭСН-2001-36. Земляные конструкции гидротехнических сооружений',
        'Глава 37. ГЭСН-2001-37. Бетонные и железобетонные конструкции гидротехнических сооружений',
        'Глава 38. ГЭСН-2001-38. Металлические конструкции гидротехнических сооружений',
        'Глава 39. ГЭСН-2001-39. Гидроизоляционные работы',
        'Глава 40. ГЭСН-2001-40. Каменные работы гидротехнических сооружений',
        'Глава 41. ГЭСН-2001-41. Буровые и взрывные работы',
        'Глава 42. ГЭСН-2001-42. Водолазные работы',
        'Глава 43. ГЭСН-2001-43. Скважины для забора подземных вод',
        'Глава 44. ГЭСН-2001-44. Системы автоматизации',
        'Глава 45. ГЭСН-2001-45. Озеленение',
        'Глава 46. ГЭСН-2001-46. Работы при реконструкции зданий и сооружений',
        'Глава 47. ГЭСН-2001-47. Демонтажные работы'
      ];

      return chapters;

    } catch (error) {
      this.logger.error('Ошибка при получении глав ГЭСН:', error);
      return [];
    }
  }

  /**
   * Поиск ГЭСН по названию работ
   */
  async searchGesnByName(searchTerm: string): Promise<GesnItem[]> {
    this.logger.log(`Поиск ГЭСН по названию: ${searchTerm}`);

    try {
      const allData = await this.getGesnData();
      const results = allData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
      );

      this.logger.log(`Найдено ${results.length} записей ГЭСН по запросу: ${searchTerm}`);
      return results;

    } catch (error) {
      this.logger.error(`Ошибка при поиске ГЭСН по названию ${searchTerm}:`, error);
      return [];
    }
  }

  /**
   * Парсинг материалов из текстового описания
   */
  private parseMaterials(materialText: string): Material[] {
    const materials: Material[] = [];

    // Здесь должна быть логика парсинга материалов из текста
    // Это упрощенный пример
    const lines = materialText.split('\n');

    for (const line of lines) {
      if (line.trim()) {
        const parts = line.split('\t');
        if (parts.length >= 3) {
          materials.push({
            code: parts[0]?.trim() || '',
            name: parts[1]?.trim() || '',
            unit: parts[2]?.trim() || '',
            consumption: parseFloat((parts[3] || '0').replace(',', '.')) || 0
          });
        }
      }
    }

    return materials;
  }

  /**
   * Валидация данных ГЭСН
   */
  private validateGesnItem(item: GesnItem): boolean {
    return !!(
      item.code &&
      item.name &&
      item.unit &&
      typeof item.laborConsumption === 'number' &&
      typeof item.machineTime === 'number'
    );
  }
}
