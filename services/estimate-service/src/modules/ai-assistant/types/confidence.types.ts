/**
 * Confidence levels for AI model responses
 */
export enum ConfidenceLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  UNCERTAIN = 'UNCERTAIN'
}

/**
 * AI Provider interface for model implementations
 */
export interface AiProvider {
  generateResponse(prompt: string, options?: any): Promise<AiResponse>;
  initialize?(config: any): Promise<void>;
  isAvailable?(): Promise<boolean>;
}

/**
 * AI Response interface with confidence levels
 */
export interface AiResponse {
  content: string;
  confidence: ConfidenceLevel;
  tokensUsed?: number;
  metadata?: Record<string, any>;
}
