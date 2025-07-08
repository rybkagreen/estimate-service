// Интерфейсы для анализа исторических данных

export interface IHistoricalPattern {
  id: string;
  type: PatternType;
  name: string;
  description: string;
  frequency: number; // Частота встречаемости паттерна
  confidence: number; // Уверенность в паттерне (0-1)
  examples: string[]; // ID смет с этим паттерном
  metadata?: Record<string, any>;
}

export enum PatternType {
  ERROR = 'ERROR',
  INEFFICIENCY = 'INEFFICIENCY',
  BEST_PRACTICE = 'BEST_PRACTICE',
  ANOMALY = 'ANOMALY',
  TREND = 'TREND'
}

export interface ITypicalError {
  id: string;
  errorType: ErrorType;
  description: string;
  frequency: number;
  impact: ErrorImpact;
  recommendations: string[];
  affectedItems: string[]; // ID позиций смет
}

export enum ErrorType {
  PRICE_DEVIATION = 'PRICE_DEVIATION',
  QUANTITY_ERROR = 'QUANTITY_ERROR',
  UNIT_MISMATCH = 'UNIT_MISMATCH',
  MISSING_WORK = 'MISSING_WORK',
  DUPLICATE_WORK = 'DUPLICATE_WORK',
  INCORRECT_COEFFICIENT = 'INCORRECT_COEFFICIENT'
}

export enum ErrorImpact {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface IAverageIndicator {
  workType: string;
  workTypeCode: string;
  region: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  standardDeviation: number;
  sampleSize: number;
  lastUpdated: Date;
  unit: string;
  seasonalFactors?: ISeasonalFactor[];
}

export interface ISeasonalFactor {
  month: number;
  factor: number; // Множитель для цены
}

export interface IAnalysisRecommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  impact: string;
  suggestedActions: string[];
  relatedPatterns?: string[]; // ID паттернов
  confidence: number;
}

export enum RecommendationType {
  COST_OPTIMIZATION = 'COST_OPTIMIZATION',
  QUALITY_IMPROVEMENT = 'QUALITY_IMPROVEMENT',
  RISK_MITIGATION = 'RISK_MITIGATION',
  COMPLIANCE = 'COMPLIANCE',
  EFFICIENCY = 'EFFICIENCY'
}

export enum RecommendationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface IAnalysisRequest {
  estimateId?: string;
  workTypes?: string[];
  regions?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  analysisDepth?: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
  includeRecommendations?: boolean;
  includePatterns?: boolean;
  includeErrors?: boolean;
}

export interface IAnalysisResult {
  id: string;
  requestId: string;
  timestamp: Date;
  patterns: IHistoricalPattern[];
  typicalErrors: ITypicalError[];
  averageIndicators: IAverageIndicator[];
  recommendations: IAnalysisRecommendation[];
  summary: IAnalysisSummary;
}

export interface IAnalysisSummary {
  totalEstimatesAnalyzed: number;
  timeRange: {
    from: Date;
    to: Date;
  };
  regionsIncluded: string[];
  workTypesAnalyzed: number;
  patternsIdentified: number;
  errorsFound: number;
  potentialSavings?: number;
  qualityScore?: number; // 0-100
}
