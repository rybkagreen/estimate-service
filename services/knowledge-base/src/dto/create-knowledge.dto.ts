import { IsString, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KnowledgeCategory } from '@prisma/client';

export class CreateKnowledgeDto {
  @ApiProperty({ description: 'Заголовок записи знаний' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Содержание записи знаний' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Краткое описание' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ 
    description: 'Категория знаний',
    enum: KnowledgeCategory,
    example: KnowledgeCategory.TECHNICAL
  })
  @IsEnum(KnowledgeCategory)
  category: KnowledgeCategory;

  @ApiPropertyOptional({ description: 'Подкатегория' })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiPropertyOptional({ 
    description: 'Теги для поиска',
    type: [String],
    example: ['бетон', 'фундамент', 'технология']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Ключевые слова',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ 
    description: 'ID проекта для связи',
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ 
    description: 'Вложения (ссылки или файлы)',
    type: Object
  })
  @IsOptional()
  attachments?: any;

  @ApiPropertyOptional({ 
    description: 'Внешние ссылки',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  externalLinks?: string[];
}
