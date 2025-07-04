/**
 * Типы для работы с форматом Гранд Смета
 * Основано на спецификации файлов .gs, .gsp, .gsw
 */

// Основные категории работ в Гранд Смета
export enum GrandSmetaWorkCategory {
  EARTHWORKS = 'EARTHWORKS',           // Земляные работы
  CONCRETE = 'CONCRETE',               // Бетонные работы  
  REINFORCEMENT = 'REINFORCEMENT',     // Арматурные работы
  MASONRY = 'MASONRY',                 // Каменные работы
  STEEL_STRUCTURES = 'STEEL_STRUCTURES', // Металлоконструкции
  ROOFING = 'ROOFING',                 // Кровельные работы
  INSULATION = 'INSULATION',           // Изоляционные работы
  FINISHING = 'FINISHING',             // Отделочные работы
  ENGINEERING = 'ENGINEERING',         // Инженерные системы
  LANDSCAPING = 'LANDSCAPING',         // Благоустройство
}

// Уровень уверенности ИИ
export enum ConfidenceLevel {
  HIGH = 'HIGH',           // Высокая уверенность (>90%)
  MEDIUM = 'MEDIUM',       // Средняя уверенность (70-90%)
  LOW = 'LOW',             // Низкая уверенность (50-70%)
  UNCERTAIN = 'UNCERTAIN', // Неопределенно (<50%)
}

// Источник данных для расценки
export enum PriceSource {
  FER = 'FER',             // ФЕР (Федеральные единичные расценки)
  TER = 'TER',             // ТЕР (Территориальные единичные расценки)
  MARKET = 'MARKET',       // Рыночные цены
  MANUAL = 'MANUAL',       // Ручной ввод
  AI_SUGGESTED = 'AI_SUGGESTED', // Предложено ИИ
}

// Единица измерения
export interface UnitOfMeasurement {
  code: string;            // Код единицы (м3, м2, т, шт и т.д.)
  name: string;            // Наименование единицы
  coefficient?: number;    // Коэффициент перевода
}

// ИИ-анализ позиции сметы
export interface AiAnalysis {
  confidence: ConfidenceLevel;
  suggestedPrice?: number;
  reason: string;
  alternatives: AiAlternative[];
  risks: string[];
  recommendations: string[];
  isManualReviewRequired: boolean;
  uncertaintyFlags: string[];
}

// Альтернативные варианты от ИИ
export interface AiAlternative {
  description: string;
  price: number;
  confidence: ConfidenceLevel;
  source: PriceSource;
  advantages: string[];
  disadvantages: string[];
}

// Позиция сметы в формате Гранд Смета
export interface GrandSmetaItem {
  id: string;
  code: string;                    // Код расценки (например, ФЕР 01-01-001-01)
  name: string;                    // Наименование работ
  category: GrandSmetaWorkCategory;
  unit: UnitOfMeasurement;
  quantity: number;
  
  // Цены и стоимости
  unitPrice: number;               // Цена за единицу
  totalPrice: number;              // Общая стоимость
  materialsCost: number;           // Стоимость материалов
  laborCost: number;               // Стоимость труда
  mechanismsCost: number;          // Стоимость машин и механизмов
  
  // Источник и обоснование
  priceSource: PriceSource;
  basePrice?: number;              // Базовая цена
  coefficients?: Record<string, number>; // Применяемые коэффициенты
  
  // ИИ-анализ
  aiAnalysis?: AiAnalysis;
  
  // Метаданные
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Раздел сметы
export interface GrandSmetaSection {
  id: string;
  name: string;
  code: string;
  items: GrandSmetaItem[];
  subtotal: number;
  
  // ИИ-анализ раздела
  sectionAnalysis?: {
    completeness: number;        // Полнота раздела (0-100%)
    consistencyIssues: string[];
    suggestedAdditions: string[];
  };
}

// Основная смета в формате Гранд Смета
export interface GrandSmetaDocument {
  id: string;
  name: string;
  objectName: string;           // Наименование объекта
  customer: string;             // Заказчик
  contractor?: string;          // Подрядчик
  
