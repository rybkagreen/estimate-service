/**
 * AI Provider Interface Definitions
 */

export interface AiRequest {
  prompt: string;
  context?: any;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  model?: string;
}

export interface AiResponse {
  answer: string;
  model: string;
  confidence: number;
  processingTime: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: any;
}

export interface AiProviderConfig {
  apiKey: string;
  endpoint?: string;
  defaultModel: string;
  timeout?: number;
  maxRetries?: number;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

export interface AiProvider {
  name: string;
  generateResponse(request: AiRequest): Promise<AiResponse>;
  validateConfig(config: AiProviderConfig): boolean;
  getAvailableModels(): string[];
  estimateCost(request: AiRequest): number;
}
