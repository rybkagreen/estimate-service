/**
 * Типы для работы с форматом Гранд Смета
 * Основано на спецификации файлов .gs, .gsp, .gsw
 */
export declare enum GrandSmetaWorkCategory {
    EARTHWORKS = "EARTHWORKS",// Земляные работы
    CONCRETE = "CONCRETE",// Бетонные работы  
    REINFORCEMENT = "REINFORCEMENT",// Арматурные работы
    MASONRY = "MASONRY",// Каменные работы
    STEEL_STRUCTURES = "STEEL_STRUCTURES",// Металлоконструкции
    ROOFING = "ROOFING",// Кровельные работы
    INSULATION = "INSULATION",// Изоляционные работы
    FINISHING = "FINISHING",// Отделочные работы
    ENGINEERING = "ENGINEERING",// Инженерные системы
    LANDSCAPING = "LANDSCAPING"
}
export declare enum ConfidenceLevel {
    HIGH = "HIGH",// Высокая уверенность (>90%)
    MEDIUM = "MEDIUM",// Средняя уверенность (70-90%)
    LOW = "LOW",// Низкая уверенность (50-70%)
    UNCERTAIN = "UNCERTAIN"
}
export declare enum PriceSource {
    FER = "FER",// ФЕР (Федеральные единичные расценки)
    TER = "TER",// ТЕР (Территориальные единичные расценки)
    MARKET = "MARKET",// Рыночные цены
    MANUAL = "MANUAL",// Ручной ввод
    AI_SUGGESTED = "AI_SUGGESTED"
}
export interface UnitOfMeasurement {
    code: string;
    name: string;
    coefficient?: number;
}
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
export interface AiAlternative {
    description: string;
    price: number;
    confidence: ConfidenceLevel;
    source: PriceSource;
    advantages: string[];
    disadvantages: string[];
}
export interface GrandSmetaItem {
    id: string;
    code: string;
    name: string;
    category: GrandSmetaWorkCategory;
    unit: UnitOfMeasurement;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    materialsCost: number;
    laborCost: number;
    mechanismsCost: number;
    priceSource: PriceSource;
    basePrice?: number;
    coefficients?: Record<string, number>;
    aiAnalysis?: AiAnalysis;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
export interface GrandSmetaSection {
    id: string;
    name: string;
    code: string;
    items: GrandSmetaItem[];
    subtotal: number;
    sectionAnalysis?: {
        completeness: number;
        consistencyIssues: string[];
        suggestedAdditions: string[];
    };
}
export interface GrandSmetaDocument {
    id: string;
    name: string;
    objectName: string;
    customer: string;
    contractor?: string;
    projectCode?: string;
    buildingCode?: string;
    region: string;
    climateZone?: string;
    sections: GrandSmetaSection[];
    directCosts: number;
    overheadCosts: number;
    profit: number;
    totalCost: number;
    vatAmount: number;
    totalWithVat: number;
    coefficients: {
        overhead: number;
        profit: number;
        regional: number;
        seasonal: number;
        risk: number;
    };
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
    status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED';
    createdAt: Date;
    updatedAt: Date;
    version: string;
    exportSettings?: {
        format: 'GS' | 'GSP' | 'GSW' | 'XLSX' | 'PDF';
        includeAiAnalysis: boolean;
        includeRecommendations: boolean;
        markUncertainItems: boolean;
    };
}
export interface CreateGrandSmetaDto {
    name: string;
    objectName: string;
    customer: string;
    region: string;
    templateId?: string;
    projectParameters?: {
        area?: number;
        volume?: number;
        floors?: number;
        constructionType?: string;
        complexity?: number;
    };
}
export interface UpdateGrandSmetaItemDto {
    name?: string;
    quantity?: number;
    unitPrice?: number;
    priceSource?: PriceSource;
    manualOverride?: boolean;
    overrideReason?: string;
}
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
export interface AiAssistantSettings {
    autoSuggestions: boolean;
    confidenceThreshold: number;
    enableRiskAnalysis: boolean;
    enableAlternatives: boolean;
    maxAlternatives: number;
    enableCostOptimization: boolean;
    conservativeMode: boolean;
}
export * from './grand-smeta.types';
//# sourceMappingURL=grand-smeta.types.d.ts.map