/**
 * Общие типы для системы сбора данных ФСБЦ-2022
 */

// Базовый интерфейс для всех элементов расценок
export interface BaseRateItem {
  code: string;
  name: string;
  unit: string;
  chapter?: string;
  section?: string;
}

// Интерфейс для стоимостных показателей
export interface CostItem extends BaseRateItem {
  laborCost: number;
  materialCost: number;
  machineCost: number;
  totalCost: number;
}

// Интерфейс для материалов в ГЭСН
export interface MaterialSpec {
  code: string;
  name: string;
  unit: string;
  consumption: number;
  wasteCoefficient?: number;
  category?: string;
}

// Интерфейс для трудозатрат в ГЭСН
export interface LaborSpec {
  category: string; // Разряд работ
  consumption: number; // Затраты труда (чел.-ч)
}

// Интерфейс для машинного времени в ГЭСН
export interface MachineSpec {
  code: string;
  name: string;
  consumption: number; // Время использования (маш.-ч)
}

// Региональные коэффициенты
export interface RegionalCoefficient {
  region: string;
  coefficient: number;
  validFrom: Date;
  validTo?: Date;
}

// Статистика по сбору данных
export interface CollectionStats {
  total: number;
  successful: number;
  failed: number;
  lastUpdate: Date;
  source: string;
}

// Статус валидации
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Категории работ
export enum WorkCategory {
  EARTHWORKS = 'EARTHWORKS',
  FOUNDATIONS = 'FOUNDATIONS',
  MASONRY = 'MASONRY',
  CONCRETE = 'CONCRETE',
  METAL = 'METAL',
  WOOD = 'WOOD',
  ROOFING = 'ROOFING',
  FLOORING = 'FLOORING',
  FINISHING = 'FINISHING',
  PROTECTION = 'PROTECTION',
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  HEATING = 'HEATING',
  VENTILATION = 'VENTILATION',
  ROADS = 'ROADS',
  NETWORKS = 'NETWORKS',
  OTHER = 'OTHER'
}

// Источники данных
export enum DataSource {
  FER = 'FER',
  TER = 'TER',
  GESN = 'GESN',
  MARKET = 'MARKET',
  CUSTOM = 'CUSTOM'
}

// Единицы измерения
export enum MeasurementUnit {
  M3 = 'м3',
  M2 = 'м2',
  M = 'м',
  T = 'т',
  KG = 'кг',
  PIECE = 'шт',
  SET = 'компл',
  HOUR = 'ч',
  DAY = 'день',
  PERCENT = '%'
}
