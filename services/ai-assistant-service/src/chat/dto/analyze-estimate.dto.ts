import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeEstimateDto {
  @ApiProperty({
    description: 'The estimate content to analyze',
    example: 'Смета на отделочные работы...'
  })
  @IsString()
  @IsNotEmpty()
  estimateContent: string;

  @ApiProperty({
    description: 'Type of document',
    required: false,
    example: 'detailed_estimate'
  })
  @IsString()
  @IsOptional()
  documentType?: string;

  @ApiProperty({
    description: 'Region code',
    required: false,
    example: '77'
  })
  @IsString()
  @IsOptional()
  regionCode?: string;

  @ApiProperty({
    description: 'Year of the estimate',
    required: false,
    example: 2024
  })
  @IsNumber()
  @IsOptional()
  year?: number;
}
