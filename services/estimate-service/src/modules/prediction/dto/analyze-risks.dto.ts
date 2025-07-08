import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class AnalyzeRisksDto {
  @ApiProperty({ description: 'Project ID to analyze', required: false })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ description: 'Budget threshold for risk analysis', required: false })
  @IsNumber()
  @IsOptional()
  budgetThreshold?: number;
}
