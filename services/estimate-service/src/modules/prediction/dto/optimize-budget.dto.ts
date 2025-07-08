import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class OptimizeBudgetDto {
  @ApiProperty({ description: 'Current budget amount' })
  @IsNumber()
  @Min(0)
  currentBudget: number;

  @ApiProperty({ description: 'Target savings percentage', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  targetSavingsPercentage?: number;

  @ApiProperty({ description: 'Project ID for context', required: false })
  @IsString()
  @IsOptional()
  projectId?: string;
}
