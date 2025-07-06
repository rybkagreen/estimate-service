/**
 * Конфигурация для сбора данных ФСБЦ-2022
 */

export interface DataSourceConfig {
  name: string;
  baseUrl: string;
  enabled: boolean;
  retryAttempts: number;
  timeout: number;
  headers?: Record<string, string>;
}

export const DATA_SOURCES_CONFIG: Record<string, DataSourceConfig> = {
  FER: {
    name: 'Федеральные единичные расценки',
    baseUrl: 'https://www.minstroyrf.ru/trades/normy-i-raschyety/federalnyye-yedinichnyye-rastsenki/',
    enabled: true,
    retryAttempts: 3,
    timeout: 30000,
    headers: {
      'User-Agent': 'FSBC-DataCollector/1.0'
    }
  },
  TER: {
    name: 'Территориальные единичные расценки',
    baseUrl: 'https://www.minstroyrf.ru/trades/normy-i-raschyety/territorialnyye-yedinichnyye-rastsenki/',
    enabled: true,
    retryAttempts: 3,
    timeout: 30000,
    headers: {
      'User-Agent': 'FSBC-DataCollector/1.0'
    }
  },
  GESN: {
    name: 'Государственные элементные сметные нормы',
    baseUrl: 'https://www.minstroyrf.ru/trades/normy-i-raschyety/gosudarstvennyye-elementnyye-smetnyye-normy/',
    enabled: true,
    retryAttempts: 3,
    timeout: 30000,
    headers: {
      'User-Agent': 'FSBC-DataCollector/1.0'
    }
  }
};

// Региональные коэффициенты (примерные значения)
export const REGIONAL_COEFFICIENTS: Record<string, number> = {
  'Московская область': 1.18,
  'Санкт-Петербург': 1.15,
  'Краснодарский край': 0.95,
  'Свердловская область': 1.05,
  'Новосибирская область': 1.10,
  'Татарстан': 1.00,
  'Башкортостан': 0.98,
  'Челябинская область': 1.03,
  'Ростовская область': 0.97,
  'Омская область': 1.02,
  'Самарская область': 1.01,
  'Нижегородская область': 1.04,
  'Воронежская область': 0.96,
  'Волгоградская область': 0.94,
  'Саратовская область': 0.93
};

// Настройки парсинга
export const PARSING_CONFIG = {
  maxConcurrentRequests: 5,
  delayBetweenRequests: 1000,
  maxRetries: 3,
  requestTimeout: 30000,
  userAgent: 'FSBC-DataCollector/1.0 (+https://estimate-service.ru)',
  enableCaching: true,
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 часа
};

// Настройки валидации
export const VALIDATION_CONFIG = {
  requiredFields: ['code', 'name', 'unit'],
  numericFields: ['laborCost', 'materialCost', 'machineCost'],
  maxNameLength: 500,
  maxCodeLength: 50,
  allowedUnits: [
    'м3', 'м2', 'м', 'км', 'т', 'кг', 'шт', 'компл',
    'ч', 'день', '%', 'руб', 'тыс.руб'
  ]
};

// URL-ы для различных разделов
export const SECTION_URLS = {
  FER: {
    chapters: '/chapters',
    search: '/search',
    download: '/download'
  },
  TER: {
    regions: '/regions',
    chapters: '/chapters',
    search: '/search'
  },
  GESN: {
    collections: '/collections',
    chapters: '/chapters',
    materials: '/materials'
  }
};
