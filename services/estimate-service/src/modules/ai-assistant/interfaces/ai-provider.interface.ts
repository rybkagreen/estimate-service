export interface AiProviderConfig {
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  [key: string]: any;
}

export interface AiResponse {
  answer: string;
  confidence: number;
  model: string;
  processingTime?: number;
  tokensUsed?: number;
  metadata?: Record<string, any>;
}

export interface AiRequest {
  prompt: string;
  context?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export abstract class AiProvider {
  abstract initialize(config: AiProviderConfig): Promise<void>;
  abstract generateResponse(request: AiRequest): Promise<AiResponse>;
  abstract isAvailable(): Promise<boolean>;
  abstract getModelInfo(): { name: string; version: string; capabilities: string[] };
}
