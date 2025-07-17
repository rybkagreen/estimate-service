import { Injectable, Logger } from '@nestjs/common';
import * as IfcOpenShell from 'web-ifc';
import * as fs from 'fs';
import { BimElementDto } from '../dto/bim-element.dto';

interface ParseResult {
  elements: Partial<BimElementDto>[];
  metadata?: any;
  warnings?: string[];
}

@Injectable()
export class IfcParserService {
  private readonly logger = new Logger(IfcParserService.name);
  private ifcApi: IfcOpenShell.IfcAPI;

  constructor() {
    this.initializeIfcApi();
  }

  private async initializeIfcApi() {
    this.ifcApi = new IfcOpenShell.IfcAPI();
    await this.ifcApi.Init();
  }

  async parseFile(filePath: string): Promise<ParseResult> {
    const warnings: string[] = [];
    const elements: Partial<BimElementDto>[] = [];

    try {
      // Read file content
      const fileContent = await fs.promises.readFile(filePath);
      const data = new Uint8Array(fileContent);

      // Open model
      const modelID = this.ifcApi.OpenModel(data);

      // Get metadata
      const metadata = this.extractMetadata(modelID);

      // Extract all elements
      const allLines = this.ifcApi.GetAllLines(modelID);

      for (const lineID of allLines) {
        try {
          const element = this.extractElement(modelID, lineID);
          if (element) {
            elements.push(element);
          }
        } catch (error) {
          warnings.push(`Failed to parse element ${lineID}: ${error.message}`);
        }
      }

      // Close model
      this.ifcApi.CloseModel(modelID);

      return {
        elements,
        metadata,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      this.logger.error(`Error parsing IFC file: ${error.message}`, error.stack);
      throw new Error(`Failed to parse IFC file: ${error.message}`);
    }
  }

  private extractMetadata(modelID: number): any {
    try {
      const projectInfo = this.ifcApi.GetLineIDsWithType(modelID, IfcOpenShell.IFCPROJECT);
      if (projectInfo.size() > 0) {
        const projectID = projectInfo.get(0);
        const project = this.ifcApi.GetLine(modelID, projectID);
        
        return {
          projectName: project.Name?.value || 'Unknown Project',
          description: project.Description?.value,
          // Additional metadata extraction can be added here
        };
      }
    } catch (error) {
      this.logger.warn(`Failed to extract metadata: ${error.message}`);
    }
    return {};
  }

  private extractElement(modelID: number, lineID: number): Partial<BimElementDto> | null {
    try {
      const line = this.ifcApi.GetLine(modelID, lineID);
      const type = line.__proto__.constructor.name;

      // Filter for relevant element types
      const relevantTypes = [
        'IfcWall', 'IfcWallStandardCase', 'IfcSlab', 'IfcBeam', 'IfcColumn',
        'IfcDoor', 'IfcWindow', 'IfcStair', 'IfcRoof', 'IfcCurtainWall',
        'IfcPlate', 'IfcMember', 'IfcRailing', 'IfcSpace', 'IfcBuildingElementProxy'
      ];

      if (!relevantTypes.some(t => type.includes(t))) {
        return null;
      }

      const element: Partial<BimElementDto> = {
        id: lineID.toString(),
        elementType: this.normalizeElementType(type),
        name: line.Name?.value || `${type}_${lineID}`,
        nativeProperties: {
          ifcType: type,
          globalId: line.GlobalId?.value,
          tag: line.Tag?.value,
        },
      };

      // Extract material
      if (line.Material) {
        element.material = this.extractMaterial(modelID, line.Material);
      }

      // Extract properties
      if (line.IsDefinedBy) {
        element.properties = this.extractProperties(modelID, line.IsDefinedBy);
      }

      // Extract level/storey
      if (line.ContainedInStructure) {
        element.level = this.extractLevel(modelID, line.ContainedInStructure);
      }

      return element;
    } catch (error) {
      this.logger.debug(`Failed to extract element ${lineID}: ${error.message}`);
      return null;
    }
  }

  private normalizeElementType(ifcType: string): string {
    const typeMap = {
      'IfcWall': 'Wall',
      'IfcWallStandardCase': 'Wall',
      'IfcSlab': 'Slab',
      'IfcBeam': 'Beam',
      'IfcColumn': 'Column',
      'IfcDoor': 'Door',
      'IfcWindow': 'Window',
      'IfcStair': 'Stair',
      'IfcRoof': 'Roof',
      'IfcCurtainWall': 'CurtainWall',
      'IfcPlate': 'Plate',
      'IfcMember': 'Member',
      'IfcRailing': 'Railing',
      'IfcSpace': 'Space',
      'IfcBuildingElementProxy': 'GenericElement',
    };

    for (const [key, value] of Object.entries(typeMap)) {
      if (ifcType.includes(key)) {
        return value;
      }
    }

    return 'Unknown';
  }

  private extractMaterial(modelID: number, materialRef: any): string {
    // Simplified material extraction - can be enhanced
    try {
      if (materialRef.value) {
        const material = this.ifcApi.GetLine(modelID, materialRef.value);
        return material.Name?.value || 'Unknown Material';
      }
    } catch (error) {
      this.logger.debug(`Failed to extract material: ${error.message}`);
    }
    return 'Unknown Material';
  }

  private extractProperties(modelID: number, propertyRefs: any): Record<string, any> {
    const properties: Record<string, any> = {};
    
    // Simplified property extraction - can be enhanced
    try {
      if (Array.isArray(propertyRefs)) {
        for (const ref of propertyRefs) {
          if (ref.value) {
            const propSet = this.ifcApi.GetLine(modelID, ref.value);
            if (propSet.HasProperties) {
              // Extract individual properties
              // This is a simplified version - actual implementation would be more complex
              properties[propSet.Name?.value || 'Property'] = true;
            }
          }
        }
      }
    } catch (error) {
      this.logger.debug(`Failed to extract properties: ${error.message}`);
    }

    return properties;
  }

  private extractLevel(modelID: number, structureRef: any): string {
    try {
      if (structureRef && structureRef[0]?.RelatingStructure?.value) {
        const structure = this.ifcApi.GetLine(modelID, structureRef[0].RelatingStructure.value);
        return structure.Name?.value || 'Unknown Level';
      }
    } catch (error) {
      this.logger.debug(`Failed to extract level: ${error.message}`);
    }
    return 'Unknown Level';
  }
}
