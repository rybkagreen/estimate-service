import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import * as cheerio from 'cheerio';

import { ValidationService } from '../services/validation.service';
import { FileDownloadService } from '../services/file-download.service';
import {
  DataSource,
  SourceMetadata,
  FsbtsRawData,
  ParsedWorkItem,
  CollectionResult,
} from '../types/common.types';

/**
 * Парсер для сайта Минстроя России
 * Извлекает данные ФСБЦ-2022 из официальных источников
 *
 * Согласно ROADMAP:
 * - Этап 1.1: Создание парсеров для сайта Минстроя России
 * - Автоматический сбор данных ФСБЦ-2022 по регионам
 * - Парсинг сборников расценок и нормативов
 */
@Injectable()
export class MinstroyParserService {
  private readonly logger = new Logger(MinstroyParserService.name);

  // Официальные источники данных Минстроя
  private readonly MINSTROYRF_URLS = {
    main: 'https://minstroyrf.gov.ru',
    fsbts: 'https://minstroyrf.gov.ru/trades/view_documents/35776/',
    regions: 'https://minstroyrf.gov.ru/trades/view_documents/territories/',
    normatives: 'https://minstroyrf.gov.ru/trades/view_documents/normatives/',
    prices: 'https://minstroyrf.gov.ru/trades/view_documents/prices/',
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly validationService: ValidationService,
    private readonly fileDownloadService: FileDownloadService,
  ) {}

