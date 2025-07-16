import { IsString, IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FgisDataType } from '../constants/fgis-cs.constants';

/**
 * DTO для строительного ресурса из КСР
 */
export class ConstructionResourceDto {
  @ApiProperty({ description: 'Код ресурса' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Наименование ресурса' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Единица измерения' })
  @IsString()
  unit: string;

  @ApiProperty({ description: 'Категория', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Подкатегория', required: false })
  @IsString()
  @IsOptional()
  subcategory?: string;

  @ApiProperty({ description: 'Описание', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * DTO для ценовой зоны
 */
export class PriceZoneDto {
  @ApiProperty({ description: 'Код региона' })
  @IsString()
  regionCode: string;

  @ApiProperty({ description: 'Наименование региона' })
  @IsString()
  regionName: string;

  @ApiProperty({ description: 'Код зоны' })
  @IsString()
  zoneCode: string;

  @ApiProperty({ description: 'Наименование зоны' })
  @IsString()
  zoneName: string;

  @ApiProperty({ description: 'Коэффициент' })
  @IsNumber()
  coefficient: number;
}

/**
 * DTO для данных по оплате труда
 */
export class LaborCostDto {
  @ApiProperty({ description: 'Код региона' })
  @IsString()
  regionCode: string;

  @ApiProperty({ description: 'Наименование региона' })
  @IsString()
  regionName: string;

  @ApiProperty({ description: 'Год' })
  @IsNumber()
  year: number;

  @ApiProperty({ description: 'Месяц' })
  @IsNumber()
  month: number;

  @ApiProperty({ description: 'Средняя зарплата' })
  @IsNumber()
  averageSalary: number;

  @ApiProperty({ description: 'Категория работников' })
  @IsString()
  category: string;
}

/**
 * DTO для данных ФСНБ
 */
export class FSNBDataDto {
  @ApiProperty({ description: 'Код норматива' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Наименование' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Единица измерения' })
  @IsString()
  unit: string;

  @ApiProperty({ description: 'Затраты труда' })
  @IsNumber()
  laborCost: number;

  @ApiProperty({ description: 'Стоимость материалов' })
  @IsNumber()
  materialCost: number;

  @ApiProperty({ description: 'Стоимость эксплуатации машин' })
  @IsNumber()
  machineCost: number;

  @ApiProperty({ description: 'Общая стоимость' })
  @IsNumber()
  totalCost: number;

  @ApiProperty({ description: 'Категория' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Год' })
  @IsString()
  year: string;
}

/**
 * DTO для фильтрации КСР
 */
export class KSRFilterDto {
  @ApiProperty({ description: 'Фильтр по коду', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: 'Фильтр по наименованию', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Фильтр по категории', required: false })
  @IsString()
  @IsOptional()
  category?: string;
}

/**
 * DTO для фильтрации ФСНБ
 */
export class FSNBFilterDto {
  @ApiProperty({ description: 'Фильтр по коду', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: 'Фильтр по категории', required: false })
  @IsString()
  @IsOptional()
  category?: string;
}

/**
 * DTO для результата синхронизации
 */
export class SyncResultDto {
  @ApiProperty({ description: 'Статус синхронизации' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Синхронизированные типы данных' })
  @IsArray()
  @IsEnum(FgisDataType, { each: true })
  syncedTypes: FgisDataType[];

  @ApiProperty({ description: 'Ошибки синхронизации' })
  @IsArray()
  errors: any[];
}

/**
 * DTO для статистики синхронизации
 */
export class SyncStatisticsDto {
  @ApiProperty({ description: 'Количество строительных ресурсов' })
  @IsNumber()
  constructionResources: number;

  @ApiProperty({ description: 'Количество ценовых зон' })
  @IsNumber()
  priceZones: number;

  @ApiProperty({ description: 'Количество записей по оплате труда' })
  @IsNumber()
  laborCosts: number;

  @ApiProperty({ description: 'Количество записей ФСНБ' })
  @IsNumber()
  priceBase: number;

  @ApiProperty({ description: 'Количество записей ГЭСН' })
  @IsNumber()
  gesn: number;

  @ApiProperty({ description: 'Количество материалов' })
  @IsNumber()
  materials: number;

  @ApiProperty({ description: 'Количество машин' })
  @IsNumber()
  machines: number;

  @ApiProperty({ description: 'Количество технологических групп' })
  @IsNumber()
  techGroups: number;

  @ApiProperty({ description: 'Время последней синхронизации' })
  lastSync: Date;
}

/**
 * DTO для ГЭСН данных
 */
export class GESNDataDto {
  @ApiProperty({ description: 'Код норматива' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Наименование' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Единица измерения' })
  @IsString()
  unit: string;

  @ApiProperty({ description: 'Трудозатраты в человеко-часах' })
  @IsNumber()
  laborHours: number;

  @ApiProperty({ description: 'Тип ГЭСН' })
  @IsString()
  type: string;
}

/**
 * DTO для технологической группы
 */
export class TechGroupDto {
  @ApiProperty({ description: 'Код группы' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Наименование группы' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Описание', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Ресурсы группы', required: false })
  @IsArray()
  @IsOptional()
  resources?: any[];
}
