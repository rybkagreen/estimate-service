import { IsBoolean, IsString, IsOptional, IsNumber, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateValidationDto {
  @ApiProperty({ description: 'Валидность записи' })
  @IsBoolean()
  isValid: boolean;

  @ApiPropertyOptional({ 
    description: 'Общий балл валидации (0-100)',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  validationScore?: number;

  @ApiPropertyOptional({ description: 'Комментарий эксперта' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ 
    description: 'Корректировки',
    type: Object
  })
  @IsOptional()
  corrections?: any;

  @ApiPropertyOptional({ 
    description: 'Рекомендации',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendations?: string[];

  @ApiPropertyOptional({ 
    description: 'Оценка технической точности (0-100)',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  accuracyScore?: number;

  @ApiPropertyOptional({ 
    description: 'Оценка полноты контента (0-100)',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completenessScore?: number;

  @ApiPropertyOptional({ 
    description: 'Оценка ясности и читаемости (0-100)',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  clarityScore?: number;

  @ApiPropertyOptional({ 
    description: 'Оценка релевантности категории (0-100)',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  relevanceScore?: number;

  @ApiPropertyOptional({ description: 'Область экспертизы' })
  @IsOptional()
  @IsString()
  expertiseArea?: string;

  @ApiPropertyOptional({ 
    description: 'Требуется ли доработка',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  requiresRevision?: boolean;
}