  /**
   * Основной метод сбора данных ФСБЦ-2022 с сайта Минстроя
   */
  async collectFsbtsData(): Promise<CollectionResult> {
    this.logger.log('Начинаем сбор данных ФСБЦ-2022 с сайта Минстроя');

    const startTime = Date.now();
    const result: CollectionResult = {
      success: false,
      totalItems: 0,
      processedItems: 0,
      errors: [],
      source: 'minstroyrf.gov.ru',
      timestamp: new Date(),
      duration: 0,
      metadata: {
        source: 'minstroyrf.gov.ru',
        collectionDate: new Date(),
        version: await this.getLatestVersion(),
      },
    };

    try {
      // 1. Получаем список доступных документов ФСБЦ-2022
      const documents = await this.getAvailableDocuments();
      this.logger.log(`Найдено ${documents.length} документов ФСБЦ-2022`);

      // 2. Собираем данные по каждому документу
      for (const doc of documents) {
        try {
          const data = await this.parseDocument(doc);
          result.totalItems += (data.items || []).length;
          result.processedItems += data.validItems || 0;

          if (data.errors && data.errors.length > 0) {
            result.errors.push(...data.errors);
          }
        } catch (error) {
          this.logger.error(`Ошибка обработки документа ${doc.title}:`, error);
          result.errors.push(
            `Документ ${doc.title}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
          );
        }
      }

      result.success = result.errors.length === 0 || result.processedItems > 0;
      result.duration = Date.now() - startTime;

      this.logger.log(
        `Сбор данных завершен. Обработано: ${result.processedItems}/${result.totalItems} позиций`,
      );

      return result;
    } catch (error) {
      this.logger.error('Критическая ошибка при сборе данных ФСБЦ-2022:', error);
      result.errors.push(
        `Критическая ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Получение списка доступных документов ФСБЦ-2022
   */
  private async getAvailableDocuments(): Promise<FsbtsDocument[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.MINSTROYRF_URLS.fsbts).pipe(
          catchError((error: AxiosError) => {
            this.logger.error('Ошибка загрузки страницы с документами:', error.message);
            throw error;
          }),
        ),
      );

      const $ = cheerio.load(response.data);
      const documents: FsbtsDocument[] = [];

      // Парсим список документов
      $('.document-list .document-item').each((index, element) => {
        const $el = $(element);
        const title = $el.find('.document-title').text().trim();
        const url = $el.find('.document-link').attr('href');
        const date = $el.find('.document-date').text().trim();
        const size = $el.find('.document-size').text().trim();

        if (title && url) {
          documents.push({
            title,
            url: this.normalizeUrl(url),
            date: this.parseDate(date),
            size: this.parseSize(size),
            type: this.determineDocumentType(title),
            version: '2022.1', // Версия по умолчанию
          });
        }
      });

      return documents;
    } catch (error) {
      this.logger.error('Ошибка получения списка документов:', error);
      throw error;
    }
  }

  /**
   * Парсинг отдельного документа ФСБЦ-2022
   */
  private async parseDocument(document: FsbtsDocument): Promise<FsbtsRawData> {
    this.logger.log(`Парсинг документа: ${document.title}`);

    const result: FsbtsRawData = {
      source: document.title,
      rawContent: '',
      extractedAt: new Date(),
      items: [],
      validItems: 0,
      errors: [],
      metadata: {
        url: document.url,
        title: document.title,
        version: document.version,
        format: this.getFileExtension(document.url) || 'unknown',
        parsingDate: new Date(),
      },
    };

    try {
      // Скачиваем документ
      const filePath = await this.fileDownloadService.downloadFile(
        document.url,
        this.generateFileName(document.title, document.url),
      );

      // Парсим в зависимости от типа файла
      const extension = this.getFileExtension(filePath.fileName || '');
      let items: ParsedWorkItem[] = [];

      switch (extension) {
        case '.xlsx':
        case '.xls':
          items = await this.parseExcelDocument(filePath.filePath || '');
          break;
        case '.pdf':
          items = await this.parsePdfDocument(filePath.filePath || '');
          break;
        case '.xml':
          items = await this.parseXmlDocument(filePath.filePath || '');
          break;
        default:
          throw new Error(`Неподдерживаемый формат файла: ${extension}`);
      }

      // Валидация и очистка данных
      for (const item of items) {
        const validationResult = this.validationService.validateFerItem(item);
        if (validationResult.isValid) {
          result.items.push(item);
          result.validItems++;
        } else {
          result.errors.push(`Невалидная позиция: ${item.code} - ${item.name}`);
        }
      }

      this.logger.log(`Документ обработан: ${result.validItems}/${items.length} валидных позиций`);

      return result;
    } catch (error) {
      this.logger.error(`Ошибка парсинга документа ${document.title}:`, error);
      result.errors.push(error instanceof Error ? error.message : 'Неизвестная ошибка');
      return result;
    }
  }

  /**
   * Парсинг Excel-документов ФСБЦ-2022
   */
  private async parseExcelDocument(filePath: string): Promise<ParsedWorkItem[]> {
    const items: ParsedWorkItem[] = [];

    try {
      const XLSX = require('xlsx');
      const workbook = XLSX.readFile(filePath);

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Пропускаем заголовки и парсим строки данных
        for (let i = 1; i < data.length; i++) {
          const row = data[i] as any[];

          if (row.length >= 6) {
            const item: ParsedWorkItem = {
              code: String(row[0] || '').trim(),
              name: String(row[1] || '').trim(),
              unit: String(row[2] || '').trim(),
              basePrice: this.parseNumber(row[3]),
              laborCost: this.parseNumber(row[4]),
              machineCost: this.parseNumber(row[5]),
              materialCost: this.parseNumber(row[6]),
              category: this.determineCategory(String(row[1] || '')),
              sourceUrl: filePath,
            };

            if (item.code && item.name && item.basePrice > 0) {
              items.push(item);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Ошибка парсинга Excel-файла:', error);
      throw error;
    }

    return items;
  }

  /**
   * Парсинг PDF-документов ФСБЦ-2022
   */
  private async parsePdfDocument(filePath: string): Promise<ParsedWorkItem[]> {
    // TODO: Реализовать парсинг PDF через pdf-parse или подобную библиотеку
    this.logger.warn('Парсинг PDF-файлов пока не реализован');
    return [];
  }

  /**
   * Парсинг XML-документов ФСБЦ-2022
   */
  private async parseXmlDocument(filePath: string): Promise<ParsedWorkItem[]> {
    // TODO: Реализовать парсинг XML файлов
    this.logger.warn('Парсинг XML-файлов пока не реализован');
    return [];
  }

  /**
   * Получение информации о последней версии ФСБЦ-2022
   */
  private async getLatestVersion(): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.MINSTROYRF_URLS.fsbts).pipe(
          catchError((error: AxiosError) => {
            this.logger.warn('Не удалось получить версию ФСБЦ-2022');
            throw error;
          }),
        ),
      );

      const $ = cheerio.load(response.data);
      const versionText = $('.version-info, .document-version').first().text();

      // Извлекаем версию из текста (например, "ФСБЦ-2022 версия 2.1")
      const versionMatch = versionText.match(/версия\s+(\d+\.\d+)/i);
      return versionMatch ? versionMatch[1] : '2022.1';
    } catch (error) {
      return '2022.1'; // Версия по умолчанию
    }
  }

  // Вспомогательные методы
  private normalizeUrl(url: string): string {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return this.MINSTROYRF_URLS.main + url;
    return this.MINSTROYRF_URLS.main + '/' + url;
  }

  private parseDate(dateStr: string): Date {
    try {
      return new Date(dateStr);
    } catch {
      return new Date();
    }
  }

  private parseSize(sizeStr: string): number {
    const match = sizeStr.match(/(\d+(?:\.\d+)?)\s*(кб|мб|гб|kb|mb|gb)/i);
    if (match) {
      const size = parseFloat(match?.[1] || '0');
      const unit = match?.[2]?.toLowerCase() || 'kb';

      switch (unit) {
        case 'кб':
        case 'kb':
          return size * 1024;
        case 'мб':
        case 'mb':
          return size * 1024 * 1024;
        case 'гб':
        case 'gb':
          return size * 1024 * 1024 * 1024;
        default:
          return size;
      }
    }
    return 0;
  }

  private determineDocumentType(title: string): string {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('фер')) return 'FER';
    if (titleLower.includes('тер')) return 'TER';
    if (titleLower.includes('гэсн')) return 'GESN';
    if (titleLower.includes('фсбц')) return 'FSBTS';

    return 'UNKNOWN';
  }

  private generateFileName(title: string, url: string): string {
    const extension = this.getFileExtension(url) || '.pdf';
    const cleanTitle = title
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    const timestamp = Date.now();
    return `${cleanTitle}_${timestamp}${extension}`;
  }

  private getFileExtension(filePath: string): string {
    return filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  }

  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private determineCategory(name: string): string {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('земляные')) return 'earthworks';
    if (nameLower.includes('бетонные')) return 'concrete';
    if (nameLower.includes('кирпичные')) return 'masonry';
    if (nameLower.includes('кровельные')) return 'roofing';
    if (nameLower.includes('отделочные')) return 'finishing';

    return 'general';
  }
}

/**
 * Интерфейс для документа ФСБЦ-2022
 */
interface FsbtsDocument {
  title: string;
  url: string;
  date: Date;
  size: number;
  type: string;
  version: string;
}
