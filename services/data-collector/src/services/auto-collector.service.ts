/**
 * Сервис для автоматического обнаружения и скачивания файлов ФСБЦ-2022
 */

import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { DATA_SOURCES_CONFIG } from '../config/data-sources.config';
import { DownloadConfig, DownloadResult, FileDownloadService } from '../services/file-download.service';
import { HttpClientService } from '../services/http-client.service';

export interface FileInfo {
  url: string;
  fileName: string;
  title: string;
  size?: string;
  type: 'FER' | 'TER' | 'GESN';
  format: 'doc' | 'docx' | 'pdf' | 'csv' | 'xls' | 'xlsx';
}

export interface DiscoveryResult {
  success: boolean;
  type: 'FER' | 'TER' | 'GESN';
  files: FileInfo[];
  error?: string;
}

@Injectable()
export class AutoCollectorService {
  private readonly logger = new Logger(AutoCollectorService.name);

  constructor(
    private httpClientService: HttpClientService,
    private fileDownloadService: FileDownloadService
  ) {}

  /**
   * Автоматический сбор всех файлов ФСБЦ-2022
   */
  async collectAllData(): Promise<{
    discovery: DiscoveryResult[];
    downloads: DownloadResult[];
  }> {
    this.logger.log('Начинаем автоматический сбор данных ФСБЦ-2022');

    // Этап 1: Обнаружение файлов
    const discoveryResults = await this.discoverAllFiles();

    // Этап 2: Скачивание найденных файлов
    const allFiles: FileInfo[] = [];
    discoveryResults.forEach(result => {
      if (result.success) {
        allFiles.push(...result.files);
      }
    });

    const downloadConfigs: DownloadConfig[] = allFiles.map(file => ({
      url: file.url,
      fileName: file.fileName
    }));

    const downloadResults = await this.fileDownloadService.downloadFiles(downloadConfigs);

    this.logger.log(`Сбор завершен. Обнаружено: ${allFiles.length} файлов, скачано: ${downloadResults.filter(r => r.success).length}`);

    return {
      discovery: discoveryResults,
      downloads: downloadResults
    };
  }

