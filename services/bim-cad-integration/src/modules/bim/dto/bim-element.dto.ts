import { ApiProperty } from '@nestjs/swagger';

export class BimElementDto {
  @ApiProperty({ description: 'Unique identifier of the BIM element' })
  id: string;

  @ApiProperty({ description: 'Element type (e.g., Wall, Floor, Column)' })
  elementType: string;

  @ApiProperty({ description: 'Element name' })
  name: string;

  @ApiProperty({ description: 'Material of the element', required: false })
  material?: string;

  @ApiProperty({ description: 'Element dimensions', required: false })
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    thickness?: number;
  };

  @ApiProperty({ description: 'Element volume in cubic meters', required: false })
  volume?: number;

  @ApiProperty({ description: 'Element area in square meters', required: false })
  area?: number;

  @ApiProperty({ description: 'Element properties', required: false })
  properties?: Record<string, any>;

  @ApiProperty({ description: 'IFC or Revit specific properties', required: false })
  nativeProperties?: Record<string, any>;

  @ApiProperty({ description: 'Element location/coordinates', required: false })
  location?: {
    x: number;
    y: number;
    z: number;
  };

  @ApiProperty({ description: 'Building level/floor', required: false })
  level?: string;
}
