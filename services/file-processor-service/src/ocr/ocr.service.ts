import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  
  constructor(private readonly configService: ConfigService) {}

  /**
   * Extract text from image or PDF buffer
   */
  async extractText(buffer: Buffer, fileType: string): Promise<string> {
    try {
      this.logger.log(`Starting OCR processing for ${fileType} file`);

      // For production, you might want to use a dedicated OCR service like AWS Textract
      // or Google Cloud Vision API. This is a simple implementation using Tesseract.js
      
      const result = await Tesseract.recognize(
        buffer,
        'rus+eng', // Support both Russian and English
        {
          logger: (m) => {
            if (m.status) {
              this.logger.debug(`OCR Progress: ${m.status} - ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      this.logger.log('OCR processing completed');
      return result.data.text;
    } catch (error) {
      this.logger.error('Error during OCR processing:', error);
      throw error;
    }
  }

  /**
   * Extract structured data from text
   */
  extractStructuredData(text: string): any {
    try {
      const structuredData: any = {
        items: [],
        totals: {},
      };

      // Extract estimate items (simplified pattern matching)
      const itemPattern = /(\d+)\s+(.+?)\s+(\d+[.,]?\d*)\s+(\w+)\s+(\d+[.,]?\d*)\s+(\d+[.,]?\d*)/g;
      let match;
      
      while ((match = itemPattern.exec(text)) !== null) {
        structuredData.items.push({
          number: match[1],
          description: match[2].trim(),
          quantity: parseFloat(match[3].replace(',', '.')),
          unit: match[4],
          price: parseFloat(match[5].replace(',', '.')),
          total: parseFloat(match[6].replace(',', '.')),
        });
      }

      // Extract totals
      const totalPattern = /Итого:?\s*(\d+[.,]?\d*)/gi;
      const totalMatch = totalPattern.exec(text);
      if (totalMatch) {
        structuredData.totals.total = parseFloat(totalMatch[1].replace(',', '.'));
      }

      return structuredData;
    } catch (error) {
      this.logger.error('Error extracting structured data:', error);
      return null;
    }
  }

  /**
   * Preprocess image for better OCR results
   */
  async preprocessImage(buffer: Buffer): Promise<Buffer> {
    // In a real implementation, you would use image processing libraries
    // like Sharp or ImageMagick to enhance the image quality
    // This might include:
    // - Converting to grayscale
    // - Adjusting contrast
    // - Removing noise
    // - Deskewing
    
    return buffer; // Placeholder
  }

  /**
   * Validate OCR results
   */
  validateOcrResults(text: string): boolean {
    // Check if the extracted text has meaningful content
    if (!text || text.trim().length < 10) {
      return false;
    }

    // Check if it contains expected patterns (numbers, Russian text, etc.)
    const hasNumbers = /\d+/.test(text);
    const hasText = /[а-яА-Яa-zA-Z]+/.test(text);

    return hasNumbers && hasText;
  }
}
