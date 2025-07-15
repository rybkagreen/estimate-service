/**
 * Конфигурация для интеграции с ФСБЦ API
 * (Федеральная сборная база ценников)
 */

export interface FsbcConfig {
  /**
   * URL API ФСБЦ
   */
  apiUrl: string;

  /**
   * API ключ для аутентификации
   */
  apiKey: string;

  /**
   * Секретный ключ для подписи запросов
   */
  apiSecret: string;

  /**
   * Код региона (ОКАТО)
   * @example 77 - Москва, 78 - Санкт-Петербург
   */
  regionCode: string;

  /**
   * Уровень цен
   * - current: текущие цены
   * - base: базовые цены
   */
  priceLevel: 'current' | 'base';

  /**
   * Время кеширования данных в секундах
   * @default 86400 (24 часа)
   */
  cacheTtl: number;

  /**
   * Таймаут запроса в миллисекундах
   * @default 30000 (30 секунд)
   */
  requestTimeout: number;

  /**
   * Максимальное количество попыток повтора запроса
   * @default 3
   */
  maxRetryAttempts: number;

  /**
   * Задержка между попытками в миллисекундах
   * @default 1000 (1 секунда)
   */
  retryDelay: number;
}

/**
 * Коды регионов ФСБЦ согласно ОКАТО
 */
export const FSBC_REGION_CODES = {
  MOSCOW: '77',
  SAINT_PETERSBURG: '78',
  MOSCOW_OBLAST: '50',
  LENINGRAD_OBLAST: '47',
  KRASNODAR_KRAI: '23',
  ROSTOV_OBLAST: '61',
  SVERDLOVSK_OBLAST: '66',
  NOVOSIBIRSK_OBLAST: '54',
  TATARSTAN: '92',
  BASHKORTOSTAN: '80',
} as const;

/**
 * Типы расценок в ФСБЦ
 */
export enum FsbcRateType {
  /** Строительные работы */
  CONSTRUCTION = 'construction',
  /** Монтажные работы */
  INSTALLATION = 'installation',
  /** Пусконаладочные работы */
  COMMISSIONING = 'commissioning',
  /** Ремонтные работы */
  REPAIR = 'repair',
  /** Материалы */
  MATERIALS = 'materials',
  /** Оборудование */
  EQUIPMENT = 'equipment',
  /** Транспорт */
  TRANSPORT = 'transport',
}

/**
 * Структура расценки ФСБЦ
 */
export interface FsbcRate {
  /** Код расценки */
  code: string;
  
  /** Наименование расценки */
  name: string;
  
  /** Единица измерения */
  unit: string;
  
  /** Тип расценки */
  type: FsbcRateType;
  
  /** Стоимость за единицу (руб.) */
  unitPrice: number;
  
  /** Трудозатраты (чел.-час) */
  laborCost?: number;
  
  /** Машины и механизмы (маш.-час) */
  machineryCost?: number;
  
  /** Материалы (руб.) */
  materialsCost?: number;
  
  /** Накладные расходы (%) */
  overheadRate?: number;
  
  /** Сметная прибыль (%) */
  profitRate?: number;
  
  /** Дата актуализации */
  updatedAt: Date;
  
  /** Региональный коэффициент */
  regionalCoefficient?: number;
}

/**
 * Параметры поиска расценок
 */
export interface FsbcSearchParams {
  /** Поисковый запрос */
  query?: string;
  
  /** Код расценки */
  code?: string;
  
  /** Тип расценки */
  type?: FsbcRateType;
  
  /** Код региона */
  regionCode?: string;
  
  /** Уровень цен */
  priceLevel?: 'current' | 'base';
  
  /** Лимит результатов */
  limit?: number;
  
  /** Смещение для пагинации */
  offset?: number;
}

/**
 * Результат поиска расценок
 */
export interface FsbcSearchResult {
  /** Найденные расценки */
  rates: FsbcRate[];
  
  /** Общее количество результатов */
  total: number;
  
  /** Лимит */
  limit: number;
  
  /** Смещение */
  offset: number;
  
  /** Параметры поиска */
  searchParams: FsbcSearchParams;
}

/**
 * Ошибка ФСБЦ API
 */
export class FsbcApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'FsbcApiError';
  }
}

/**
 * Получить конфигурацию ФСБЦ из переменных окружения
 */
export function getFsbcConfig(): FsbcConfig {
  return {
    apiUrl: process.env.FSBC_API_URL || 'https://api.fsbc.ru/v2',
    apiKey: process.env.FSBC_API_KEY || '',
    apiSecret: process.env.FSBC_API_SECRET || '',
    regionCode: process.env.FSBC_REGION_CODE || FSBC_REGION_CODES.MOSCOW,
    priceLevel: (process.env.FSBC_PRICE_LEVEL as 'current' | 'base') || 'current',
    cacheTtl: parseInt(process.env.FSBC_CACHE_TTL || '86400', 10),
    requestTimeout: parseInt(process.env.FSBC_REQUEST_TIMEOUT || '30000', 10),
    maxRetryAttempts: parseInt(process.env.FSBC_MAX_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.FSBC_RETRY_DELAY || '1000', 10),
  };
}
