/**
 * @fileoverview Интерфейсы для модуля ФГИС ЦС API
 * @module fgis-cs-api/interfaces
 * @author Команда разработки Estimate Service
 * @since 1.0.0
 */

import { FgisDataType, FgisSyncStatus } from '../constants/fgis-cs.constants';

/**
 * Интерфейс для метаданных набора данных ФГИС ЦС
 * @interface IFgisDatasetMetadata
 * @example
 * ```typescript
 * const metadata: IFgisDatasetMetadata = {
 *   identifier: '7707082071-ksr',
 *   title: 'Классификатор строительных ресурсов',
 *   format: 'csv',
 *   lastUpdated: new Date('2025-07-15')
 * };
 * ```
 */
export interface IFgisDatasetMetadata {
  /** Уникальный идентификатор набора данных */
  identifier: string;
  /** Название набора данных */
  title: string;
  /** Описание набора данных */
  description?: string;
  /** Формат данных (xml, csv, json) */
  format: string;
  /** Дата последнего обновления */
  lastUpdated?: Date;
  /** URL для скачивания данных */
  downloadUrl?: string;
}

/**
 * Интерфейс для элемента реестра ФГИС ЦС
 * @interface IFgisRegistryItem
 */
export interface IFgisRegistryItem {
  /** Код элемента */
  code: string;
  /** Наименование элемента */
  name: string;
  /** Единица измерения */
  unit?: string;
  /** Категория элемента */
  category?: string;
  /** Дополнительные свойства */
  [key: string]: any;
}

/**
 * Интерфейс для результата синхронизации данных
 * @interface IFgisSyncResult
 */
export interface IFgisSyncResult {
  /** Статус синхронизации */
  status: FgisSyncStatus;
  /** Синхронизированные типы данных */
  syncedTypes: FgisDataType[];
  /** Ошибки синхронизации */
  errors: IFgisSyncError[];
  /** Статистика синхронизации */
  statistics?: IFgisSyncStatistics;
}

/**
 * Интерфейс для ошибки синхронизации
 * @interface IFgisSyncError
 */
export interface IFgisSyncError {
  /** Тип данных, при синхронизации которого произошла ошибка */
  type: FgisDataType;
  /** Описание ошибки */
  error: string;
  /** Время возникновения ошибки */
  timestamp?: Date;
}

/**
 * Интерфейс для статистики синхронизации
 * @interface IFgisSyncStatistics
 */
export interface IFgisSyncStatistics {
  /** Общее количество обработанных записей */
  totalRecords: number;
  /** Количество новых записей */
  newRecords: number;
  /** Количество обновленных записей */
  updatedRecords: number;
  /** Количество записей с ошибками */
  failedRecords: number;
  /** Длительность синхронизации в миллисекундах */
  duration: number;
}

/**
 * Интерфейс для региональных коэффициентов
 * @interface IRegionalCoefficients
 * @example
 * ```typescript
 * const moscowCoefficients: IRegionalCoefficients = {
 *   regionCode: '77',
 *   regionName: 'Москва',
 *   laborCoefficient: 1.15,
 *   materialCoefficient: 1.10,
 *   machineCoefficient: 1.12,
 *   overheadCoefficient: 1.18,
 *   profitCoefficient: 1.20
 * };
 * ```
 */
export interface IRegionalCoefficients {
  /** Код региона */
  regionCode: string;
  /** Название региона */
  regionName?: string;
  /** Коэффициент на оплату труда */
  laborCoefficient: number;
  /** Коэффициент на материалы */
  materialCoefficient: number;
  /** Коэффициент на эксплуатацию машин */
  machineCoefficient: number;
  /** Коэффициент на накладные расходы */
  overheadCoefficient: number;
  /** Коэффициент на сметную прибыль */
  profitCoefficient: number;
}

/**
 * Интерфейс для расчета стоимости
 * @interface ICostCalculation
 */
export interface ICostCalculation {
  /** Код расценки */
  code: string;
  /** Количество */
  quantity: number;
  /** Базовая цена */
  basePrice: number;
  /** Затраты на оплату труда */
  laborCost: number;
  /** Стоимость материалов */
  materialCost: number;
  /** Стоимость эксплуатации машин */
  machineCost: number;
  /** Накладные расходы */
  overheadCost: number;
  /** Сметная прибыль */
  profitCost: number;
  /** Общая стоимость */
  totalCost: number;
  /** Примененные коэффициенты */
  appliedCoefficients: Record<string, number>;
}

/**
 * Интерфейс для ресурса в технологической группе
 * @interface ITechGroupResource
 */
export interface ITechGroupResource {
  /** Код ресурса */
  code: string;
  /** Количество ресурса */
  quantity: number;
  /** Единица измерения */
  unit?: string;
}

/**
 * Интерфейс для машино-часов
 * @interface IMachineHours
 */
export interface IMachineHours {
  /** Код машины */
  machineCode: string;
  /** Количество часов */
  hours: number;
  /** Стоимость машино-часа */
  hourlyRate?: number;
}

/**
 * Интерфейс для материалов
 * @interface IMaterial
 */
export interface IMaterial {
  /** Код материала */
  materialCode: string;
  /** Количество */
  quantity: number;
  /** Единица измерения */
  unit?: string;
  /** Цена за единицу */
  price?: number;
}

/**
 * Интерфейс для параметров API запроса
 * @interface IFgisApiParams
 */
export interface IFgisApiParams {
  /** Максимальное количество записей */
  limit?: number;
  /** Смещение для пагинации */
  offset?: number;
  /** Фильтры */
  filter?: Record<string, any>;
  /** Сортировка */
  sort?: string;
  /** Выбираемые поля */
  fields?: string[];
}

/**
 * Интерфейс для ответа API с пагинацией
 * @interface IFgisApiResponse
 * @template T - Тип элементов в ответе
 */
export interface IFgisApiResponse<T> {
  /** Массив данных */
  data: T[];
  /** Общее количество записей */
  total: number;
  /** Количество записей на странице */
  limit: number;
  /** Смещение */
  offset: number;
  /** Есть ли еще данные */
  hasMore: boolean;
}

/**
 * Интерфейс для конфигурации модуля
 * @interface IFgisModuleConfig
 */
export interface IFgisModuleConfig {
  /** URL API ФГИС ЦС */
  apiUrl: string;
  /** API ключ для авторизации */
  apiKey?: string;
  /** Таймаут запроса в миллисекундах */
  requestTimeout?: number;
  /** Максимальное количество повторных попыток */
  maxRetries?: number;
  /** TTL кэша в секундах */
  cacheTTL?: number;
  /** Размер батча для обработки */
  batchSize?: number;
  /** Включить автоматическую синхронизацию */
  enableAutoSync?: boolean;
  /** Расписание синхронизации (cron формат) */
  syncSchedule?: string;
}

/**
 * Интерфейс для задачи синхронизации
 * @interface IFgisSyncTask
 */
export interface IFgisSyncTask {
  /** Идентификатор задачи */
  id: string;
  /** Тип данных для синхронизации */
  type: FgisDataType;
  /** Статус задачи */
  status: FgisSyncStatus;
  /** Время начала */
  startedAt: Date;
  /** Время завершения */
  completedAt?: Date;
  /** Описание ошибки */
  error?: string;
  /** Статистика выполнения */
  statistics?: IFgisSyncStatistics;
}
