import { ApiProperty } from '@nestjs/swagger';

export class CadElementDto {
  @ApiProperty({ description: 'Unique identifier of the CAD element' })
  id: string;

  @ApiProperty({ description: 'Element type (e.g., Line, Arc, Circle, Polyline, Text)' })
  elementType: string;

  @ApiProperty({ description: 'Layer name' })
  layer: string;

  @ApiProperty({ description: 'Color of the element', required: false })
  color?: string;

  @ApiProperty({ description: 'Line type', required: false })
  lineType?: string;

  @ApiProperty({ description: 'Line weight', required: false })
  lineWeight?: number;

  @ApiProperty({ description: 'Geometry data', required: false })
  geometry?: {
    points?: Array<{ x: number; y: number; z?: number }>;
    center?: { x: number; y: number; z?: number };
    radius?: number;
    startAngle?: number;
    endAngle?: number;
    length?: number;
  };

  @ApiProperty({ description: 'Text content for text elements', required: false })
  text?: string;

  @ApiProperty({ description: 'Element bounds', required: false })
  bounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };

  @ApiProperty({ description: 'Additional properties', required: false })
  properties?: Record<string, any>;

  @ApiProperty({ description: 'Recognized element category by AI', required: false })
  recognizedAs?: string;

  @ApiProperty({ description: 'Confidence score for AI recognition', required: false })
  confidence?: number;
}
