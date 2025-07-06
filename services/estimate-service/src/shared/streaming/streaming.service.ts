import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { join } from 'path';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';

/**
 * Интерфейс для данных сметы в процессе streaming
 */
export interface EstimateStreamData {
  /** ID сметы */
  id: number;
  /** Наименование сметы */
  name: string;
  /** Общая стоимость */
  totalCost: number;
  /** Позиции сметы */
  items: EstimateItemData[];
  /** Метаданные */
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: number;
    region: string;
  };
}

/**
 * Интерфейс для позиции сметы
 */
export interface EstimateItemData {
  /** ID позиции */
  id: number;
  /** Код ФСБТС */
  fsbtsCode: string;
  /** Наименование работы */
  name: string;
  /** Единица измерения */
  unit: string;
  /** Количество */
  quantity: number;
  /** Стоимость единицы */
  unitCost: number;
  /** Общая стоимость позиции */
  totalCost: number;
  /** Коэффициенты */
  coefficients: Record<string, number>;
}

/**
 * Опции для streaming обработки
 */
export interface StreamingOptions {
  /** Размер chunk'а для обработки (количество позиций) */
  chunkSize?: number;
  /** Формат вывода */
  format?: 'json' | 'csv' | 'xlsx';
  /** Сжатие */
  compression?: boolean;
  /** Прогресс коллбек */
  onProgress?: (processed: number, total: number) => void;
  /** Обработка ошибок */
  onError?: (error: Error) => void;
}

/**
 * Сервис для обработки больших смет с поддержкой streaming
 *
 * Позволяет:
 * - Обрабатывать большие файлы смет без загрузки в память
 * - Экспортировать сметы в различных форматах
 * - Отслеживать прогресс обработки
 * - Streaming импорт/экспорт данных
 *
 * @example
 * ```typescript
 * // Streaming экспорт сметы
 * await this.streamingService.streamEstimateToResponse(
 *   estimateId,
 *   response,
 *   { format: 'json', chunkSize: 1000 }
 * );
 *
 * // Обработка большого файла сметы
 * const result = await this.streamingService.processLargeEstimate(
 *   filePath,
 *   {
 *     chunkSize: 500,
 *     onProgress: (processed, total) => console.log(`${processed}/${total}`)
 *   }
 * );
 * ```
 */
@Injectable()
export class EstimateStreamingService {
  private readonly logger = new Logger(EstimateStreamingService.name);
  private readonly tempDir = join(process.cwd(), 'temp');

  constructor() {
    this.ensureTempDirectory();
  }

