import { IsString, IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FeedbackType {
  GENERAL = 'general',
  CORRECTION = 'correction',
  ENHANCEMENT = 'enhancement',
  QUESTION = 'question'
}

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Текст обратной связи' })
  @IsString()
  feedback: string;

  @ApiPropertyOptional({ description: 'Предложение по улучшению' })
  @IsOptional()
  @IsString()
  suggestion?: string;

  @ApiProperty({ 
    description: 'Рейтинг (1-5 звезд)',
    minimum: 1,
    maximum: 5,
    example: 4
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ 
    description: 'Тип обратной связи',
    enum: FeedbackType,
    default: FeedbackType.GENERAL
  })
  @IsOptional()
  @IsEnum(FeedbackType)
  feedbackType?: FeedbackType = FeedbackType.GENERAL;
}
