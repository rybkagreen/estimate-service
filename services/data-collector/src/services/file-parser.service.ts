/**
 * Сервис для парсинга файлов различных форматов (DOC, PDF, CSV)
 */

import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';

// Типы для результатов парсинга
export interface ParsedData {
  content: string;
  metadata?: Record<string, any>;
  tables?: TableData[];
  error?: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  title?: string;
}

export interface FileParseResult {
  success: boolean;
  fileName: string;
  data?: ParsedData;
  error?: string;
}

@Injectable()
export class FileParserService {
  private readonly logger = new Logger(FileParserService.name);

  /**
   * Парсинг файла в зависимости от его расширения
   */
  async parseFile(filePath: string): Promise<FileParseResult> {
    const fileName = path.basename(filePath);
    const extension = path.extname(filePath).toLowerCase();

    try {
      this.logger.log(`Начинаем парсинг файла: ${fileName} (${extension})`);

      if (!await fs.pathExists(filePath)) {
        return {
          success: false,
          fileName,
          error: 'Файл не найден'
        };
      }

      let data: ParsedData;

      switch (extension) {
        case '.doc':
        case '.docx':
          data = await this.parseWordDocument(filePath);
          break;
        case '.pdf':
          data = await this.parsePdfDocument(filePath);
          break;
        case '.csv':
          data = await this.parseCsvDocument(filePath);
          break;
        case '.xls':
        case '.xlsx':
          data = await this.parseExcelDocument(filePath);
          break;
        default:
          return {
            success: false,
            fileName,
            error: `Неподдерживаемый формат файла: ${extension}`
          };
      }

      this.logger.log(`Файл ${fileName} успешно обработан`);

      return {
        success: true,
        fileName,
        data
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      this.logger.error(`Ошибка при парсинге файла ${fileName}: ${errorMessage}`);

      return {
        success: false,
        fileName,
        error: errorMessage
      };
    }
  }

  /**
   * Парсинг Word документов (.doc, .docx)
   */
  private async parseWordDocument(filePath: string): Promise<ParsedData> {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });

      return {
        content: result.value,
        metadata: {
          messages: result.messages,
          parsedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Ошибка парсинга Word документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Парсинг PDF документов
   */
  private async parsePdfDocument(filePath: string): Promise<ParsedData> {
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);

      return {
        content: data.text,
        metadata: {
          pages: data.numpages,
          info: data.info,
          parsedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Ошибка парсинга PDF документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Парсинг CSV файлов
   */
  private async parseCsvDocument(filePath: string): Promise<ParsedData> {
    return new Promise((resolve, reject) => {
      try {
        const csv = require('csv-parser');
        const results: any[] = [];
        let headers: string[] = [];

        fs.createReadStream(filePath)
          .pipe(csv())
          .on('headers', (headerList: string[]) => {
            headers = headerList;
          })
          .on('data', (data: any) => results.push(data))
          .on('end', () => {
            const content = results.map(row =>
              headers.map(header => row[header] || '').join('\t')
            ).join('\n');

            const tableData: TableData = {
              headers,
              rows: results.map(row => headers.map(header => row[header] || ''))
            };

            resolve({
              content,
              tables: [tableData],
              metadata: {
                rows: results.length,
                columns: headers.length,
                parsedAt: new Date().toISOString()
              }
            });
          })
          .on('error', (error: Error) => {
            reject(new Error(`Ошибка парсинга CSV файла: ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`Ошибка парсинга CSV файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`));
      }
    });
  }

  /**
   * Парсинг Excel файлов (.xls, .xlsx)
   */
  private async parseExcelDocument(filePath: string): Promise<ParsedData> {
    try {
      const XLSX = require('xlsx');
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      const tables: TableData[] = [];
      let content = '';

      // Обрабатываем все листы
      for (const sheetName of sheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as string[][];

          tables.push({
            title: sheetName,
            headers: headers.map(h => h?.toString() || ''),
            rows: rows.map(row =>
              headers.map((_, index) => row[index]?.toString() || '')
            )
          });

          // Добавляем содержимое в текстовый формат
          content += `\n--- Лист: ${sheetName} ---\n`;
          content += headers.join('\t') + '\n';
          content += rows.map(row =>
            headers.map((_, index) => row[index]?.toString() || '').join('\t')
          ).join('\n') + '\n';
        }
      }

      return {
        content: content.trim(),
        tables,
        metadata: {
          sheets: sheetNames.length,
          totalRows: tables.reduce((sum, table) => sum + table.rows.length, 0),
          parsedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Ошибка парсинга Excel документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Извлечение структурированных данных из текста
   */
  extractStructuredData(content: string, type: 'FER' | 'TER' | 'GESN'): any[] {
    const data: any[] = [];

    try {
      // Базовые паттерны для извлечения данных
      const patterns = {
        FER: /(\d{2}-\d{2}-\d{3}-\d{2})\s+(.+?)\s+([\d,]+)\s+(руб|₽)/gi,
        TER: /(\d{2}-\d{2}-\d{3}-\d{2})\s+(.+?)\s+([\d,]+)\s+(руб|₽)/gi,
        GESN: /(\d{2}-\d{2}-\d{3})\s+(.+?)\s+([\d,]+)\s+(м³|м²|т|шт)/gi
      };

      const pattern = patterns[type];
      let match;

      while ((match = pattern.exec(content)) !== null) {
        data.push({
          code: match[1],
          name: match[2]?.trim() || '',
          price: parseFloat((match[3]?.replace(',', '.')) || '0'),
          unit: match[4],
          type
        });
      }

      this.logger.log(`Извлечено ${data.length} записей типа ${type}`);
    } catch (error) {
      this.logger.error(`Ошибка при извлечении структурированных данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }

    return data;
  }

  /**
   * Пакетная обработка файлов
   */
  async parseFiles(filePaths: string[]): Promise<FileParseResult[]> {
    const results: FileParseResult[] = [];

    for (const filePath of filePaths) {
      const result = await this.parseFile(filePath);
      results.push(result);
    }

    return results;
  }
}
