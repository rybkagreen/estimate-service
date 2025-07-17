import { ApiProperty } from '@nestjs/swagger';
import { CadElementDto } from './cad-element.dto';

export class ParseCadResponseDto {
  @ApiProperty({ description: 'Drawing ID associated with the parsed file' })
  drawingId: string;

  @ApiProperty({ description: 'Original filename' })
  fileName: string;

  @ApiProperty({ description: 'File format (DWG or PDF)' })
  fileFormat: 'DWG' | 'PDF';

  @ApiProperty({ description: 'Total number of elements found' })
  totalElements: number;

  @ApiProperty({ description: 'Layers found in the drawing' })
  layers: string[];

  @ApiProperty({ description: 'Elements grouped by layer' })
  elementsByLayer: Record<string, number>;

  @ApiProperty({ description: 'List of parsed CAD elements', type: [CadElementDto] })
  elements: CadElementDto[];

  @ApiProperty({ description: 'Drawing metadata', required: false })
  metadata?: {
    units?: string;
    scale?: string;
    author?: string;
    creationDate?: Date;
    software?: string;
    version?: string;
  };

  @ApiProperty({ description: 'Extracted text content', required: false })
  extractedText?: {
    titles?: string[];
    dimensions?: string[];
    notes?: string[];
    specifications?: string[];
  };

  @ApiProperty({ description: 'Parsing warnings or issues', required: false })
  warnings?: string[];
}
