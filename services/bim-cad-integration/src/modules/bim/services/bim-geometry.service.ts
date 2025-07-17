import { Injectable, Logger } from '@nestjs/common';
import { BimElementDto } from '../dto/bim-element.dto';

interface GeometryResult {
  volume?: number;
  area?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    thickness?: number;
  };
}

@Injectable()
export class BimGeometryService {
  private readonly logger = new Logger(BimGeometryService.name);

  async calculateGeometry(element: Partial<BimElementDto>): Promise<GeometryResult> {
    const result: GeometryResult = {};

    try {
      switch (element.elementType) {
        case 'Wall':
          result.dimensions = this.estimateWallDimensions(element);
          result.volume = this.calculateWallVolume(result.dimensions);
          result.area = this.calculateWallArea(result.dimensions);
          break;

        case 'Slab':
        case 'Floor':
          result.dimensions = this.estimateSlabDimensions(element);
          result.volume = this.calculateSlabVolume(result.dimensions);
          result.area = this.calculateSlabArea(result.dimensions);
          break;

        case 'Column':
          result.dimensions = this.estimateColumnDimensions(element);
          result.volume = this.calculateColumnVolume(result.dimensions);
          result.area = this.calculateColumnArea(result.dimensions);
          break;

        case 'Beam':
          result.dimensions = this.estimateBeamDimensions(element);
          result.volume = this.calculateBeamVolume(result.dimensions);
          result.area = this.calculateBeamArea(result.dimensions);
          break;

        case 'Door':
        case 'Window':
          result.dimensions = this.estimateOpeningDimensions(element);
          result.area = this.calculateOpeningArea(result.dimensions);
          break;

        default:
          // For other elements, try to extract from properties
          if (element.nativeProperties?.volume) {
            result.volume = element.nativeProperties.volume;
          }
          if (element.nativeProperties?.area) {
            result.area = element.nativeProperties.area;
          }
      }
    } catch (error) {
      this.logger.warn(`Failed to calculate geometry for element ${element.id}: ${error.message}`);
    }

    return result;
  }

  private estimateWallDimensions(element: Partial<BimElementDto>): any {
    // Default wall dimensions if not provided
    return {
      length: element.nativeProperties?.length || 5.0, // 5m default
      height: element.nativeProperties?.height || 3.0, // 3m default
      thickness: element.nativeProperties?.thickness || 0.2, // 200mm default
    };
  }

  private calculateWallVolume(dimensions: any): number {
    if (dimensions.length && dimensions.height && dimensions.thickness) {
      return dimensions.length * dimensions.height * dimensions.thickness;
    }
    return 0;
  }

  private calculateWallArea(dimensions: any): number {
    if (dimensions.length && dimensions.height) {
      return dimensions.length * dimensions.height;
    }
    return 0;
  }

  private estimateSlabDimensions(element: Partial<BimElementDto>): any {
    return {
      length: element.nativeProperties?.length || 10.0, // 10m default
      width: element.nativeProperties?.width || 8.0, // 8m default
      thickness: element.nativeProperties?.thickness || 0.15, // 150mm default
    };
  }

  private calculateSlabVolume(dimensions: any): number {
    if (dimensions.length && dimensions.width && dimensions.thickness) {
      return dimensions.length * dimensions.width * dimensions.thickness;
    }
    return 0;
  }

  private calculateSlabArea(dimensions: any): number {
    if (dimensions.length && dimensions.width) {
      return dimensions.length * dimensions.width;
    }
    return 0;
  }

  private estimateColumnDimensions(element: Partial<BimElementDto>): any {
    return {
      width: element.nativeProperties?.width || 0.4, // 400mm default
      height: element.nativeProperties?.height || 3.0, // 3m default
      thickness: element.nativeProperties?.depth || 0.4, // 400mm default
    };
  }

  private calculateColumnVolume(dimensions: any): number {
    if (dimensions.width && dimensions.height && dimensions.thickness) {
      // Assuming rectangular column
      return dimensions.width * dimensions.height * dimensions.thickness;
    }
    return 0;
  }

  private calculateColumnArea(dimensions: any): number {
    if (dimensions.width && dimensions.height) {
      // Surface area of column (4 sides)
      return 2 * (dimensions.width + dimensions.thickness) * dimensions.height;
    }
    return 0;
  }

  private estimateBeamDimensions(element: Partial<BimElementDto>): any {
    return {
      length: element.nativeProperties?.length || 6.0, // 6m default
      width: element.nativeProperties?.width || 0.3, // 300mm default
      height: element.nativeProperties?.height || 0.5, // 500mm default
    };
  }

  private calculateBeamVolume(dimensions: any): number {
    if (dimensions.length && dimensions.width && dimensions.height) {
      return dimensions.length * dimensions.width * dimensions.height;
    }
    return 0;
  }

  private calculateBeamArea(dimensions: any): number {
    if (dimensions.length && dimensions.width && dimensions.height) {
      // Surface area of beam
      return 2 * (dimensions.width * dimensions.length + 
                 dimensions.height * dimensions.length + 
                 dimensions.width * dimensions.height);
    }
    return 0;
  }

  private estimateOpeningDimensions(element: Partial<BimElementDto>): any {
    const isDoor = element.elementType === 'Door';
    return {
      width: element.nativeProperties?.width || (isDoor ? 0.9 : 1.2), // Door: 900mm, Window: 1200mm
      height: element.nativeProperties?.height || (isDoor ? 2.1 : 1.5), // Door: 2100mm, Window: 1500mm
    };
  }

  private calculateOpeningArea(dimensions: any): number {
    if (dimensions.width && dimensions.height) {
      return dimensions.width * dimensions.height;
    }
    return 0;
  }
}
