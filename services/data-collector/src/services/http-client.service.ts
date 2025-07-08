import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { DataSourceConfig, PARSING_CONFIG } from '../config/data-sources.config';

@Injectable()
export class HttpClientService {
  private readonly logger = new Logger(HttpClientService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Выполнить GET запрос с повторными попытками
   */
  async get(url: string, config?: DataSourceConfig): Promise<AxiosResponse | null> {
    const maxRetries = config?.retryAttempts || PARSING_CONFIG.maxRetries;
    const timeout = config?.timeout || PARSING_CONFIG.requestTimeout;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`Запрос ${attempt}/${maxRetries}: ${url}`);

        const response = await firstValueFrom(
          this.httpService.get(url, {
            timeout,
            headers: {
              'User-Agent': PARSING_CONFIG.userAgent,
              ...config?.headers
            },
            // Настройки для работы с различными кодировками
            responseType: 'text',
            maxRedirects: 5,
          })
        );

        if (response.status === 200 && response.data) {
          this.logger.debug(`Успешный запрос: ${url}`);
          return response;
        } else {
          this.logger.warn(`Неожиданный статус ${response.status} для ${url}`);
        }

      } catch (error) {
        this.logger.error(`Попытка ${attempt}/${maxRetries} не удалась для ${url}:`, this.getErrorMessage(error));

        if (attempt === maxRetries) {
          this.logger.error(`Все попытки исчерпаны для ${url}`);
          return null;
        }

        // Задержка перед следующей попыткой
        await this.delay(PARSING_CONFIG.delayBetweenRequests * attempt);
      }
    }

    return null;
  }

  /**
   * Пакетная загрузка URL-ов с контролем конкурентности
   */
  async getBatch(urls: string[], config?: DataSourceConfig): Promise<Map<string, AxiosResponse | null>> {
    const results = new Map<string, AxiosResponse | null>();
    const maxConcurrent = PARSING_CONFIG.maxConcurrentRequests;

    this.logger.log(`Начинаем пакетную загрузку ${urls.length} URL-ов (макс. ${maxConcurrent} одновременно)`);

    for (let i = 0; i < urls.length; i += maxConcurrent) {
      const batch = urls.slice(i, i + maxConcurrent);

      const promises = batch.map(async (url) => {
        const response = await this.get(url, config);
        results.set(url, response);
        return { url, response };
      });

      await Promise.all(promises);

      // Задержка между пакетами
      if (i + maxConcurrent < urls.length) {
        await this.delay(PARSING_CONFIG.delayBetweenRequests);
      }
    }

    this.logger.log(`Пакетная загрузка завершена. Успешно: ${Array.from(results.values()).filter(r => r !== null).length}/${urls.length}`);

    return results;
  }

  /**
   * Проверка доступности URL
   */
  async checkAvailability(url: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.head(url, {
          timeout: 5000,
          headers: {
            'User-Agent': PARSING_CONFIG.userAgent
          }
        })
      );

      return response.status === 200;
    } catch (error) {
      this.logger.debug(`URL недоступен: ${url} - ${this.getErrorMessage(error)}`);
      return false;
    }
  }

  /**
   * Получение размера контента
   */
  async getContentLength(url: string): Promise<number | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.head(url, {
          timeout: 5000,
          headers: {
            'User-Agent': PARSING_CONFIG.userAgent
          }
        })
      );

      const contentLength = response.headers['content-length'];
      return contentLength ? parseInt(contentLength, 10) : null;
    } catch (error) {
      this.logger.debug(`Не удалось получить размер контента для ${url}: ${this.getErrorMessage(error)}`);
      return null;
    }
  }

  /**
   * Задержка
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Извлечение сообщения об ошибке
   */
  private getErrorMessage(error: any): string {
    if (error?.response?.status) {
      return `HTTP ${error.response.status}: ${error.response.statusText}`;
    }

    if (error?.code) {
      return `${error.code}: ${error.message}`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