  /**
   * Обнаружение файлов для всех типов данных
   */
  async discoverAllFiles(): Promise<DiscoveryResult[]> {
    const results: DiscoveryResult[] = [];

    for (const [type, config] of Object.entries(DATA_SOURCES_CONFIG)) {
      if (config.enabled) {
        const result = await this.discoverFiles(type as 'FER' | 'TER' | 'GESN');
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Обнаружение файлов для конкретного типа данных
   */
  async discoverFiles(type: 'FER' | 'TER' | 'GESN'): Promise<DiscoveryResult> {
    try {
      this.logger.log(`Поиск файлов ${type}...`);

      const config = DATA_SOURCES_CONFIG[type];

      if (!config) {
        return {
          success: false,
          type,
          files: [],
          error: `Конфигурация для ${type} не найдена`
        };
      }

      const response = await this.httpClientService.get(config.baseUrl);

      if (!response) {
        return {
          success: false,
          type,
          files: [],
          error: 'Не удалось получить данные'
        };
      }

      const $ = cheerio.load(response.data);
      const files: FileInfo[] = [];

      // Поиск ссылок на файлы
      const linkSelectors = [
        'a[href$=".doc"]',
        'a[href$=".docx"]',
        'a[href$=".pdf"]',
        'a[href$=".csv"]',
        'a[href$=".xls"]',
        'a[href$=".xlsx"]'
      ];

      linkSelectors.forEach(selector => {
        $(selector).each((_, element) => {
          const $link = $(element);
          const href = $link.attr('href');
          const title = $link.text().trim() || $link.attr('title') || '';

          if (href) {
            const url = this.resolveUrl(href, config.baseUrl);
            const fileName = this.extractFileName(url, title, type);
            const format = this.getFileFormat(url);

            if (format && this.isRelevantFile(title, type)) {
              files.push({
                url,
                fileName,
                title,
                type,
                format,
                size: $link.find('.file-size').text() || undefined
              });
            }
          }
        });
      });

      // Дополнительный поиск в специфических контейнерах
      this.findFilesInContainers($, type, config.baseUrl, files);

      this.logger.log(`Найдено ${files.length} файлов для ${type}`);

      return {
        success: true,
        type,
        files
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      this.logger.error(`Ошибка при поиске файлов ${type}: ${errorMessage}`);

      return {
        success: false,
        type,
        files: [],
        error: errorMessage
      };
    }
  }

  /**
   * Поиск файлов в специфических контейнерах страницы
   */
  private findFilesInContainers(
    $: cheerio.CheerioAPI,
    type: 'FER' | 'TER' | 'GESN',
    baseUrl: string,
    files: FileInfo[]
  ): void {
    // Поиск в разделах документов
    $('.document-section, .file-list, .downloads, .attachments').each((_, container) => {
      const $container = $(container);

      $container.find('a').each((_, link) => {
        const $link = $(link);
        const href = $link.attr('href');
        const title = $link.text().trim();

        if (href && this.isRelevantFile(title, type)) {
          const url = this.resolveUrl(href, baseUrl);
          const format = this.getFileFormat(url);

          if (format) {
            const fileName = this.extractFileName(url, title, type);

            // Проверяем, что файл еще не добавлен
            if (!files.some(f => f.url === url)) {
              files.push({
                url,
                fileName,
                title,
                type,
                format
              });
            }
          }
        }
      });
    });
  }

  /**
   * Разрешение относительных URL
   */
  private resolveUrl(href: string, baseUrl: string): string {
    if (href.startsWith('http')) {
      return href;
    }

    if (href.startsWith('/')) {
      const base = new URL(baseUrl);
      return `${base.protocol}//${base.host}${href}`;
    }

    return new URL(href, baseUrl).toString();
  }

  /**
   * Извлечение имени файла
   */
  private extractFileName(url: string, title: string, type: string): string {
    try {
      const urlObj = new URL(url);
      let fileName = urlObj.pathname.split('/').pop() || '';

      // Если имя файла пустое или слишком общее, генерируем на основе заголовка
      if (!fileName || fileName.length < 3) {
        const cleanTitle = title.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
        const extension = this.getFileFormat(url) || 'pdf';
        fileName = `${type}_${cleanTitle}_${Date.now()}.${extension}`;
      }

      return fileName;
    } catch {
      const extension = this.getFileFormat(url) || 'pdf';
      return `${type}_document_${Date.now()}.${extension}`;
    }
  }

  /**
   * Определение формата файла
   */
  private getFileFormat(url: string): 'doc' | 'docx' | 'pdf' | 'csv' | 'xls' | 'xlsx' | null {
    const extension = url.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'doc':
      case 'docx':
      case 'pdf':
      case 'csv':
      case 'xls':
      case 'xlsx':
        return extension as any;
      default:
        return null;
    }
  }

  /**
   * Проверка релевантности файла
   */
  private isRelevantFile(title: string, type: 'FER' | 'TER' | 'GESN'): boolean {
    const normalizedTitle = title.toLowerCase();

    const keywords = {
      FER: ['федеральн', 'единичн', 'расцен', 'фер', '2022'],
      TER: ['территориальн', 'единичн', 'расцен', 'тер', '2022'],
      GESN: ['государствен', 'элементн', 'смет', 'норм', 'гэсн', '2022']
    };

    const typeKeywords = keywords[type];

    return typeKeywords.some(keyword => normalizedTitle.includes(keyword)) ||
           normalizedTitle.includes('фсбц') ||
           normalizedTitle.includes('2022');
  }

  /**
   * Получение статистики собранных данных
   */
  async getCollectionStats(): Promise<{
    totalFiles: number;
    byType: Record<string, number>;
    byFormat: Record<string, number>;
    downloadDir: string;
  }> {
    const downloadedFiles = await this.fileDownloadService.getDownloadedFiles();

    const stats = {
      totalFiles: downloadedFiles.length,
      byType: { FER: 0, TER: 0, GESN: 0 },
      byFormat: { doc: 0, docx: 0, pdf: 0, csv: 0, xls: 0, xlsx: 0 },
      downloadDir: this.fileDownloadService.getDownloadDir()
    };

    downloadedFiles.forEach(fileName => {
      // Определяем тип по имени файла
      if (fileName.includes('FER') || fileName.includes('фер')) {
        stats.byType.FER++;
      } else if (fileName.includes('TER') || fileName.includes('тер')) {
        stats.byType.TER++;
      } else if (fileName.includes('GESN') || fileName.includes('гэсн')) {
        stats.byType.GESN++;
      }

      // Определяем формат
      const extension = fileName.split('.').pop()?.toLowerCase();
      if (extension && extension in stats.byFormat) {
        stats.byFormat[extension as keyof typeof stats.byFormat]++;
      }
    });

    return stats;
  }
}
