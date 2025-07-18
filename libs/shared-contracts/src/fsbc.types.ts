import { z } from 'zod';

/**
 * ФСБЦ-2022 (Федеральная сметная база цен) типы и схемы валидации
 * Единый источник истины для всех сервисов работающих с данными ФСБЦ
 */

// Базовые перечисления
export enum FsbcCategory {
  EARTHWORKS = 'earthworks',
  CONCRETE = 'concrete',
  MASONRY = 'masonry',
  ROOFING = 'roofing',
  FINISHING = 'finishing',
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  HVAC = 'hvac',
  GENERAL = 'general'
}

export enum FsbcDocumentType {
  FER = 'FER',   // Федеральные единичные расценки
  TER = 'TER',   // Территориальные единичные расценки
  GESN = 'GESN', // Государственные элементные сметные нормы
  FSBTS = 'FSBTS', // Федеральная сметная база цен на строительство
  TSN = 'TSN',   // Территориальные сметные нормативы
  UNKNOWN = 'UNKNOWN'
}

export enum FsbcStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
  DEPRECATED = 'DEPRECATED'
}

// Базовая позиция ФСБЦ
export interface FsbcWorkItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  basePrice: number;
  laborCost?: number;
  machineCost?: number;
  materialCost?: number;
  overheadCost?: number;
  profitMargin?: number;
  category: FsbcCategory;
  type: FsbcDocumentType;
  regionCode?: string;
  validFrom: Date;
  validTo?: Date;
  status: FsbcStatus;
  sourceUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Региональные данные
export interface RegionalCoefficient {
  id: string;
  regionCode: string;
  regionName: string;
  coefficient: number;
  category?: FsbcCategory;
  type?: FsbcDocumentType;
  validFrom: Date;
  validTo?: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

// Региональная зона
export interface RegionalZone {
  id: string;
  code: string;
  name: string;
  regionCodes: string[];
  climateZone?: string;
  transportZone?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Схемы валидации Zod
export const FsbcWorkItemSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(500),
  unit: z.string().min(1).max(20),
  basePrice: z.number().min(0),
  laborCost: z.number().min(0).optional(),
  machineCost: z.number().min(0).optional(),
  materialCost: z.number().min(0).optional(),
  overheadCost: z.number().min(0).optional(),
  profitMargin: z.number().min(0).max(100).optional(),
  category: z.nativeEnum(FsbcCategory),
  type: z.nativeEnum(FsbcDocumentType),
  regionCode: z.string().length(2).optional(),
  validFrom: z.date(),
  validTo: z.date().optional(),
  status: z.nativeEnum(FsbcStatus).default(FsbcStatus.ACTIVE),
  sourceUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional()
});

export const RegionalCoefficientSchema = z.object({
  regionCode: z.string().length(2),
  regionName: z.string().min(1).max(255),
  coefficient: z.number().min(0).max(10),
  category: z.nativeEnum(FsbcCategory).optional(),
  type: z.nativeEnum(FsbcDocumentType).optional(),
  validFrom: z.date(),
  validTo: z.date().optional(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional()
});

// DTO для создания/обновления
export interface CreateFsbcWorkItemDto {
  code: string;
  name: string;
  unit: string;
  basePrice: number;
  laborCost?: number;
  machineCost?: number;
  materialCost?: number;
  category: FsbcCategory;
  type: FsbcDocumentType;
  regionCode?: string;
  validFrom?: Date;
  sourceUrl?: string;
}

export interface UpdateFsbcWorkItemDto {
  name?: string;
  unit?: string;
  basePrice?: number;
  laborCost?: number;
  machineCost?: number;
  materialCost?: number;
  category?: FsbcCategory;
  status?: FsbcStatus;
  validTo?: Date;
}

// Фильтры и параметры поиска
export interface FsbcSearchParams {
  query?: string;
  codes?: string[];
  categories?: FsbcCategory[];
  types?: FsbcDocumentType[];
  regionCode?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: FsbcStatus;
  page?: number;
  limit?: number;
  sortBy?: 'code' | 'name' | 'price' | 'date';
  sortOrder?: 'asc' | 'desc';
}

// Результат поиска
export interface FsbcSearchResult {
  items: FsbcWorkItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Агрегированные данные для аналитики
export interface FsbcStatistics {
  totalItems: number;
  itemsByCategory: Record<FsbcCategory, number>;
  itemsByType: Record<FsbcDocumentType, number>;
  averagePrices: {
    overall: number;
    byCategory: Record<FsbcCategory, number>;
    byRegion: Record<string, number>;
  };
  lastUpdated: Date;
}

// Типы для импорта/экспорта
export interface FsbcImportResult {
  success: boolean;
  totalItems: number;
  importedItems: number;
  skippedItems: number;
  errors: string[];
  duration: number;
}

export interface FsbcExportOptions {
  format: 'excel' | 'csv' | 'json' | 'xml';
  categories?: FsbcCategory[];
  types?: FsbcDocumentType[];
  regionCodes?: string[];
  includeMetadata?: boolean;
}
