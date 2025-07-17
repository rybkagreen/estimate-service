import { ApiProperty } from '@nestjs/swagger';

export class ExtractedEntity {
  @ApiProperty({ description: 'Entity type (e.g., MATERIAL, DIMENSION, EQUIPMENT)' })
  type: string;

  @ApiProperty({ description: 'Entity value' })
  value: string;

  @ApiProperty({ description: 'Confidence score' })
  confidence: number;

  @ApiProperty({ description: 'Context around the entity', required: false })
  context?: string;
}

export class ExtractTextResponseDto {
  @ApiProperty({ description: 'Document ID' })
  documentId: string;

  @ApiProperty({ description: 'Original filename' })
  fileName: string;

  @ApiProperty({ description: 'Extracted raw text' })
  rawText: string;

  @ApiProperty({ description: 'Number of pages processed' })
  pagesProcessed: number;

  @ApiProperty({ description: 'Language detected' })
  language: string;

  @ApiProperty({ description: 'Structured data extracted from text', required: false })
  structuredData?: {
    materials?: string[];
    dimensions?: string[];
    equipment?: string[];
    specifications?: string[];
    quantities?: Array<{
      item: string;
      quantity: number;
      unit: string;
    }>;
  };

  @ApiProperty({ description: 'Named entities extracted by NLP', required: false, type: [ExtractedEntity] })
  entities?: ExtractedEntity[];

  @ApiProperty({ description: 'Processing metadata' })
  metadata: {
    processingTime: number;
    ocrEngine: string;
    nlpProcessed: boolean;
  };
}
