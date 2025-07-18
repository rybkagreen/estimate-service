import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Estimate, EstimateItem, Project, User } from '@prisma/client';

// Base response class
export class BaseResponseDto<T = any> {
  @ApiProperty({ description: 'Успешность операции' })
  success: boolean;

  @ApiPropertyOptional({ description: 'Сообщение об ошибке или успехе' })
  message?: string;

  @ApiPropertyOptional({ description: 'Данные ответа' })
  data?: T;

  @ApiPropertyOptional({ description: 'Код ошибки' })
  errorCode?: string;
}

// User info for responses
export class UserInfoDto {
  @ApiProperty({ description: 'ID пользователя' })
  id: string;

  @ApiProperty({ description: 'Email пользователя' })
  email: string;

  @ApiPropertyOptional({ description: 'Имя пользователя' })
  firstName?: string | null;

  @ApiPropertyOptional({ description: 'Фамилия пользователя' })
  lastName?: string | null;
}

// Project info for responses
export class ProjectInfoDto {
  @ApiProperty({ description: 'ID проекта' })
  id: string;

  @ApiProperty({ description: 'Название проекта' })
  name: string;

  @ApiProperty({ description: 'Тип проекта' })
  type: string;

  @ApiProperty({ description: 'Статус проекта' })
  status: string;

  @ApiPropertyOptional({ description: 'Локация проекта' })
  location?: string | null;

  @ApiPropertyOptional({ description: 'Код региона' })
  regionCode?: string | null;
}

// Estimate response DTO
export class EstimateResponseDto {
  @ApiProperty({ description: 'ID сметы' })
  id: string;

  @ApiProperty({ description: 'Название сметы' })
  name: string;

  @ApiPropertyOptional({ description: 'Описание сметы' })
  description?: string | null;

  @ApiProperty({ description: 'ID проекта' })
  projectId: string;

  @ApiProperty({ description: 'Информация о проекте' })
  project?: ProjectInfoDto;

  @ApiProperty({ description: 'Статус сметы' })
  status: string;

  @ApiProperty({ description: 'Валюта расчетов' })
  currency: string;

  @ApiProperty({ description: 'Стоимость человеко-часа' })
  laborCostPerHour: number;

  @ApiProperty({ description: 'Процент накладных расходов' })
  overheadPercentage: number;

  @ApiProperty({ description: 'Процент сметной прибыли' })
  profitPercentage: number;

  @ApiProperty({ description: 'Общая стоимость материалов' })
  materialCost: number;

  @ApiProperty({ description: 'Общая стоимость труда' })
  laborCost: number;

  @ApiProperty({ description: 'Накладные расходы' })
  overheadCost: number;

  @ApiProperty({ description: 'Сметная прибыль' })
  profitCost: number;

  @ApiProperty({ description: 'Общая стоимость сметы' })
  totalCost: number;

  @ApiProperty({ description: 'ID создателя' })
  createdById: string;

  @ApiProperty({ description: 'Информация о создателе' })
  createdBy?: UserInfoDto;

  @ApiPropertyOptional({ description: 'ID утверждающего' })
  approvedById?: string | null;

  @ApiPropertyOptional({ description: 'Информация об утверждающем' })
  approvedBy?: UserInfoDto | null;

  @ApiPropertyOptional({ description: 'Дата утверждения' })
  approvedAt?: Date | null;

  @ApiProperty({ description: 'Версия сметы' })
  version: number;

  @ApiPropertyOptional({ description: 'ID родительской сметы' })
  parentId?: string | null;

  @ApiPropertyOptional({ description: 'Позиции сметы' })
  items?: EstimateItem[];

  @ApiPropertyOptional({ description: 'Количество элементов' })
  _count?: {
    items: number;
    versions?: number;
  };

  @ApiPropertyOptional({ description: 'Метаданные' })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;
}

// Paginated response
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Данные', type: [Object] })
  data: T[];

  @ApiProperty({ description: 'Общее количество записей' })
  total: number;

  @ApiProperty({ description: 'Текущая страница' })
  page: number;

  @ApiProperty({ description: 'Размер страницы' })
  pageSize: number;

  @ApiProperty({ description: 'Общее количество страниц' })
  totalPages: number;
}

// Estimate list response
export class EstimateListResponseDto extends PaginatedResponseDto<EstimateResponseDto> {
  @ApiProperty({ description: 'Список смет', type: [EstimateResponseDto] })
  override data: EstimateResponseDto[];
}

// Delete response
export class DeleteResponseDto {
  @ApiProperty({ description: 'Успешность операции' })
  success: boolean;

  @ApiProperty({ description: 'Сообщение' })
  message: string;
}

// Calculate totals response
export class CalculateTotalsResponseDto {
  @ApiProperty({ description: 'Стоимость материалов' })
  materialCost: number;

  @ApiProperty({ description: 'Стоимость труда' })
  laborCost: number;

  @ApiProperty({ description: 'Накладные расходы' })
  overheadCost: number;

  @ApiProperty({ description: 'Сметная прибыль' })
  profitCost: number;

  @ApiProperty({ description: 'Общая стоимость' })
  totalCost: number;

  @ApiProperty({ description: 'Разбивка по категориям' })
  breakdown: {
    materials: number;
    labor: number;
    overhead: number;
    profit: number;
  };
}

// Export format DTO
export class ExportFormatDto {
  @ApiProperty({ 
    description: 'Формат экспорта',
    enum: ['pdf', 'excel', 'json']
  })
  format: 'pdf' | 'excel' | 'json';
}

// Export response DTO
export class ExportResponseDto {
  @ApiProperty({ description: 'Сообщение' })
  message: string;

  @ApiPropertyOptional({ description: 'URL для скачивания' })
  downloadUrl?: string;

  @ApiPropertyOptional({ description: 'Время истечения ссылки' })
  expiresAt?: Date;
}

// Status update DTO
export class UpdateStatusDto {
  @ApiProperty({ 
    description: 'Новый статус',
    enum: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED']
  })
  status: string;
}
