import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { OcrService } from '../ocr/ocr.service';
import { VirusScanService } from '../virus-scan/virus-scan.service';
import * as xlsx from 'xlsx';
import * as pdf from 'pdf-parse';
import * as fs from 'fs';
import * as path from 'path';

export interface ProcessedFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageUrl: string;
  processedData?: any;
  metadata?: Record<string, any>;
  isScanned: boolean;
  scanResult?: string;
}

@Injectable()
export class FileProcessorService {
  private readonly logger = new Logger(FileProcessorService.name);
  private readonly supportedFormats = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/pdf', // .pdf
    'application/octet-stream', // .gge, .gsfx
  ];

  constructor(
    private readonly storageService: StorageService,
    private readonly ocrService: OcrService,
    private readonly virusScanService: VirusScanService,
  ) {}

  /**
   * Process uploaded file
   */
  async processFile(file: Express.Multer.File): Promise<ProcessedFile> {
    try {
      // Validate file format
      this.validateFileFormat(file);

      // Scan for viruses
      const scanResult = await this.virusScanService.scanFile(file.buffer);
      if (!scanResult.clean) {
        throw new BadRequestException(`File is infected: ${scanResult.threat}`);
      }

      // Store file
      const storageResult = await this.storageService.uploadFile(file);

      // Process based on file type
      let processedData: any = null;
      
      if (this.isExcelFile(file)) {
        processedData = await this.processExcel(file);
      } else if (this.isPdfFile(file)) {
        processedData = await this.processPdf(file);
      } else if (this.isGrandSmetaFile(file)) {
        processedData = await this.processGrandSmeta(file);
      }

      return {
        id: storageResult.id,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageUrl: storageResult.url,
        processedData,
        metadata: {
          uploadedAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        },
        isScanned: true,
        scanResult: 'clean',
      };
    } catch (error) {
      this.logger.error('Error processing file:', error);
      throw error;
    }
  }

  /**
   * Validate file format
   */
  private validateFileFormat(file: Express.Multer.File): void {
    const extension = path.extname(file.originalname).toLowerCase();
    const validExtensions = ['.xlsx', '.xls', '.pdf', '.gge', '.gsfx'];
    
    if (!validExtensions.includes(extension)) {
      throw new BadRequestException(`Unsupported file format: ${extension}`);
    }

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 100MB limit');
    }
  }

  /**
   * Process Excel file
   */
  private async processExcel(file: Express.Multer.File): Promise<any> {
    try {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const result: any = {};

      // Process each sheet
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        result[sheetName] = xlsx.utils.sheet_to_json(sheet, { 
          header: 1,
          defval: '',
          blankrows: false 
        });
      }

      // Extract estimate data if possible
      const estimateData = this.extractEstimateDataFromExcel(result);
      
      return {
        type: 'excel',
        sheets: workbook.SheetNames,
        data: result,
        estimateData,
      };
    } catch (error) {
      this.logger.error('Error processing Excel file:', error);
      throw new BadRequestException('Failed to process Excel file');
    }
  }

  /**
   * Process PDF file
   */
  private async processPdf(file: Express.Multer.File): Promise<any> {
    try {
      const data = await pdf(file.buffer);
      
      // Check if PDF contains images that need OCR
      const hasImages = data.numpages > 0 && data.text.trim().length < 100;
      let ocrText = '';
      
      if (hasImages) {
        this.logger.log('PDF appears to be scanned, running OCR...');
        ocrText = await this.ocrService.extractText(file.buffer, 'pdf');
      }

      return {
        type: 'pdf',
        pages: data.numpages,
        text: data.text || ocrText,
        metadata: data.info,
        isScanned: hasImages,
        ocrApplied: hasImages,
      };
    } catch (error) {
      this.logger.error('Error processing PDF file:', error);
      throw new BadRequestException('Failed to process PDF file');
    }
  }

  /**
   * Process Grand Smeta files (.gge, .gsfx)
   */
  private async processGrandSmeta(file: Express.Multer.File): Promise<any> {
    try {
      // These are proprietary formats, so we'll need special handling
      // For now, we'll store the file and mark it for manual processing
      const extension = path.extname(file.originalname).toLowerCase();
      
      return {
        type: 'grand-smeta',
        format: extension,
        message: 'Grand Smeta file stored for processing',
        requiresSpecializedParser: true,
        metadata: {
          originalName: file.originalname,
          size: file.size,
        },
      };
    } catch (error) {
      this.logger.error('Error processing Grand Smeta file:', error);
      throw new BadRequestException('Failed to process Grand Smeta file');
    }
  }

  /**
   * Extract estimate data from Excel
   */
  private extractEstimateDataFromExcel(excelData: any): any {
    try {
      const estimateItems = [];
      
      // Look for common estimate patterns in sheets
      for (const [sheetName, sheetData] of Object.entries(excelData)) {
        if (!Array.isArray(sheetData)) continue;
        
        // Find header row (usually contains keywords like "Наименование", "Количество", "Цена")
        let headerRow = -1;
        for (let i = 0; i < Math.min(10, sheetData.length); i++) {
          const row = sheetData[i] as any[];
          if (row.some(cell => 
            typeof cell === 'string' && 
            (cell.includes('Наименование') || cell.includes('Количество') || cell.includes('Цена'))
          )) {
            headerRow = i;
            break;
          }
        }

        if (headerRow >= 0) {
          // Extract data rows
          for (let i = headerRow + 1; i < sheetData.length; i++) {
            const row = sheetData[i] as any[];
            if (row.length > 0 && row[0]) {
              estimateItems.push({
                name: row[0],
                quantity: row[1] || 0,
                unit: row[2] || '',
                price: row[3] || 0,
                total: row[4] || 0,
              });
            }
          }
        }
      }

      return {
        itemsFound: estimateItems.length,
        items: estimateItems.slice(0, 100), // Limit to first 100 items
      };
    } catch (error) {
      this.logger.warn('Could not extract estimate data from Excel:', error);
      return null;
    }
  }

  /**
   * Check if file is Excel
   */
  private isExcelFile(file: Express.Multer.File): boolean {
    const extension = path.extname(file.originalname).toLowerCase();
    return ['.xlsx', '.xls'].includes(extension);
  }

  /**
   * Check if file is PDF
   */
  private isPdfFile(file: Express.Multer.File): boolean {
    const extension = path.extname(file.originalname).toLowerCase();
    return extension === '.pdf';
  }

  /**
   * Check if file is Grand Smeta format
   */
  private isGrandSmetaFile(file: Express.Multer.File): boolean {
    const extension = path.extname(file.originalname).toLowerCase();
    return ['.gge', '.gsfx'].includes(extension);
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<ProcessedFile> {
    return this.storageService.getFile(fileId);
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    return this.storageService.deleteFile(fileId);
  }
}
