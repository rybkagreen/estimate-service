import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DocumentType {
  ESTIMATE = 'смета',
  ACT = 'акт',
  CONTRACT = 'договор',
  SPECIFICATION = 'спецификация',
}

export class AnalyzeEstimateDto {
  @ApiProperty({ description: 'Estimate content text' })
  @IsString()
  estimateContent: string;

  @ApiPropertyOptional({ 
    description: 'Document type',
    enum: DocumentType 
  })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ApiPropertyOptional({ description: 'Region code' })
  @IsOptional()
  @IsString()
  regionCode?: string;

  @ApiPropertyOptional({ description: 'Year of estimate' })
  @IsOptional()
  @IsNumber()
  year?: number;
}
