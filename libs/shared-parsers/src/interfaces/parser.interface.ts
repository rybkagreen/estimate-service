import { ParsedDocument, ParserOptions } from '../types/parser.types';

/**
 * Base interface for all document parsers
 */
export interface IDocumentParser {
  /**
   * Parse a document from file path
   */
  parse(filePath: string, options?: ParserOptions): Promise<ParsedDocument>;

  /**
   * Parse a document from buffer
   */
  parseBuffer(buffer: Buffer, options?: ParserOptions): Promise<ParsedDocument>;

  /**
   * Check if parser supports the file type
   */
  supports(fileExtension: string): boolean;

  /**
   * Get parser name
   */
  getName(): string;
}

/**
 * Interface for parser result
 */
export interface ParserResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}
