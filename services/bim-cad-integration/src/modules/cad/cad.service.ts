import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../storage/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { DwgParserService } from './services/dwg-parser.service';
import { PdfCadParserService } from './services/pdf-cad-parser.service';
import { CadGeometryService } from './services/cad-geometry.service';
import { ParseCadResponseDto } from './dto/parse-cad-response.dto';
import { CadElementDto } from './dto/cad-element.dto';

@Injectable()
export class CadService {
  private readonly logger = new Logger(CadService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly prismaService: PrismaService,
    private readonly dwgParserService: DwgParserService,
    private readonly pdfCadParserService: PdfCadParserService,
    private readonly cadGeometryService: CadGeometryService,
  ) {}

  async parseDwgFile(file: Express.Multer.File): Promise<ParseCadResponseDto> {
    const drawingId = uuidv4();
    
    try {
      // Save file to storage
      const filePath = await this.storageService.saveFile(file, 'cad/dwg');
      
      // Parse DWG file
      const parseResult = await this.dwgParserService.parseFile(filePath);
      
      // Process geometry for elements
      const processedElements = await Promise.all(
        parseResult.elements.map(async (element) => {
          const processed = await this.cadGeometryService.processElement(element);
          return processed;
        })
      );

      // Save to database
      await this.saveCadDrawing(drawingId, file.originalname, 'DWG', processedElements);

      // Prepare response
      const layers = this.extractLayers(processedElements);
      const elementsByLayer = this.groupElementsByLayer(processedElements);

      return {
        drawingId,
        fileName: file.originalname,
        fileFormat: 'DWG',
        totalElements: processedElements.length,
        layers,
        elementsByLayer,
        elements: processedElements,
        metadata: parseResult.metadata,
        warnings: parseResult.warnings,
      };
    } catch (error) {
      this.logger.error(`Error parsing DWG file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async parsePdfFile(file: Express.Multer.File, extractText?: boolean): Promise<ParseCadResponseDto> {
    const drawingId = uuidv4();
    
    try {
      // Save file to storage
      const filePath = await this.storageService.saveFile(file, 'cad/pdf');
      
      // Parse PDF file
      const parseResult = await this.pdfCadParserService.parseFile(filePath, extractText);
      
      // Process geometry for elements
      const processedElements = await Promise.all(
        parseResult.elements.map(async (element) => {
          const processed = await this.cadGeometryService.processElement(element);
          return processed;
        })
      );

      // Save to database
      await this.saveCadDrawing(drawingId, file.originalname, 'PDF', processedElements);

      // Prepare response
      const layers = this.extractLayers(processedElements);
      const elementsByLayer = this.groupElementsByLayer(processedElements);

      return {
        drawingId,
        fileName: file.originalname,
        fileFormat: 'PDF',
        totalElements: processedElements.length,
        layers,
        elementsByLayer,
        elements: processedElements,
        metadata: parseResult.metadata,
        extractedText: parseResult.extractedText,
        warnings: parseResult.warnings,
      };
    } catch (error) {
      this.logger.error(`Error parsing PDF file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getDrawingElements(drawingId: string): Promise<CadElementDto[]> {
    const elements = await this.prismaService.cadElement.findMany({
      where: { drawingId },
      orderBy: [{ layer: 'asc' }, { elementType: 'asc' }],
    });

    return elements.map((element) => ({
      id: element.id,
      elementType: element.elementType,
      layer: element.layer,
      color: element.color,
      lineType: element.lineType,
      lineWeight: element.lineWeight,
      geometry: element.geometry as any,
      text: element.text,
      bounds: element.bounds as any,
      properties: element.properties as any,
      recognizedAs: element.recognizedAs,
      confidence: element.confidence?.toNumber(),
    }));
  }

  async recognizeDrawingElements(drawingId: string) {
    const elements = await this.getDrawingElements(drawingId);
    
    // Apply AI recognition to categorize elements
    const recognizedElements = await Promise.all(
      elements.map(async (element) => {
        const recognition = await this.cadGeometryService.recognizeElement(element);
        
        // Update element with recognition results
        await this.prismaService.cadElement.update({
          where: { id: element.id },
          data: {
            recognizedAs: recognition.category,
            confidence: recognition.confidence,
          },
        });

        return {
          ...element,
          ...recognition,
        };
      })
    );

    // Group by recognized categories
    const categorySummary = recognizedElements.reduce((acc, element) => {
      const category = element.category || 'Unrecognized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      drawingId,
      recognizedAt: new Date(),
      totalElements: elements.length,
      recognizedElements: recognizedElements.length,
      categorySummary,
      elements: recognizedElements,
    };
  }

  async extractDimensions(drawingId: string) {
    const elements = await this.getDrawingElements(drawingId);
    
    // Extract dimension-related elements
    const dimensionElements = elements.filter(element => 
      element.elementType === 'Text' || 
      element.elementType === 'Dimension' ||
      element.text?.match(/\d+\.?\d*\s*(mm|cm|m|ft|in)/i)
    );

    // Extract measurements
    const measurements = dimensionElements
      .map(element => {
        const match = element.text?.match(/(\d+\.?\d*)\s*(mm|cm|m|ft|in)/i);
        if (match) {
          return {
            value: parseFloat(match[1]),
            unit: match[2].toLowerCase(),
            text: element.text,
            location: element.bounds,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Calculate areas from closed polylines and rectangles
    const areas = await this.cadGeometryService.calculateAreas(elements);

    return {
      drawingId,
      extractedAt: new Date(),
      dimensions: {
        count: measurements.length,
        measurements,
      },
      areas: {
        count: areas.length,
        totalArea: areas.reduce((sum, area) => sum + area.value, 0),
        areas,
      },
    };
  }

  private async saveCadDrawing(
    drawingId: string,
    fileName: string,
    format: 'DWG' | 'PDF',
    elements: CadElementDto[]
  ): Promise<void> {
    // Create drawing record
    await this.prismaService.cadDrawing.create({
      data: {
        id: drawingId,
        fileName,
        format,
        totalElements: elements.length,
      },
    });

    // Save elements
    for (const element of elements) {
      await this.prismaService.cadElement.create({
        data: {
          drawingId,
          elementType: element.elementType,
          layer: element.layer,
          color: element.color,
          lineType: element.lineType,
          lineWeight: element.lineWeight,
          geometry: element.geometry || {},
          text: element.text,
          bounds: element.bounds || {},
          properties: element.properties || {},
          recognizedAs: element.recognizedAs,
          confidence: element.confidence,
        },
      });
    }
  }

  private extractLayers(elements: CadElementDto[]): string[] {
    const layerSet = new Set<string>();
    elements.forEach(element => {
      if (element.layer) {
        layerSet.add(element.layer);
      }
    });
    return Array.from(layerSet).sort();
  }

  private groupElementsByLayer(elements: CadElementDto[]): Record<string, number> {
    return elements.reduce((acc, element) => {
      const layer = element.layer || 'Default';
      acc[layer] = (acc[layer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
