/**
 * Сервис для работы с внешними API (Гранд-Смета и др.)
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger.js';

export interface ExternalConfig {
  grandSmeta: {
    apiUrl: string;
    apiKey?: string;
  };
}

export interface GrandSmetaItem {
  id: string;
  name: string;
  code?: string;
  unit: string;
  unitPrice: number;
  category: string;
  description?: string;
}

export class ExternalService {
  private config: ExternalConfig;
  private grandSmetaClient: AxiosInstance;
  private isInitialized = false;

  constructor(config: ExternalConfig) {
    this.config = config;

    this.grandSmetaClient = axios.create({
      baseURL: config.grandSmeta.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.grandSmeta.apiKey && {
          'Authorization': `Bearer ${config.grandSmeta.apiKey}`,
        }),
      },
    });
  }

  /**
   * Инициализация внешних сервисов
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🌐 Инициализация внешних сервисов...');

      // Проверяем доступность Гранд-Смета API (если ключ есть)
      if (this.config.grandSmeta.apiKey) {
        await this.validateGrandSmetaConnection();
      }

      this.isInitialized = true;
      logger.info('✅ Внешние сервисы инициализированы');
    } catch (error) {
      logger.error('❌ Ошибка инициализации внешних сервисов:', error);

      // В режиме разработки можем работать без внешних API
      if (process.env.NODE_ENV === 'development') {
        logger.warn('⚠️ Продолжаем работу без внешних API (dev режим)');
        this.isInitialized = true;
      } else {
        throw error;
      }
    }
  }

  /**
   * Проверка подключения к Гранд-Смета API
   */
  private async validateGrandSmetaConnection(): Promise<void> {
    try {
      const response = await this.grandSmetaClient.get('/health');
      if (response.status !== 200) {
        throw new Error(`Неожиданный статус ответа: ${response.status}`);
      }
      logger.debug('✅ Подключение к Гранд-Смета API проверено');
    } catch (error) {
      // Если API недоступен, логируем предупреждение но не падаем
      logger.warn('⚠️ Гранд-Смета API недоступен:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Поиск позиций в Гранд-Смета
   */
  async searchGrandSmetaItems(query: string, category?: string): Promise<GrandSmetaItem[]> {
    if (!this.isInitialized) {
      throw new Error('Внешние сервисы не инициализированы');
    }

    try {
      logger.debug('🔍 Поиск в Гранд-Смета:', { query, category });

      // Если API недоступен, возвращаем мок данные
      if (!this.config.grandSmeta.apiKey || process.env.NODE_ENV === 'development') {
        return this.getMockGrandSmetaItems(query, category);
      }

      const params: any = { q: query };
      if (category) {
        params.category = category;
      }

      const response = await this.grandSmetaClient.get('/search', { params });

      return response.data.items || [];

    } catch (error) {
      logger.error('❌ Ошибка поиска в Гранд-Смета:', error);

      // Возвращаем мок данные при ошибке
      return this.getMockGrandSmetaItems(query, category);
    }
  }

  /**
   * Получение мок данных Гранд-Смета
   */
  private getMockGrandSmetaItems(query: string, category?: string): GrandSmetaItem[] {
    const mockItems: GrandSmetaItem[] = [
      {
        id: 'mock-1',
        name: `Разработка ${query} вручную`,
        code: 'ФЕР01-01-001-01',
        unit: 'м3',
        unitPrice: 850.50,
        category: category || 'earthworks',
        description: `Мок позиция для поиска: ${query}`,
      },
      {
        id: 'mock-2',
        name: `Устройство ${query} механизированным способом`,
        code: 'ФЕР01-01-001-02',
        unit: 'м3',
        unitPrice: 1200.75,
        category: category || 'earthworks',
        description: `Альтернативная мок позиция для: ${query}`,
      },
      {
        id: 'mock-3',
        name: `Транспортировка ${query}`,
        code: 'ФЕР01-01-001-03',
        unit: 'м3',
        unitPrice: 450.25,
        category: 'transport',
        description: `Транспортные работы для: ${query}`,
      },
    ];

    return mockItems.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Получение детальной информации о позиции
   */
  async getGrandSmetaItemDetails(itemId: string): Promise<GrandSmetaItem | null> {
    if (!this.isInitialized) {
      throw new Error('Внешние сервисы не инициализированы');
    }

    try {
      logger.debug('📋 Получение деталей позиции Гранд-Смета:', { itemId });

      // Мок данные для разработки
      if (!this.config.grandSmeta.apiKey || process.env.NODE_ENV === 'development') {
        return {
          id: itemId,
          name: 'Детальная позиция Гранд-Смета',
          code: 'ФЕР01-01-001-DETAIL',
          unit: 'шт',
          unitPrice: 2500.00,
          category: 'detailed',
          description: `Детальное описание позиции ${itemId} с техническими характеристиками`,
        };
      }

      const response = await this.grandSmetaClient.get(`/items/${itemId}`);
      return response.data;

    } catch (error) {
      logger.error('❌ Ошибка получения деталей позиции:', error);
      return null;
    }
  }

  /**
   * Получение актуальных расценок
   */
  async getCurrentPrices(region: string = 'moscow'): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Внешние сервисы не инициализированы');
    }

    try {
      logger.debug('💰 Получение актуальных расценок:', { region });

      // Мок данные
      if (!this.config.grandSmeta.apiKey || process.env.NODE_ENV === 'development') {
        return {
          region,
          updateDate: new Date().toISOString(),
          indexFactor: 1.25,
          categories: {
            earthworks: 1.20,
            concrete: 1.35,
            reinforcement: 1.40,
            finishing: 1.15,
          },
        };
      }

      const response = await this.grandSmetaClient.get(`/prices/${region}`);
      return response.data;

    } catch (error) {
      logger.error('❌ Ошибка получения расценок:', error);
      throw error;
    }
  }

  /**
   * Валидация сметной позиции
   */
  async validateEstimateItem(item: any): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    try {
      logger.debug('✅ Валидация сметной позиции:', { itemName: item.name });

      const issues: string[] = [];
      const suggestions: string[] = [];

      // Базовые проверки
      if (!item.name || item.name.trim().length < 3) {
        issues.push('Наименование позиции слишком короткое');
      }

      if (!item.unit) {
        issues.push('Не указана единица измерения');
      }

      if (!item.unitPrice || item.unitPrice <= 0) {
        issues.push('Некорректная цена за единицу');
        suggestions.push('Проверьте актуальность расценок');
      }

      if (!item.quantity || item.quantity <= 0) {
        issues.push('Некорректное количество');
      }

      // Проверка соответствия нормативам
      if (item.unitPrice > 10000) {
        suggestions.push('Высокая стоимость - требуется дополнительная проверка');
      }

      return {
        isValid: issues.length === 0,
        issues,
        suggestions,
      };

    } catch (error) {
      logger.error('❌ Ошибка валидации позиции:', error);
      return {
        isValid: false,
        issues: ['Ошибка валидации'],
        suggestions: [],
      };
    }
  }

  /**
   * Проверка здоровья внешних сервисов
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'partial' | 'unhealthy';
    services: {
      grandSmeta: 'online' | 'offline' | 'unknown';
    };
  }> {
    const services = {
      grandSmeta: 'unknown' as 'online' | 'offline' | 'unknown',
    };

    try {
      // Проверяем Гранд-Смета API
      if (this.config.grandSmeta.apiKey) {
        try {
          await this.grandSmetaClient.get('/health', { timeout: 5000 });
          services.grandSmeta = 'online';
        } catch {
          services.grandSmeta = 'offline';
        }
      } else {
        services.grandSmeta = 'offline';
      }

      // Определяем общий статус
      const onlineServices = Object.values(services).filter(status => status === 'online').length;
      const totalServices = Object.keys(services).length;

      let status: 'healthy' | 'partial' | 'unhealthy';
      if (onlineServices === totalServices) {
        status = 'healthy';
      } else if (onlineServices > 0) {
        status = 'partial';
      } else {
        status = 'unhealthy';
      }

      return { status, services };

    } catch (error) {
      logger.error('❌ Ошибка проверки здоровья внешних сервисов:', error);
      return {
        status: 'unhealthy',
        services,
      };
    }
  }

  /**
   * Получение статистики использования
   */
  getUsageStats(): {
    requests: number;
    errors: number;
    lastRequest: Date | null;
  } {
    // Здесь можно добавить счетчики запросов
    return {
      requests: 0,
      errors: 0,
      lastRequest: null,
    };
  }

  /**
   * Завершение работы внешних сервисов
   */
  async shutdown(): Promise<void> {
    logger.info('🌐 Завершение работы внешних сервисов...');
    this.isInitialized = false;
    logger.info('✅ Внешние сервисы завершили работу');
  }
}
