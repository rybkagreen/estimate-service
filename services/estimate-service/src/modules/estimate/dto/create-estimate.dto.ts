import { IsString, IsOptional, IsNumber, Min, Max, IsUUID } from 'class-validator';
import { IsFSBTSCode, IsValidPrice, IsValidCoefficient, IsValidQuantity } from '../../../common/validators/estimate.validators';
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

@ApiPropertyOptional({ description: 'ФСБЦ-2022 код', example: '01.02.03-123.4567' })
  @IsOptional()
  @IsFSBTSCode()
  fsbtsCode?: string;

  @ApiPropertyOptional({ description: 'Итоговая стоимость', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @IsValidPrice()
  totalCost?: number;

  @ApiPropertyOptional({ description: 'Коэффициент', minimum: 0.01, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @IsValidCoefficient()
  coefficient?: number;

  @ApiPropertyOptional({ description: 'Количество позиций в смете', minimum: 1, maximum: 999999 })
  @IsOptional()
  @IsNumber()
  @IsValidQuantity()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Метаданные сметы' })
  @IsOptional()
  metadata?: Record<string, any>;
}
