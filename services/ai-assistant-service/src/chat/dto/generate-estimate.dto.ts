import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateEstimateDto {
  @ApiProperty({
    description: 'Project description',
    example: 'Капитальный ремонт офисного помещения 200 кв.м'
  })
  @IsString()
  @IsNotEmpty()
  projectDescription: string;

  @ApiProperty({
    description: 'Types of work',
    example: ['демонтаж', 'отделочные работы', 'электромонтаж']
  })
  @IsArray()
  @IsString({ each: true })
  workTypes: string[];

  @ApiProperty({
    description: 'Area in square meters',
    required: false,
    example: 200
  })
  @IsNumber()
  @IsOptional()
  area?: number;

  @ApiProperty({
    description: 'Region',
    required: false,
    example: 'Москва'
  })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({
    description: 'Price level',
    required: false,
    example: 'medium'
  })
  @IsString()
  @IsOptional()
  priceLevel?: string;
}
