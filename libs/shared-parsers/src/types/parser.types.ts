/**
 * Types for document parsing functionality
 */

export interface ParsedDocument {
  content: any;
  metadata: DocumentMetadata;
  errors?: string[];
}

export interface DocumentMetadata {
  fileName?: string;
  fileSize?: number;
  format: DocumentFormat;
  createdAt?: Date;
  parsedAt: Date;
  rowCount?: number;
  columnCount?: number;
  sheetCount?: number;
  pageCount?: number;
}

export enum DocumentFormat {
  EXCEL = 'excel',
  PDF = 'pdf',
  XML = 'xml',
  CSV = 'csv',
  JSON = 'json',
  DOC = 'doc',
  DOCX = 'docx',
  UNKNOWN = 'unknown'
}

export interface ParserOptions {
  encoding?: string;
  delimiter?: string;
  headers?: boolean;
  skipEmptyRows?: boolean;
  maxRows?: number;
  sheetName?: string;
  sheetIndex?: number;
  dateFormat?: string;
  numberFormat?: string;
}

export interface FsbcParsedItem {
  code: string;
  name: string;
  unit: string;
  basePrice: number;
  laborCost?: number;
  machineCost?: number;
  materialCost?: number;
  category?: string;
  regionCode?: string;
  validFrom?: Date;
  validTo?: Date;
  sourceUrl?: string;
}

export interface RegionalCoefficient {
  regionCode: string;
  regionName: string;
  coefficient: number;
  category?: string;
  validFrom: Date;
  validTo?: Date;
}
