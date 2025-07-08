/**
 * Novita Provider Client for DeepSeek R1
 * HTTP клиент для работы с DeepSeek R1 через провайдер Novita
 */

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface NovitaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface NovitaGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface NovitaResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface NovitaStreamChunk {
  choices: Array<{
    delta: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Клиент для работы с DeepSeek R1 через провайдер Novita
 */
export class NovitaClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly modelName: string;

  constructor() {
    this.apiKey = config.ai.huggingface?.apiKey || process.env.HF_TOKEN || '';
    this.modelName = config.ai.huggingface?.modelName || 'deepseek/deepseek-r1-0528';

    // Novita API через Hugging Face Router (OpenAI-совместимый)
    this.baseUrl = 'https://router.huggingface.co/novita/v3/openai/chat/completions';

    if (!this.apiKey) {
      throw new Error('HF_TOKEN environment variable is required for Novita provider');
    }

    logger.info(`🚀 Novita Client initialized`);
    logger.debug('🔧 Novita config:', {
      modelName: this.modelName,
      hasApiKey: !!this.apiKey,
      baseUrl: this.baseUrl,
    });
  }

  /**
   * Отправка HTTP запроса к API
   */
  private async makeRequest(
    endpoint: string,
    payload: any,
    options: { stream?: boolean } = {}
  ): Promise<any> {
    const url = `${this.baseUrl}/${this.modelName}`;

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'estimate-service-mcp/1.0.0',
    };

    logger.debug('🌐 Making request to Novita API:', {
      url,
      modelName: this.modelName,
      stream: options.stream,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('❌ Novita API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      throw new Error(`Novita API error ${response.status}: ${errorText}`);
    }

    if (options.stream) {
      return response;
    }

    return await response.json();
  }

  /**
   * Генерация ответа через Novita API
   */
  async generateResponse(
    messages: NovitaMessage[],
    options: NovitaGenerationOptions = {}
  ): Promise<NovitaResponse> {
    const {
      temperature = 0.7,
      maxTokens = 1024,
      topP = 0.9,
      stream = false,
    } = options;

    const payload = {
      inputs: this.formatMessagesForNovita(messages),
      parameters: {
        temperature,
        max_new_tokens: maxTokens,
        top_p: topP,
        do_sample: true,
        return_full_text: false,
      },
      options: {
        use_cache: false,
        wait_for_model: true,
      },
    };

    try {
      if (stream) {
        return await this.generateStreamingResponse(payload);
      }

      const response = await this.makeRequest('', payload);

      // Hugging Face Inference API возвращает массив с одним объектом
      const result = Array.isArray(response) ? response[0] : response;
      const content = result.generated_text || result.text || '';

      logger.debug('✅ Response generated successfully:', {
        contentLength: content.length,
      });

      return {
        content,
        usage: {
          promptTokens: 0, // API не возвращает точные метрики
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      logger.error('❌ Failed to generate response:', error);
      throw error;
    }
  }

  /**
   * Потоковая генерация (пока что эмулируется)
   */
  private async generateStreamingResponse(payload: any): Promise<NovitaResponse> {
    // Пока используем обычный запрос, так как Inference API не всегда поддерживает streaming
    const response = await this.makeRequest('', payload);
    const result = Array.isArray(response) ? response[0] : response;
    const content = result.generated_text || result.text || '';

    return {
      content,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }

  /**
   * Форматирование сообщений для Novita API
   */
  private formatMessagesForNovita(messages: NovitaMessage[]): string {
    // Объединяем сообщения в один промпт
    let prompt = '';

    for (const message of messages) {
      switch (message.role) {
        case 'system':
          prompt += `System: ${message.content}\n\n`;
          break;
        case 'user':
          prompt += `Human: ${message.content}\n\n`;
          break;
        case 'assistant':
          prompt += `Assistant: ${message.content}\n\n`;
          break;
      }
    }

    // Добавляем начало ответа ассистента
    prompt += 'Assistant: ';

    return prompt;
  }

  /**
   * Тест подключения к API
   */
  async testConnection(): Promise<void> {
    try {
      const testMessages: NovitaMessage[] = [
        {
          role: 'user',
          content: 'Hello, can you respond with just "OK"?',
        },
      ];

      const response = await this.generateResponse(testMessages, {
        temperature: 0.1,
        maxTokens: 10,
      });

      logger.info('🔗 Novita API connection test successful');
      logger.debug('Test response:', response.content);
    } catch (error) {
      logger.error('🔗 Novita API connection test failed:', error);
      throw new Error(`Failed to connect to Novita API: ${(error as Error).message}`);
    }
  }

  /**
   * Проверка состояния сервиса
   */
  getHealthStatus() {
    return {
      service: 'Novita Provider Client',
      status: 'ready',
      provider: 'novita',
      model: this.modelName,
      hasApiKey: !!this.apiKey,
      timestamp: new Date().toISOString(),
    };
  }
}

// Экспорт singleton instance
export const novitaClient = new NovitaClient();
