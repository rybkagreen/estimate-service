import { ConfidenceLevel } from '../types/confidence.types';

export interface AiProviderConfig {
  provider: 'deepseek-r1' | 'anthropic' | 'local';
  apiKey?: string;
  model: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface AiRequest {
  prompt: string;
  systemPrompt?: string;
  context?: any;
  maxTokens?: number;
  temperature?: number;
}

export interface AiResponse {
  content: string;
  confidence: ConfidenceLevel;
  tokensUsed?: number;
  model: string;
  timestamp: Date;
  metadata?: any;
}

export interface AiProvider {
  /**
   * Инициализация провайдера
   */
  initialize(config: AiProviderConfig): Promise<void>;

  /**
   * Генерация ответа от ИИ
   */
  generateResponse(request: AiRequest): Promise<AiResponse>;

  /**
   * Проверка доступности провайдера
   */
  isAvailable(): Promise<boolean>;

  /**
   * Получение статистики использования
   */
  getUsageStats(): Promise<{
    totalRequests: number;
    totalTokens: number;
    averageResponseTime: number;
    errorRate: number;
  }>;
}
