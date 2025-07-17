import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../storage/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { IfcParserService } from './services/ifc-parser.service';
import { RvtParserService } from './services/rvt-parser.service';
import { BimGeometryService } from './services/bim-geometry.service';
import { ParseBimResponseDto } from './dto/parse-bim-response.dto';
import { BimElementDto } from './dto/bim-element.dto';

@Injectable()
export class BimService {
  private readonly logger = new Logger(BimService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly prismaService: PrismaService,
    private readonly ifcParserService: IfcParserService,
    private readonly rvtParserService: RvtParserService,
    private readonly bimGeometryService: BimGeometryService,
  ) {}

  async parseIfcFile(file: Express.Multer.File): Promise<ParseBimResponseDto> {
    const projectId = uuidv4();
    
    try {
      // Save file to storage
      const filePath = await this.storageService.saveFile(file, 'bim/ifc');
      
      // Parse IFC file
      const parseResult = await this.ifcParserService.parseFile(filePath);
      
      // Calculate geometry for elements
      const elementsWithGeometry = await Promise.all(
        parseResult.elements.map(async (element) => {
          const geometry = await this.bimGeometryService.calculateGeometry(element);
          return { ...element, ...geometry };
        })
      );

      // Save to database
      await this.saveBimProject(projectId, file.originalname, 'IFC', elementsWithGeometry);

      // Prepare response
      const elementsByType = this.groupElementsByType(elementsWithGeometry);

      return {
        projectId,
        fileName: file.originalname,
        fileFormat: 'IFC',
        totalElements: elementsWithGeometry.length,
        elementsByType,
        elements: elementsWithGeometry,
        metadata: parseResult.metadata,
        warnings: parseResult.warnings,
      };
    } catch (error) {
      this.logger.error(`Error parsing IFC file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async parseRvtFile(file: Express.Multer.File): Promise<ParseBimResponseDto> {
    const projectId = uuidv4();
    
    try {
      // Save file to storage
      const filePath = await this.storageService.saveFile(file, 'bim/rvt');
      
      // Parse RVT file
      const parseResult = await this.rvtParserService.parseFile(filePath);
      
      // Calculate geometry for elements
      const elementsWithGeometry = await Promise.all(
        parseResult.elements.map(async (element) => {
          const geometry = await this.bimGeometryService.calculateGeometry(element);
          return { ...element, ...geometry };
        })
      );

      // Save to database
      await this.saveBimProject(projectId, file.originalname, 'RVT', elementsWithGeometry);

      // Prepare response
      const elementsByType = this.groupElementsByType(elementsWithGeometry);

      return {
        projectId,
        fileName: file.originalname,
        fileFormat: 'RVT',
        totalElements: elementsWithGeometry.length,
        elementsByType,
        elements: elementsWithGeometry,
        metadata: parseResult.metadata,
        warnings: parseResult.warnings,
      };
    } catch (error) {
      this.logger.error(`Error parsing RVT file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getProjectElements(projectId: string): Promise<BimElementDto[]> {
    const elements = await this.prismaService.bimElement.findMany({
      where: { projectId },
      orderBy: { elementType: 'asc' },
    });

    return elements.map((element) => ({
      id: element.id,
      elementType: element.elementType,
      name: element.name,
      material: element.material,
      dimensions: element.dimensions as any,
      volume: element.volume?.toNumber(),
      area: element.area?.toNumber(),
      properties: element.properties as any,
      nativeProperties: element.nativeProperties as any,
      location: element.location as any,
      level: element.level,
    }));
  }

  async extractQuantities(projectId: string) {
    const elements = await this.getProjectElements(projectId);
    
    // Group by element type and material
    const quantities = {};
    
    for (const element of elements) {
      const key = `${element.elementType}_${element.material || 'unknown'}`;
      
      if (!quantities[key]) {
        quantities[key] = {
          elementType: element.elementType,
          material: element.material || 'unknown',
          count: 0,
          totalVolume: 0,
          totalArea: 0,
          units: {
            volume: 'm³',
            area: 'm²',
          },
        };
      }
      
      quantities[key].count += 1;
      quantities[key].totalVolume += element.volume || 0;
      quantities[key].totalArea += element.area || 0;
    }

    return {
      projectId,
      extractedAt: new Date(),
      quantities: Object.values(quantities),
      summary: {
        totalElements: elements.length,
        uniqueTypes: Object.keys(quantities).length,
      },
    };
  }

  private async saveBimProject(
    projectId: string,
    fileName: string,
    format: 'IFC' | 'RVT',
    elements: BimElementDto[]
  ): Promise<void> {
    // Create project record
    await this.prismaService.bimProject.create({
      data: {
        id: projectId,
        fileName,
        format,
        totalElements: elements.length,
      },
    });

    // Save elements
    for (const element of elements) {
      await this.prismaService.bimElement.create({
        data: {
          projectId,
          elementType: element.elementType,
          name: element.name,
          material: element.material,
          dimensions: element.dimensions || {},
          volume: element.volume,
          area: element.area,
          properties: element.properties || {},
          nativeProperties: element.nativeProperties || {},
          location: element.location || {},
          level: element.level,
        },
      });
    }
  }

  private groupElementsByType(elements: BimElementDto[]): Record<string, number> {
    return elements.reduce((acc, element) => {
      acc[element.elementType] = (acc[element.elementType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
