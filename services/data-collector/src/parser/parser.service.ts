import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  constructor() {
    this.logger.log('ParserService инициализирован');
  }

  /**
   * Парсинг HTML контента
   */
  parseHtml(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }

  /**
   * Извлечение текста из HTML элемента
   */
  extractText(element: any): string {
    return element.text().trim();
  }

  /**
   * Парсинг числовых значений
   */
  parseNumber(value: string): number {
    const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Очистка и нормализация текста
   */
  cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\r\n\t]/g, ' ')
      .trim();
  }
}
