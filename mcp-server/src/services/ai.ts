/**
 * AI сервис для работы с DeepSeek и другими AI провайдерами
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger.js';

export interface AIConfig {
  deepseek: {
    apiKey: string;
    model: string;
    baseUrl: string;
    maxTokens: number;
    temperature: number;
  };
}

export interface AIRequest {
  prompt: string;
  context?: any;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  content: string;
  tokensUsed: number;
  model: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCERTAIN';
  metadata: any;
}

export class AIService {
  private config: AIConfig;
  private client: AxiosInstance;
  private isInitialized = false;
  private stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalTokensUsed: 0,
  };

  constructor(config: AIConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.deepseek.baseUrl,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${config.deepseek.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Инициализация AI сервиса
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🤖 Инициализация AI сервиса...');

      // Проверяем доступность API
      await this.validateConnection();

      this.isInitialized = true;
      logger.info('✅ AI сервис инициализирован успешно');
    } catch (error) {
      logger.error('❌ Ошибка инициализации AI сервиса:', error);
      this.isInitialized = false;

      // В режиме разработки можем работать без AI
      if (process.env.NODE_ENV === 'development') {
        logger.warn('⚠️ Продолжаем работу без AI сервиса (dev режим)');
        this.isInitialized = true; // Разрешаем работу с моками
      } else {
        throw error;
      }
    }
  }

  /**
   * Проверка подключения к AI API
   */
  private async validateConnection(): Promise<void> {
    try {
      const response = await this.client.get('/models');
      if (response.status !== 200) {
        throw new Error(`Неожиданный статус ответа: ${response.status}`);
      }
      logger.debug('✅ Подключение к DeepSeek API проверено');
    } catch (error) {
      throw new Error(`Не удалось подключиться к DeepSeek API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Генерация ответа от AI
   */
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    if (!this.isInitialized) {
      throw new Error('AI сервис не инициализирован');
    }

    this.stats.totalRequests++;

    try {
      logger.debug('🤖 Отправка запроса к DeepSeek AI:', {
        promptLength: request.prompt.length,
        maxTokens: request.maxTokens || this.config.deepseek.maxTokens,
      });

      // В dev режиме возвращаем мок
      if (process.env.NODE_ENV === 'development' && !this.config.deepseek.apiKey) {
        return this.generateMockResponse(request);
      }

      const messages = this.buildMessages(request);
      const apiRequest = {
        model: this.config.deepseek.model,
        messages,
        max_tokens: request.maxTokens || this.config.deepseek.maxTokens,
        temperature: request.temperature || this.config.deepseek.temperature,
      };

      const response = await this.client.post('/chat/completions', apiRequest);

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('DeepSeek API вернул пустой ответ');
      }

      const choice = response.data.choices[0];
      const tokensUsed = response.data.usage?.total_tokens || this.estimateTokens(choice.message.content);

      this.stats.successfulRequests++;
      this.stats.totalTokensUsed += tokensUsed;

      logger.debug('✅ Получен ответ от DeepSeek AI:', {
        tokensUsed,
        responseLength: choice.message.content.length,
      });

      return {
        content: choice.message.content,
        tokensUsed,
        model: this.config.deepseek.model,
        confidence: this.determineConfidence(choice),
        metadata: {
          provider: 'deepseek',
          model: this.config.deepseek.model,
          usage: response.data.usage,
          finishReason: choice.finish_reason,
        },
      };

    } catch (error) {
      this.stats.failedRequests++;
      logger.error('❌ Ошибка генерации ответа AI:', error);
      throw error;
    }
  }

  /**
   * Генерация мок ответа для разработки
   */
  private generateMockResponse(request: AIRequest): AIResponse {
    const mockResponse = `Mock AI response for prompt: "${request.prompt.substring(0, 50)}..."

This is a simulated response from DeepSeek AI for development purposes.
The actual AI would analyze the prompt and provide a detailed response.`;

    return {
      content: mockResponse,
      tokensUsed: Math.floor(mockResponse.length / 4),
      model: 'deepseek-mock',
      confidence: 'MEDIUM',
      metadata: {
        provider: 'mock',
        model: 'deepseek-mock',
        usage: { total_tokens: 100 },
        finishReason: 'stop',
      },
    };
  }

  /**
   * Построение сообщений для API
   */
  private buildMessages(request: AIRequest): any[] {
    const messages = [];

    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt,
      });
    }

    let userContent = request.prompt;
    if (request.context) {
      userContent = `Контекст: ${JSON.stringify(request.context, null, 2)}\n\n${userContent}`;
    }

    messages.push({
      role: 'user',
      content: userContent,
    });

    return messages;
  }

  /**
   * Определение уровня уверенности
   */
  private determineConfidence(choice: any): 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCERTAIN' {
    const content = choice.message.content;
    const finishReason = choice.finish_reason;

    if (finishReason === 'length') {
      return 'MEDIUM';
    }

    if (finishReason === 'stop') {
      if (content.length < 50) {
        return 'LOW';
      }

      // Ключевые слова неуверенности
      const uncertaintyWords = ['возможно', 'вероятно', 'может быть', 'не уверен', 'сложно сказать'];
      const hasUncertainty = uncertaintyWords.some(word =>
        content.toLowerCase().includes(word)
      );

      if (hasUncertainty) {
        return 'MEDIUM';
      }

      // Ключевые слова высокой уверенности
      const confidenceWords = ['точно', 'определенно', 'рекомендую', 'оптимально'];
      const hasConfidence = confidenceWords.some(word =>
        content.toLowerCase().includes(word)
      );

      return hasConfidence ? 'HIGH' : 'MEDIUM';
    }

    return 'UNCERTAIN';
  }

  /**
   * Оценка количества токенов
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Получение статистики использования
   */
  getUsageStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Проверка готовности сервиса
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Проверка здоровья AI сервиса
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    provider: string;
    model: string;
    stats: typeof this.stats;
    error?: string;
  }> {
    try {
      if (!this.isInitialized) {
        return {
          status: 'unhealthy',
          provider: 'deepseek',
          model: this.config.deepseek.model,
          stats: this.stats,
          error: 'AI сервис не инициализирован',
        };
      }

      // Тестовый запрос
      await this.generateResponse({
        prompt: 'Test health check',
        maxTokens: 10,
      });

      return {
        status: 'healthy',
        provider: 'deepseek',
        model: this.config.deepseek.model,
        stats: this.stats,
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        provider: 'deepseek',
        model: this.config.deepseek.model,
        stats: this.stats,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Завершение работы AI сервиса
   */
  async shutdown(): Promise<void> {
    logger.info('🤖 Завершение работы AI сервиса...');
    this.isInitialized = false;
    logger.info('✅ AI сервис завершил работу');
  }
}
