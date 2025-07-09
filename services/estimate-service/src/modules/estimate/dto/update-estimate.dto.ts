import { PartialType } from '@nestjs/swagger';
import { CreateEstimateDto } from './create-estimate.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstimateStatus } from '@prisma/client';

export class UpdateEstimateDto extends PartialType(CreateEstimateDto) {
  @ApiPropertyOptional({ 
    description: 'Статус сметы',
    enum: EstimateStatus 
  })
  @IsOptional()
  @IsEnum(EstimateStatus)
  status?: EstimateStatus;
}
