import { IsOptional, IsEnum, IsUUID, IsDateString, IsNumber, Min, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EstimateStatus } from '@prisma/client';

export class EstimateFilterDto {
  @ApiPropertyOptional({ description: 'ID проекта' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ 
    description: 'Статус сметы',
    enum: EstimateStatus,
    isArray: true
  })
  @IsOptional()
  @IsEnum(EstimateStatus, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  status?: EstimateStatus[];

  @ApiPropertyOptional({ description: 'ID создателя' })
  @IsOptional()
  @IsUUID()
  createdById?: string;

  @ApiPropertyOptional({ description: 'Дата начала периода' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Дата окончания периода' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Минимальная стоимость' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  minCost?: number;

  @ApiPropertyOptional({ description: 'Максимальная стоимость' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  maxCost?: number;

  @ApiPropertyOptional({ description: 'Поисковый запрос' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Номер страницы', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Размер страницы', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  pageSize?: number = 20;

  @ApiPropertyOptional({ 
    description: 'Поле для сортировки',
    enum: ['name', 'totalCost', 'createdAt', 'updatedAt', 'status']
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Направление сортировки',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
