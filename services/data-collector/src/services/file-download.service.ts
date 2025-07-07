/**
 * Сервис для автоматического скачивания файлов
 */

import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { HttpClientService } from '../services/http-client.service';

export interface DownloadConfig {
  url: string;
  fileName: string;
  retryAttempts?: number;
  timeout?: number;
}

export interface DownloadResult {
  success: boolean;
  filePath?: string;
  fileName: string;
  fileSize?: number;
  error?: string;
}

@Injectable()
export class FileDownloadService {
  private readonly logger = new Logger(FileDownloadService.name);
  private readonly downloadDir = path.join(process.cwd(), 'downloads');

  constructor(private httpClientService: HttpClientService) {
    this.ensureDownloadDir();
  }

  /**
   * Скачивание файла по URL
   */
  async downloadFile(config: DownloadConfig): Promise<DownloadResult> {
    const { url, fileName } = config;

    try {
      this.logger.log(`Начинаем скачивание файла: ${fileName} из ${url}`);

      const filePath = path.join(this.downloadDir, fileName);

      // Проверяем, существует ли файл уже
      if (await fs.pathExists(filePath)) {
        const stats = await fs.stat(filePath);
        this.logger.log(`Файл ${fileName} уже существует (${stats.size} байт)`);

        return {
          success: true,
          filePath,
          fileName,
          fileSize: stats.size
        };
      }

      // Скачиваем файл с помощью axios напрямую
      const axios = require('axios');
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 60000,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'FSBC-DataCollector/1.0',
          'Accept': '*/*'
        }
      });

      // Сохраняем файл
      await fs.writeFile(filePath, response.data);

      const stats = await fs.stat(filePath);

      this.logger.log(`Файл ${fileName} успешно скачан (${stats.size} байт)`);

      return {
        success: true,
        filePath,
        fileName,
        fileSize: stats.size
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      this.logger.error(`Ошибка при скачивании ${fileName}: ${errorMessage}`);

      return {
        success: false,
        fileName,
        error: errorMessage
      };
    }
  }

  /**
   * Массовое скачивание файлов
   */
  async downloadFiles(configs: DownloadConfig[]): Promise<DownloadResult[]> {
    const results: DownloadResult[] = [];

    for (const config of configs) {
      const result = await this.downloadFile(config);
      results.push(result);

      // Небольшая пауза между скачиваниями
      await this.delay(1000);
    }

    return results;
  }

  /**
   * Получить список скачанных файлов
   */
  async getDownloadedFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.downloadDir);
      return files.filter((file: string) =>
        file.endsWith('.doc') ||
        file.endsWith('.docx') ||
        file.endsWith('.pdf') ||
        file.endsWith('.csv') ||
        file.endsWith('.xls') ||
        file.endsWith('.xlsx')
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      this.logger.error(`Ошибка при чтении директории загрузок: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Удаление старых файлов
   */
  async cleanupOldFiles(maxAgeHours: number = 168): Promise<number> { // 7 дней по умолчанию
    try {
      const files = await fs.readdir(this.downloadDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.downloadDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          await fs.remove(filePath);
          deletedCount++;
          this.logger.log(`Удален старый файл: ${file}`);
        }
      }

      return deletedCount;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      this.logger.error(`Ошибка при очистке старых файлов: ${errorMessage}`);
      return 0;
    }
  }

  /**
   * Получить путь к директории загрузок
   */
  getDownloadDir(): string {
    return this.downloadDir;
  }

  /**
   * Создание директории для загрузок, если не существует
   */
  private async ensureDownloadDir(): Promise<void> {
    try {
      await fs.ensureDir(this.downloadDir);
      this.logger.log(`Директория загрузок: ${this.downloadDir}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      this.logger.error(`Ошибка при создании директории загрузок: ${errorMessage}`);
    }
  }

  /**
   * Задержка
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
