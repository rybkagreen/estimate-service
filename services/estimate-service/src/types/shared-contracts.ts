// Временное решение для типов shared-contracts

export enum ConfidenceLevel {
  HIGH = 'HIGH',           // Высокая уверенность (>90%)
  MEDIUM = 'MEDIUM',       // Средняя уверенность (70-90%)
  LOW = 'LOW',             // Низкая уверенность (50-70%)
  UNCERTAIN = 'UNCERTAIN', // Неопределенно (<50%)
}

export enum GrandSmetaWorkCategory {
  EARTHWORKS = 'EARTHWORKS',           // Земляные работы
  CONCRETE = 'CONCRETE',               // Бетонные работы
  REINFORCEMENT = 'REINFORCEMENT',     // Арматурные работы
  MASONRY = 'MASONRY',                 // Каменные работы
  METALWORK = 'METALWORK',             // Металлические конструкции
  ROOFING = 'ROOFING',                 // Кровельные работы
  INSULATION = 'INSULATION',           // Изоляционные работы
  FINISHING = 'FINISHING',             // Отделочные работы
  ENGINEERING = 'ENGINEERING',         // Инженерные системы
  LANDSCAPING = 'LANDSCAPING',         // Благоустройство
}

export enum PriceSource {
  FER = 'FER',             // ФЕР (Федеральные единичные расценки)
  TER = 'TER',             // ТЕР (Территориальные единичные расценки)
  GESN = 'GESN',           // ГЭСН (Государственные элементные сметные нормы)
  ENiR = 'ENiR',           // ЕНиР (Единые нормы и расценки)
  MARKET = 'MARKET',       // Рыночные цены
  COMPANY = 'COMPANY',     // Внутренние расценки компании
}

export interface GrandSmetaItem {
  id: string;
  name: string;
  code: string;
  unit: string | {
    name: string;
    code: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: GrandSmetaWorkCategory;
  source: PriceSource;
  priceSource?: PriceSource; // Для обратной совместимости
  confidence: ConfidenceLevel;
  description?: string;
  notes?: string;
  lastUpdated: Date;
}

export interface AiAssistantResponse {
  success: boolean;
  message?: string;
  action?: string;
  result?: any;
  data?: {
    analysis: string;
    recommendations: string[];
    estimatedCost?: number;
    confidence: ConfidenceLevel;
  };
  confidence?: ConfidenceLevel;
  explanation?: string;
  alternatives?: any[];
  requiresManualReview?: boolean;
  uncertaintyAreas?: any[];
  error?: string;
}

export enum AnalysisType {
  COST_ESTIMATION = 'COST_ESTIMATION',       // Оценка стоимости
  MATERIAL_ANALYSIS = 'MATERIAL_ANALYSIS',   // Анализ материалов
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',       // Оценка рисков
  TIME_ESTIMATION = 'TIME_ESTIMATION',       // Оценка сроков
  OPTIMIZATION = 'OPTIMIZATION',             // Оптимизация
  COMPARISON = 'COMPARISON',                 // Сравнительный анализ
  VALIDATION = 'VALIDATION',                 // Валидация данных
}

export enum ConstructionObjectType {
  RESIDENTIAL = 'RESIDENTIAL',               // Жилая недвижимость
  COMMERCIAL = 'COMMERCIAL',                 // Коммерческая недвижимость
  INDUSTRIAL = 'INDUSTRIAL',                 // Промышленные объекты
  INFRASTRUCTURE = 'INFRASTRUCTURE',         // Инфраструктура
  MIXED_USE = 'MIXED_USE',                   // Многофункциональные объекты
  RENOVATION = 'RENOVATION',                 // Реконструкция
  PUBLIC = 'PUBLIC',                         // Общественные здания
}

export interface AiAnalysis {
  id: string;
  projectId: string;
  analysisType: string;
  results: any;
  confidence: ConfidenceLevel;
  recommendations: any[];
  metadata: any;
  timestamp: Date;
  status: string;
}
