import { ApiProperty } from '@nestjs/swagger';
import { BimElementDto } from './bim-element.dto';

export class ParseBimResponseDto {
  @ApiProperty({ description: 'Project ID associated with the parsed file' })
  projectId: string;

  @ApiProperty({ description: 'Original filename' })
  fileName: string;

  @ApiProperty({ description: 'File format (IFC or RVT)' })
  fileFormat: 'IFC' | 'RVT';

  @ApiProperty({ description: 'Total number of elements found' })
  totalElements: number;

  @ApiProperty({ description: 'Elements grouped by type' })
  elementsByType: Record<string, number>;

  @ApiProperty({ description: 'List of parsed BIM elements', type: [BimElementDto] })
  elements: BimElementDto[];

  @ApiProperty({ description: 'Project metadata', required: false })
  metadata?: {
    projectName?: string;
    architect?: string;
    creationDate?: Date;
    software?: string;
    version?: string;
  };

  @ApiProperty({ description: 'Parsing warnings or issues', required: false })
  warnings?: string[];
}
