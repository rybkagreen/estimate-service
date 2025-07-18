import { IsString, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PriceLevel {
  BASE = 'базовый',
  CURRENT = 'текущий',
}

export class GenerateEstimateDto {
  @ApiProperty({ description: 'Project description' })
  @IsString()
  projectDescription: string;

  @ApiProperty({ 
    description: 'Types of work',
    type: [String] 
  })
  @IsArray()
  @IsString({ each: true })
  workTypes: string[];

  @ApiPropertyOptional({ description: 'Project area in square meters' })
  @IsOptional()
  @IsNumber()
  area?: number;

  @ApiPropertyOptional({ description: 'Region' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ 
    description: 'Price level',
    enum: PriceLevel,
    default: PriceLevel.CURRENT 
  })
  @IsOptional()
  @IsEnum(PriceLevel)
  priceLevel?: PriceLevel;
}
