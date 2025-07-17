import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../storage/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { TextExtractionService } from './services/text-extraction.service';
import { NlpService } from './services/nlp.service';
import { ExtractTextResponseDto } from './dto/extract-text-response.dto';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly prismaService: PrismaService,
    private readonly textExtractionService: TextExtractionService,
    private readonly nlpService: NlpService,
  ) {}

  async extractText(
    file: Express.Multer.File,
    language?: string,
    processNlp?: boolean
  ): Promise<ExtractTextResponseDto> {
    const documentId = uuidv4();
    const startTime = Date.now();

    try {
      // Save file to storage
      const filePath = await this.storageService.saveFile(file, 'ocr');
      
      // Extract text based on file type
      let extractionResult;
      if (file.originalname.toLowerCase().endsWith('.pdf')) {
        extractionResult = await this.textExtractionService.extractFromPdf(filePath, language);
      } else {
        extractionResult = await this.textExtractionService.extractFromImage(filePath, language);
      }

      // Process with NLP if requested
      let structuredData;
      let entities;
      if (processNlp && extractionResult.text) {
        const nlpResult = await this.nlpService.processText(extractionResult.text);
        structuredData = nlpResult.structuredData;
        entities = nlpResult.entities;
      }

      // Save to database
      await this.prismaService.extractedDocument.create({
        data: {
          id: documentId,
          fileName: file.originalname,
          rawText: extractionResult.text,
          pagesProcessed: extractionResult.pagesProcessed || 1,
          language: extractionResult.language || language || 'rus+eng',
          structuredData: structuredData || {},
          entities: entities || [],
          metadata: {
            processingTime: Date.now() - startTime,
            ocrEngine: 'tesseract',
            nlpProcessed: !!processNlp,
          },
        },
      });

      return {
        documentId,
        fileName: file.originalname,
        rawText: extractionResult.text,
        pagesProcessed: extractionResult.pagesProcessed || 1,
        language: extractionResult.language || language || 'rus+eng',
        structuredData,
        entities,
        metadata: {
          processingTime: Date.now() - startTime,
          ocrEngine: 'tesseract',
          nlpProcessed: !!processNlp,
        },
      };
    } catch (error) {
      this.logger.error(`Error extracting text: ${error.message}`, error.stack);
      throw error;
    }
  }

  async extractSpecifications(file: Express.Multer.File) {
    try {
      // Extract text first
      const textResult = await this.extractText(file, 'rus+eng', true);
      
      // Extract specifications from structured data
      const specifications = await this.extractEquipmentSpecifications(textResult);
      
      return {
        documentId: textResult.documentId,
        fileName: file.originalname,
        specifications,
        summary: {
          totalEquipment: specifications.equipment.length,
          totalMaterials: specifications.materials.length,
          totalSpecifications: specifications.technicalSpecs.length,
        },
      };
    } catch (error) {
      this.logger.error(`Error extracting specifications: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async extractEquipmentSpecifications(textResult: ExtractTextResponseDto) {
    const equipment = [];
    const materials = [];
    const technicalSpecs = [];

    // Extract from entities if available
    if (textResult.entities) {
      for (const entity of textResult.entities) {
        switch (entity.type) {
          case 'EQUIPMENT':
            equipment.push({
              name: entity.value,
              confidence: entity.confidence,
              context: entity.context,
            });
            break;
          case 'MATERIAL':
            materials.push({
              name: entity.value,
              confidence: entity.confidence,
              context: entity.context,
            });
            break;
          case 'SPECIFICATION':
            technicalSpecs.push({
              spec: entity.value,
              confidence: entity.confidence,
              context: entity.context,
            });
            break;
        }
      }
    }

    // Extract from structured data
    if (textResult.structuredData) {
      if (textResult.structuredData.equipment) {
        equipment.push(...textResult.structuredData.equipment.map(e => ({ name: e, confidence: 0.8 })));
      }
      if (textResult.structuredData.materials) {
        materials.push(...textResult.structuredData.materials.map(m => ({ name: m, confidence: 0.8 })));
      }
      if (textResult.structuredData.specifications) {
        technicalSpecs.push(...textResult.structuredData.specifications.map(s => ({ spec: s, confidence: 0.8 })));
      }
    }

    // Pattern-based extraction for technical specifications
    const techPatterns = [
      /мощность[:\s]+(\d+\.?\d*)\s*(квт|kw|кВт)/gi,
      /производительность[:\s]+(\d+\.?\d*)\s*([а-я\/]+)/gi,
      /габариты[:\s]+(\d+\.?\d*)\s*[xх]\s*(\d+\.?\d*)\s*[xх]\s*(\d+\.?\d*)/gi,
      /вес[:\s]+(\d+\.?\d*)\s*(кг|т)/gi,
      /напряжение[:\s]+(\d+)\s*(в|V)/gi,
    ];

    for (const pattern of techPatterns) {
      const matches = textResult.rawText.matchAll(pattern);
      for (const match of matches) {
        technicalSpecs.push({
          spec: match[0],
          confidence: 0.9,
          value: match[1],
          unit: match[2],
        });
      }
    }

    return {
      equipment: this.deduplicateItems(equipment),
      materials: this.deduplicateItems(materials),
      technicalSpecs: this.deduplicateItems(technicalSpecs),
    };
  }

  private deduplicateItems(items: any[]) {
    const unique = new Map();
    for (const item of items) {
      const key = typeof item === 'string' ? item : (item.name || item.spec);
      if (!unique.has(key) || (item.confidence > unique.get(key).confidence)) {
        unique.set(key, item);
      }
    }
    return Array.from(unique.values());
  }
}
