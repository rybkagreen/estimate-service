import { IsString, IsOptional, IsNumber, IsArray, IsUUID, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EstimateStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED'
}

export interface Estimate {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: EstimateStatus;
  version: number;
  totalCost: number;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  overheadCost: number;
  profitMargin: number;
  vatRate: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  tags: string[];
  attachments: Attachment[];
  metadata?: Record<string, any>;
}

export class CreateEstimateDto {
  @ApiProperty({ description: 'Название сметы' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Описание сметы' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID проекта' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ description: 'Статус сметы', enum: EstimateStatus })
  @IsEnum(EstimateStatus)
  status: EstimateStatus;

  @ApiPropertyOptional({ description: 'Валюта', default: 'RUB' })
  @IsOptional()
  @IsString()
  currency?: string = 'RUB';

  @ApiPropertyOptional({ description: 'Метаданные сметы', type: 'object' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateEstimateDto {
  @ApiPropertyOptional({ description: 'Название сметы' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Описание сметы' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Статус сметы', enum: EstimateStatus })
  @IsOptional()
  @IsEnum(EstimateStatus)
  status?: EstimateStatus;

  @ApiPropertyOptional({ description: 'Метаданные сметы', type: 'object' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class EstimateResponseDto {
  @ApiProperty({ description: 'ID сметы' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'ID проекта' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ description: 'Название сметы' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Описание сметы' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Статус сметы', enum: EstimateStatus })
  @IsEnum(EstimateStatus)
  status: EstimateStatus;

  @ApiPropertyOptional({ description: 'Метаданные сметы', type: 'object' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}
