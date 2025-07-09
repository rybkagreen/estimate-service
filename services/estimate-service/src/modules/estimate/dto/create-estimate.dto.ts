import { IsString, IsOptional, IsNumber, IsArray, IsEnum, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({ description: 'Валюта расчетов', default: 'RUB' })
  @IsOptional()
  @IsString()
  currency?: string = 'RUB';

  @ApiPropertyOptional({ description: 'Стоимость человеко-часа', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  laborCostPerHour?: number = 0;

  @ApiPropertyOptional({ description: 'Процент накладных расходов', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overheadPercentage?: number = 0;

  @ApiPropertyOptional({ description: 'Процент сметной прибыли', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  profitPercentage?: number = 0;

  @ApiPropertyOptional({ description: 'Метаданные сметы', type: 'object' })
  @IsOptional()
  metadata?: Record<string, any>;
}
