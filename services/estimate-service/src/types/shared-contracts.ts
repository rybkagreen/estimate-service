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
