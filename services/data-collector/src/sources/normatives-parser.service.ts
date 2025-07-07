/**
 * Сервис для парсинга нормативных документов
 */

import { Injectable, Logger } from '@nestjs/common';

export interface NormativeDocument {
  id: string;
  title: string;
  url: string;
  type: 'ГСН' | 'ТСН' | 'РСН' | 'ФЕР' | 'ТЕР' | 'ГЭСН';
  region?: string;
}

export interface NormativeParsingResult {
  document: NormativeDocument;
  items: any[];
  success: boolean;
  errors: string[];
}

@Injectable()
export class NormativesParserService {
  private readonly logger = new Logger(NormativesParserService.name);

  /**
   * Парсинг нормативного документа
   */
  async parseNormativeDocument(document: NormativeDocument): Promise<NormativeParsingResult> {
    this.logger.log(`Парсинг нормативного документа: ${document.title}`);

    try {
      // TODO: Реализовать парсинг различных типов нормативных документов
      const items: any[] = [];

      return {
        document,
        items,
        success: true,
        errors: [],
      };
    } catch (error) {
      this.logger.error(`Ошибка при парсинге документа ${document.title}:`, error);
      return {
        document,
        items: [],
        success: false,
        errors: [error instanceof Error ? error.message : 'Неизвестная ошибка'],
      };
    }
  }

  /**
   * Получение списка доступных нормативных документов
   */
  async getAvailableDocuments(): Promise<NormativeDocument[]> {
    // TODO: Получать из конфигурации или API
    return [
      {
        id: 'fer-2022',
        title: 'ФЕР 2022',
        url: 'https://example.com/fer-2022.xlsx',
        type: 'ФЕР',
      },
      {
        id: 'ter-moscow-2022',
        title: 'ТЕР Московская область 2022',
        url: 'https://example.com/ter-moscow-2022.xlsx',
        type: 'ТЕР',
        region: 'Московская область',
      },
    ];
  }
}