  // Метаданные проекта
  projectCode?: string;
  buildingCode?: string;
  region: string;               // Регион строительства
  climateZone?: string;
  
  // Структура сметы
  sections: GrandSmetaSection[];
  
  // Финансовые показатели
  directCosts: number;          // Прямые затраты
  overheadCosts: number;        // Накладные расходы
  profit: number;               // Плановая прибыль
  totalCost: number;           // Общая стоимость
  vatAmount: number;           // НДС
  totalWithVat: number;        // Итого с НДС
  
  // Коэффициенты
  coefficients: {
    overhead: number;           // Коэффициент накладных расходов
    profit: number;            // Коэффициент плановой прибыли
    regional: number;          // Региональный коэффициент
    seasonal: number;          // Сезонный коэффициент
    risk: number;              // Коэффициент риска
  };
  
  // ИИ-анализ всей сметы
  documentAnalysis?: {
    overallConfidence: ConfidenceLevel;
    totalRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    criticalIssues: string[];
    recommendations: string[];
    complianceChecks: {
      normativeCompliance: boolean;
      priceReasonableness: boolean;
      technicalCorrectness: boolean;
    };
  };
  
  // Метаданные документа
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
  version: string;
  
  // Настройки экспорта
  exportSettings?: {
    format: 'GS' | 'GSP' | 'GSW' | 'XLSX' | 'PDF';
    includeAiAnalysis: boolean;
    includeRecommendations: boolean;
    markUncertainItems: boolean;
  };
}

// DTO для создания сметы
export interface CreateGrandSmetaDto {
  name: string;
  objectName: string;
  customer: string;
  region: string;
  templateId?: string;          // ID шаблона для автогенерации
  projectParameters?: {
    area?: number;              // Площадь объекта
    volume?: number;            // Объем работ
    floors?: number;            // Этажность
    constructionType?: string;  // Тип конструкции
    complexity?: number;        // Сложность (1-10)
  };
}

// DTO для обновления позиции сметы
export interface UpdateGrandSmetaItemDto {
  name?: string;
  quantity?: number;
  unitPrice?: number;
  priceSource?: PriceSource;
  manualOverride?: boolean;     // Флаг ручного переопределения
  overrideReason?: string;      // Причина переопределения
}

// Результат валидации сметы
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  itemId?: string;
  sectionId?: string;
  type: 'CRITICAL' | 'ERROR';
  message: string;
  field?: string;
  suggestedFix?: string;
}

export interface ValidationWarning {
  itemId?: string;
  sectionId?: string;
  type: 'WARNING' | 'INFO';
  message: string;
  impact?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ValidationSuggestion {
  itemId?: string;
  sectionId?: string;
  type: 'OPTIMIZATION' | 'ALTERNATIVE';
  message: string;
  potentialSavings?: number;
  implementation?: string;
}

// Результат работы ИИ-ассистента
export interface AiAssistantResponse {
  success: boolean;
  action: 'SUGGEST' | 'VALIDATE' | 'OPTIMIZE' | 'CLASSIFY';
  result: any;
  confidence: ConfidenceLevel;
  explanation: string;
  alternatives?: any[];
  requiresManualReview: boolean;
  uncertaintyAreas: string[];
}

// Настройки ИИ-ассистента
export interface AiAssistantSettings {
  autoSuggestions: boolean;
  confidenceThreshold: number;  // Минимальный порог уверенности
  enableRiskAnalysis: boolean;
  enableAlternatives: boolean;
  maxAlternatives: number;
  enableCostOptimization: boolean;
  conservativeMode: boolean;    // Консервативный режим для критически важных смет
}

// Экспорт типов
export * from './grand-smeta.types';
