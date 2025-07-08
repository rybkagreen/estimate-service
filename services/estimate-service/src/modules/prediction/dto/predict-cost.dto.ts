import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsDateString, Min, IsNotEmpty } from 'class-validator';

export class PredictCostDto {
  @ApiProperty({ description: 'Project name' })
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @ApiProperty({ description: 'Type of project (residential, commercial, industrial)' })
  @IsString()
  @IsNotEmpty()
  projectType: string;

  @ApiProperty({ description: 'Total area in square meters' })
  @IsNumber()
  @Min(1)
  area: number;

  @ApiProperty({ description: 'Number of floors' })
  @IsNumber()
  @Min(1)
  floors: number;

  @ApiProperty({ description: 'List of materials to be used' })
  @IsArray()
  @IsString({ each: true })
  materials: string[];

  @ApiProperty({ description: 'Project location' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'Project start date' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'Project end date' })
  @IsDateString()
  endDate: Date;
}
