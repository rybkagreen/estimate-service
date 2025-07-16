/**
 * Константы для работы с ФГИС ЦС API
 */

// Базовый URL API ФГИС ЦС
export const FGIS_CS_API_BASE_URL = 'https://fgiscs.minstroyrf.ru/api';

// Эндпоинты API
export const FGIS_CS_ENDPOINTS = {
  OPEN_DATA: '/opendata',
  PRICE_ZONES: '/opendata/7707082071-PriceZones',
  LABOR_COSTS: '/opendata/7707082071-OplataTruda',
  KSR: '/opendata/7707082071-ksr', // Классификатор строительных ресурсов
  FSNB_2020: '/opendata/7707082071-fsnb2020',
  FSNB_2022: '/opendata/7707082071-fsnb2022',
  TECH_GROUPS: '/opendata/7707082071-TechGroups',
  TECH_GROUPS_PARTS: '/opendata/7707082071-TechGroupsPart',
} as const;

// Типы данных ФГИС ЦС
export enum FgisDataType {
  // Классификаторы
  KSR = 'KSR', // Классификатор строительных ресурсов
  
  // Федеральные сметные нормативы
  FSNB_2020 = 'FSNB_2020',
  FSNB_2022 = 'FSNB_2022',
  
  // Государственные элементные сметные нормы
  GESN = 'GESN', // Строительные работы
  GESN_M = 'GESN_M', // Монтаж оборудования
  GESN_MR = 'GESN_MR', // Пусконаладочные работы
  GESN_P = 'GESN_P', // Перевозка грузов
  GESN_R = 'GESN_R', // Ремонтно-строительные работы
  
  // Федеральные сметные базовые цены
  FSBTS_MATERIALS = 'FSBTS_MATERIALS', // Материалы и оборудование
  FSBTS_MACHINES = 'FSBTS_MACHINES', // Эксплуатация машин
  
  // Прочие
  PRICE_ZONES = 'PRICE_ZONES',
  LABOR_COSTS = 'LABOR_COSTS',
  TECH_GROUPS = 'TECH_GROUPS',
  TECH_GROUPS_PARTS = 'TECH_GROUPS_PARTS',
  
  // Отраслевые нормативы (ПССР)
  PSSR_DIAMOND = 'PSSR_DIAMOND', // Алмазодобывающая промышленность
  PSSR_ATOM = 'PSSR_ATOM', // Атомная энергия
  PSSR_ROADS = 'PSSR_ROADS', // Автомобильные дороги
  PSSR_COSMOS = 'PSSR_COSMOS', // Ракетно-космическая промышленность
  PSSR_ELECTRO = 'PSSR_ELECTRO', // Электроэнергетика
  PSSR_OIL = 'PSSR_OIL', // Транспорт нефти
  PSSR_RAILWAY = 'PSSR_RAILWAY', // Железнодорожный транспорт
}

// Форматы файлов данных
export enum FgisDataFormat {
  XML = 'xml',
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx',
}

// Статусы синхронизации данных
export enum FgisSyncStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
}

// Региональные коды (основные)
export const REGION_CODES = {
  MOSCOW: '77',
  SAINT_PETERSBURG: '78',
  MOSCOW_REGION: '50',
  KRASNODAR: '23',
  SVERDLOVSK: '66',
  TATARSTAN: '16',
  DEFAULT: 'default',
} as const;

// Лимиты и настройки
export const FGIS_CS_LIMITS = {
  MAX_ITEMS_PER_REQUEST: 1000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  REQUEST_TIMEOUT_MS: 30000,
  CACHE_TTL_SECONDS: 86400, // 24 часа
  SYNC_BATCH_SIZE: 100,
} as const;

// Коды ошибок
export enum FgisErrorCode {
  API_UNAVAILABLE = 'FGIS_API_UNAVAILABLE',
  INVALID_RESPONSE = 'FGIS_INVALID_RESPONSE',
  PARSE_ERROR = 'FGIS_PARSE_ERROR',
  SYNC_FAILED = 'FGIS_SYNC_FAILED',
  INVALID_DATA_TYPE = 'FGIS_INVALID_DATA_TYPE',
  RATE_LIMIT_EXCEEDED = 'FGIS_RATE_LIMIT_EXCEEDED',
}