  /**
   * Streaming экспорт сметы в HTTP response
   *
   * @param estimateId ID сметы для экспорта
   * @param response HTTP response объект
   * @param options Опции streaming
   *
   * @example
   * ```typescript
   * @Get(':id/export')
   * async exportEstimate(
   *   @Param('id') id: string,
   *   @Res({ passthrough: true }) response: Response
   * ) {
   *   await this.streamingService.streamEstimateToResponse(
   *     parseInt(id, 10),
   *     response,
   *     { format: 'json', compression: true }
   *   );
   * }
   * ```
   */
  async streamEstimateToResponse(
    estimateId: number,
    response: Response,
    options: StreamingOptions = {}
  ): Promise<void> {
    const { format = 'json', compression = false, chunkSize = 1000 } = options;

    try {
      this.logger.log(`Starting streaming export for estimate ${estimateId}`);

      // Устанавливаем заголовки
      this.setResponseHeaders(response, format, compression);

      // Создаем поток для чтения данных сметы
      const estimateStream = await this.createEstimateReadStream(estimateId, chunkSize);

      // Создаем трансформирующий поток для конвертации в нужный формат
      const formatTransform = this.createFormatTransform(format);

      // Создаем поток сжатия если нужно
      const compressionTransform = compression ?
        await import('zlib').then(zlib => zlib.createGzip()) :
        new Transform({
          transform(chunk, _encoding, callback) {
            callback(null, chunk);
          }
        });

      // Настраиваем pipeline
      await pipeline(
        estimateStream,
        formatTransform,
        compressionTransform,
        response
      );

      this.logger.log(`Streaming export completed for estimate ${estimateId}`);
    } catch (error) {
      this.logger.error(`Streaming export failed for estimate ${estimateId}:`, error);

      if (!response.headersSent) {
        response.status(500).json({
          error: 'Streaming export failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      throw error;
    }
  }

  /**
   * Создание потока для чтения данных сметы
   *
   * @param estimateId ID сметы
   * @param chunkSize Размер chunk'а
   * @returns Readable поток с данными сметы
   *
   * @example
   * ```typescript
   * const stream = await this.createEstimateReadStream(123, 500);
   * stream.on('data', (chunk) => console.log('Received chunk:', chunk.length));
   * ```
   */
  async createEstimateReadStream(
    estimateId: number,
    chunkSize: number = 1000
  ): Promise<Readable> {
    let offset = 0;
    let hasMore = true;
    let estimateHeader: Partial<EstimateStreamData> | null = null;

    return new Readable({
      objectMode: true,
      async read() {
        try {
          if (!hasMore) {
            this.push(null); // Завершаем поток
            return;
          }

          // Загружаем заголовок сметы только один раз
          if (!estimateHeader) {
            estimateHeader = await this.fetchEstimateHeader(estimateId);
            this.push({ type: 'header', data: estimateHeader });
          }

          // Загружаем chunk позиций
          const items = await this.fetchEstimateItems(estimateId, offset, chunkSize);

          if (items.length === 0) {
            hasMore = false;
            this.push({ type: 'footer', data: { totalItems: offset } });
            this.push(null);
            return;
          }

          this.push({ type: 'items', data: items, offset, chunkSize });
          offset += items.length;

          // Если получили меньше элементов чем запрашивали, это последний chunk
          if (items.length < chunkSize) {
            hasMore = false;
          }
        } catch (error) {
          this.emit('error', error);
        }
      }
    });
  }

  /**
   * Обработка большого файла сметы с streaming
   *
   * @param filePath Путь к файлу сметы
   * @param options Опции обработки
   * @returns Результат обработки
   *
   * @example
   * ```typescript
   * const result = await this.processLargeEstimate('./large-estimate.json', {
   *   chunkSize: 1000,
   *   onProgress: (processed, total) => {
   *     console.log(`Progress: ${(processed / total * 100).toFixed(1)}%`);
   *   }
   * });
   * ```
   */
  async processLargeEstimate(
    filePath: string,
    options: StreamingOptions = {}
  ): Promise<{
    processed: number;
    errors: string[];
    duration: number;
  }> {
    const startTime = Date.now();
    const { chunkSize = 1000, onProgress, onError } = options;

    let processed = 0;
    let totalItems = 0;
    const errors: string[] = [];

    try {
      this.logger.log(`Starting large estimate processing: ${filePath}`);

      // Создаем поток для чтения файла
      const fileStream = createReadStream(filePath, { encoding: 'utf8' });

      // Создаем поток для парсинга JSON по частям
      const jsonParseTransform = this.createJsonParseTransform();

      // Создаем поток для обработки данных
      const processTransform = new Transform({
        objectMode: true,
        transform: async (chunk: any, _encoding, callback) => {
          try {
            if (chunk.type === 'header') {
              totalItems = chunk.data.metadata?.totalItems || 0;
              this.logger.log(`Processing estimate with ${totalItems} items`);
            } else if (chunk.type === 'items') {
              // Обрабатываем chunk позиций
              await this.processEstimateItemsChunk(chunk.data);
              processed += chunk.data.length;

              if (onProgress) {
                onProgress(processed, totalItems);
              }
            }

            callback(null, chunk);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(errorMessage);

            if (onError) {
              onError(error instanceof Error ? error : new Error(errorMessage));
            }

            callback(); // Продолжаем обработку
          }
        }
      });

      // Выполняем pipeline
      await pipeline(
        fileStream,
        jsonParseTransform,
        processTransform
      );

      const duration = Date.now() - startTime;

      this.logger.log(`Large estimate processing completed: ${processed} items in ${duration}ms`);

      return {
        processed,
        errors,
        duration
      };
    } catch (error) {
      this.logger.error(`Large estimate processing failed:`, error);
      throw error;
    }
  }

  /**
   * Streaming импорт данных сметы из файла
   *
   * @param file Загружаемый файл
   * @param options Опции импорта
   * @returns Promise с результатом импорта
   *
   * @example
   * ```typescript
   * const result = await this.streamingService.importEstimateFromStream(
   *   uploadedFile,
   *   {
   *     chunkSize: 500,
   *     format: 'csv',
   *     onProgress: (progress) => ws.send(JSON.stringify({ progress }))
   *   }
   * );
   * ```
   */
  async importEstimateFromStream(
    file: Express.Multer.File,
    options: StreamingOptions = {}
  ): Promise<{
    estimateId: number;
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    const { chunkSize = 1000, format = 'json', onProgress } = options;

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    try {
      this.logger.log(`Starting streaming import from ${file.originalname}`);

      // Сохраняем временный файл
      const tempPath = join(this.tempDir, `import_${Date.now()}_${file.originalname}`);
      await fs.writeFile(tempPath, file.buffer);

      // Создаем новую смету
      const estimateId = await this.createNewEstimate(file.originalname);

      // Создаем поток для чтения
      const readStream = createReadStream(tempPath);

      // Создаем парсер в зависимости от формата
      const parseTransform = this.createParseTransform(format);

      // Создаем обработчик chunk'ов
      const importTransform = new Transform({
        objectMode: true,
        transform: async (chunk: any[], _encoding, callback) => {
          try {
            const { imported: chunkImported, skipped: chunkSkipped } =
              await this.importEstimateItemsChunk(estimateId, chunk);

            imported += chunkImported;
            skipped += chunkSkipped;

            if (onProgress) {
              onProgress(imported, imported + skipped);
            }

            callback();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(errorMessage);
            skipped += chunk.length;
            callback();
          }
        }
      });

      // Выполняем pipeline
      await pipeline(
        readStream,
        parseTransform,
        importTransform
      );

      // Удаляем временный файл
      await fs.unlink(tempPath).catch(() => {});

      this.logger.log(`Streaming import completed: ${imported} imported, ${skipped} skipped`);

      return {
        estimateId,
        imported,
        skipped,
        errors
      };
    } catch (error) {
      this.logger.error('Streaming import failed:', error);
      throw error;
    }
  }

  /**
   * Создание StreamableFile для скачивания больших смет
   *
   * @param estimateId ID сметы
   * @param format Формат файла
   * @param options Опции генерации
   * @returns StreamableFile для отправки клиенту
   *
   * @example
   * ```typescript
   * @Get(':id/download')
   * async downloadEstimate(@Param('id') id: string): Promise<StreamableFile> {
   *   return this.streamingService.createDownloadStream(
   *     parseInt(id, 10),
   *     'xlsx'
   *   );
   * }
   * ```
   */
  async createDownloadStream(
    estimateId: number,
    format: 'json' | 'csv' | 'xlsx' = 'json',
    options: StreamingOptions = {}
  ): Promise<StreamableFile> {
    const { chunkSize = 1000, compression = false } = options;

    try {
      this.logger.log(`Creating download stream for estimate ${estimateId}`);

      // Создаем временный файл
      const timestamp = Date.now();
      const fileName = `estimate_${estimateId}_${timestamp}.${format}${compression ? '.gz' : ''}`;
      const tempPath = join(this.tempDir, fileName);

      // Создаем поток записи
      const writeStream = createWriteStream(tempPath);

      // Создаем поток данных сметы
      const estimateStream = await this.createEstimateReadStream(estimateId, chunkSize);

      // Создаем трансформер формата
      const formatTransform = this.createFormatTransform(format);

      // Создаем поток сжатия если нужно
      const compressionTransform = compression ?
        await import('zlib').then(zlib => zlib.createGzip()) :
        new Transform({
          transform(chunk, _encoding, callback) {
            callback(null, chunk);
          }
        });

      // Генерируем файл
      await pipeline(
        estimateStream,
        formatTransform,
        compressionTransform,
        writeStream
      );

      // Создаем StreamableFile
      const fileStream = createReadStream(tempPath);

      // Планируем удаление временного файла
      setTimeout(() => {
        fs.unlink(tempPath).catch(() => {});
      }, 60000); // Удаляем через минуту

      return new StreamableFile(fileStream, {
        type: this.getMimeType(format, compression),
        disposition: `attachment; filename="${fileName}"`
      });
    } catch (error) {
      this.logger.error(`Failed to create download stream for estimate ${estimateId}:`, error);
      throw error;
    }
  }

  /**
   * Получение статистики по размеру сметы
   *
   * @param estimateId ID сметы
   * @returns Статистика размера
   *
   * @example
   * ```typescript
   * const stats = await this.streamingService.getEstimateSize(123);
   * console.log(`Estimate has ${stats.totalItems} items, ~${stats.estimatedSizeMB}MB`);
   * ```
   */
  async getEstimateSize(estimateId: number): Promise<{
    totalItems: number;
    estimatedSizeMB: number;
    recommendedChunkSize: number;
    needsStreaming: boolean;
  }> {
    try {
      // Получаем количество позиций
      const totalItems = await this.getEstimateItemsCount(estimateId);

      // Оцениваем размер (примерно 1KB на позицию)
      const estimatedSizeMB = (totalItems * 1024) / (1024 * 1024);

      // Рекомендуемый размер chunk'а
      const recommendedChunkSize = Math.max(100, Math.min(1000, Math.floor(totalItems / 10)));

      // Нужен ли streaming (если больше 10MB или 10000 позиций)
      const needsStreaming = estimatedSizeMB > 10 || totalItems > 10000;

      return {
        totalItems,
        estimatedSizeMB: Math.round(estimatedSizeMB * 100) / 100,
        recommendedChunkSize,
        needsStreaming
      };
    } catch (error) {
      this.logger.error(`Failed to get estimate size for ${estimateId}:`, error);
      throw error;
    }
  }

  // Приватные методы для внутренней логики

  private async ensureTempDirectory(): Promise<void> {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  private setResponseHeaders(
    response: Response,
    format: string,
    compression: boolean
  ): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `estimate_${timestamp}.${format}${compression ? '.gz' : ''}`;

    response.setHeader('Content-Type', this.getMimeType(format, compression));
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.setHeader('Cache-Control', 'no-cache');

    if (compression) {
      response.setHeader('Content-Encoding', 'gzip');
    }
  }

  private getMimeType(format: string, compression: boolean): string {
    const mimeTypes = {
      json: 'application/json',
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    const baseType = mimeTypes[format as keyof typeof mimeTypes] || 'application/octet-stream';

    return compression ? 'application/gzip' : baseType;
  }

  private createFormatTransform(format: string): Transform {
    if (format === 'json') {
      return this.createJsonTransform();
    } else if (format === 'csv') {
      return this.createCsvTransform();
    } else if (format === 'xlsx') {
      return this.createXlsxTransform();
    }

    throw new Error(`Unsupported format: ${format}`);
  }

  private createJsonTransform(): Transform {
    let isFirst = true;

    return new Transform({
      objectMode: true,
      transform(chunk: any, _encoding, callback) {
        try {
          if (chunk.type === 'header') {
            callback(null, '{"estimate":');
            callback(null, JSON.stringify(chunk.data));
            callback(null, ',"items":[');
          } else if (chunk.type === 'items') {
            const items = chunk.data.map((item: any) => JSON.stringify(item));
            const prefix = isFirst ? '' : ',';
            isFirst = false;
            callback(null, prefix + items.join(','));
          } else if (chunk.type === 'footer') {
            callback(null, '],"meta":');
            callback(null, JSON.stringify(chunk.data));
            callback(null, '}');
          }
        } catch (error) {
          callback(error);
        }
      }
    });
  }

  private createCsvTransform(): Transform {
    let headerWritten = false;

    return new Transform({
      objectMode: true,
      transform(chunk: any, _encoding, callback) {
        try {
          if (chunk.type === 'items') {
            const lines: string[] = [];

            if (!headerWritten) {
              // Записываем заголовки CSV
              lines.push('id,fsbtsCode,name,unit,quantity,unitCost,totalCost');
              headerWritten = true;
            }

            // Конвертируем каждую позицию в CSV строку
            chunk.data.forEach((item: EstimateItemData) => {
              lines.push([
                item.id,
                item.fsbtsCode,
                `"${item.name.replace(/"/g, '""')}"`,
                item.unit,
                item.quantity,
                item.unitCost,
                item.totalCost
              ].join(','));
            });

            callback(null, lines.join('\n') + '\n');
          } else {
            callback(); // Пропускаем header и footer для CSV
          }
        } catch (error) {
          callback(error);
        }
      }
    });
  }

  private createXlsxTransform(): Transform {
    // Для XLSX нужна более сложная логика с использованием xlsx библиотеки
    // Пока возвращаем заглушку
    return new Transform({
      objectMode: true,
      transform(chunk: any, _encoding, callback) {
        // TODO: Implement XLSX transformation
        callback(null, 'XLSX format not implemented yet\n');
      }
    });
  }

  private createJsonParseTransform(): Transform {
    return new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        try {
          // Простая реализация парсинга JSON по частям
          // В реальности здесь нужен более сложный parser
          const text = chunk.toString();
          const parsed = JSON.parse(text);
          callback(null, parsed);
        } catch (error) {
          callback(error);
        }
      }
    });
  }

  private createParseTransform(format: string): Transform {
    if (format === 'json') {
      return this.createJsonParseTransform();
    } else if (format === 'csv') {
      return this.createCsvParseTransform();
    }

    throw new Error(`Unsupported import format: ${format}`);
  }

  private createCsvParseTransform(): Transform {
    return new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        try {
          // Простая реализация парсинга CSV
          const text = chunk.toString();
          const lines = text.split('\n');
          const result: any[] = [];

          // Пропускаем заголовок
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
              const values = line.split(',');
              result.push({
                fsbtsCode: values[1],
                name: values[2]?.replace(/"/g, ''),
                unit: values[3],
                quantity: parseFloat(values[4]) || 0,
                unitCost: parseFloat(values[5]) || 0,
              });
            }
          }

          callback(null, result);
        } catch (error) {
          callback(error);
        }
      }
    });
  }

  // Заглушки для методов работы с базой данных
  // В реальной реализации здесь будут вызовы к Repository или Prisma

  private async fetchEstimateHeader(estimateId: number): Promise<Partial<EstimateStreamData>> {
    // TODO: Implement database query
    return {
      id: estimateId,
      name: `Estimate ${estimateId}`,
      totalCost: 0,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        region: 'MSK'
      }
    };
  }

  private async fetchEstimateItems(
    estimateId: number,
    offset: number,
    limit: number
  ): Promise<EstimateItemData[]> {
    // TODO: Implement database query with offset/limit
    // Возвращаем пустой массив для демонстрации
    return [];
  }

  private async getEstimateItemsCount(estimateId: number): Promise<number> {
    // TODO: Implement database query for count
    return 0;
  }

  private async processEstimateItemsChunk(items: EstimateItemData[]): Promise<void> {
    // TODO: Implement business logic for processing items
    this.logger.debug(`Processing chunk of ${items.length} items`);
  }

  private async createNewEstimate(name: string): Promise<number> {
    // TODO: Implement database creation
    return Date.now(); // Временный ID
  }

  private async importEstimateItemsChunk(
    estimateId: number,
    items: any[]
  ): Promise<{ imported: number; skipped: number }> {
    // TODO: Implement database import
    return { imported: items.length, skipped: 0 };
  }
}
