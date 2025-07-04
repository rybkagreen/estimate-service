import { ConfidenceLevel } from '../../../types/shared-contracts';
import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, AiProviderConfig, AiRequest, AiResponse } from './ai-provider.interface';
import axios, { AxiosResponse } from 'axios';

/**
 * Интерфейс для сообщений DeepSeek API
 */
interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Интерфейс ответа DeepSeek API
 */
interface DeepSeekApiResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  id: string;
  created: number;
}

/**
 * DeepSeek R1 провайдер для работы с DeepSeek AI
 * Реализует интерфейс ИИ-провайдера с полной поддержкой DeepSeek API
 */
@Injectable()
export class DeepSeekAiProvider implements AiProvider {
  private readonly logger = new Logger(DeepSeekAiProvider.name);
  private config: AiProviderConfig;
  private initialized = false;
  private stats = {
    totalRequests: 0,
    totalTokens: 0,
    totalResponseTime: 0,
    errors: 0
  };

  constructor() {
    this.logger.log('Создание экземпляра DeepSeek AI провайдера');
  }

  /**
   * Инициализация провайдера с конфигурацией
   */
  async initialize(config: AiProviderConfig): Promise<void> {
    this.config = config;

    this.logger.log(`Инициализация DeepSeek AI провайдера с моделью: ${config.model}`);

    if (!config.apiKey) {
      throw new Error('DEEPSEEK_API_KEY не установлен');
    }

    // Проверка подключения к DeepSeek API
    try {
      await this.validateConnection();
      this.initialized = true;
      this.logger.log('DeepSeek AI провайдер успешно инициализирован');
    } catch (error) {
      this.logger.error('Ошибка инициализации DeepSeek AI провайдера', error);
      throw error;
    }
  }

  /**
   * Генерация ответа через DeepSeek API
   */
  async generateResponse(request: AiRequest): Promise<AiResponse> {
    if (!this.initialized) {
      throw new Error('DeepSeek AI провайдер не инициализирован');
    }

    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      this.logger.debug(`Отправка запроса к DeepSeek AI: ${request.prompt.substring(0, 100)}...`);

      // Формирование сообщений для DeepSeek API
      const messages = this.buildMessages(request);

      // Выполнение запроса к DeepSeek API
      const response = await this.callDeepSeekApi(messages, request);

      const responseTime = Date.now() - startTime;
      this.stats.totalResponseTime += responseTime;

      // Проверяем наличие выбора в ответе
      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('DeepSeek API вернул пустой ответ');
      }

      const choice = response.data.choices[0];
      if (!choice || !choice.message || !choice.message.content) {
        throw new Error('DeepSeek API вернул некорректный ответ');
      }

      const tokensUsed = response.data.usage?.total_tokens || this.estimateTokens(choice.message.content);
      this.stats.totalTokens += tokensUsed;

      this.logger.debug(`Получен ответ от DeepSeek AI за ${responseTime}ms, токенов: ${tokensUsed}`);

      return {
        content: choice.message.content,
        confidence: this.determineConfidence(choice),
        tokensUsed,
        model: this.config.model,
        timestamp: new Date(),
        metadata: {
          model: this.config.model,
          provider: 'deepseek-r1',
          responseTime,
          requestId: this.generateRequestId(),
          usage: response.data.usage,
        },
      };
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Ошибка при обращении к DeepSeek AI', error);
      throw new Error(`DeepSeek AI ошибка: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Проверка подключения к DeepSeek API
   */
  private async validateConnection(): Promise<void> {
    try {
      const baseUrl = this.config.baseUrl || 'https://api.deepseek.com';
      const response = await axios.get(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: this.config.timeout || 10000,
      });

      if (response.status === 200) {
        this.logger.debug('Подключение к DeepSeek API успешно проверено');
      } else {
        throw new Error(`Неожиданный статус ответа: ${response.status}`);
      }
    } catch (error) {
      this.logger.error('Ошибка при проверке подключения к DeepSeek API', error);
      throw new Error(`Не удалось подключиться к DeepSeek API: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Формирование сообщений для DeepSeek API
   */
  private buildMessages(request: AiRequest): DeepSeekMessage[] {
    const messages: DeepSeekMessage[] = [];

    // Добавляем системное сообщение
    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt,
      });
    }

    // Формируем пользовательское сообщение
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
   * Вызов DeepSeek API
   */
  private async callDeepSeekApi(messages: DeepSeekMessage[], request: AiRequest): Promise<AxiosResponse<DeepSeekApiResponse>> {
    const baseUrl = this.config.baseUrl || 'https://api.deepseek.com';
    const endpoint = `${baseUrl}/chat/completions`;

    const requestBody = {
      model: this.config.model || 'deepseek-reasoner',
      messages,
      max_tokens: this.config.maxTokens || 4000,
      temperature: this.config.temperature || 0.7,
      stream: false,
    };

    this.logger.debug(`Отправка запроса к DeepSeek API: ${endpoint}`);

    try {
      const response = await axios.post<DeepSeekApiResponse>(endpoint, requestBody, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: this.config.timeout || 30000,
      });

      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        const statusCode = error.response?.status;

        this.logger.error(`DeepSeek API ошибка ${statusCode}: ${errorMessage}`);

        if (statusCode === 401) {
          throw new Error('Неверный API ключ DeepSeek');
        } else if (statusCode === 429) {
          throw new Error('Превышен лимит запросов к DeepSeek API');
        } else if (statusCode === 500) {
          throw new Error('Внутренняя ошибка DeepSeek API');
        }

        throw new Error(`DeepSeek API ошибка: ${errorMessage}`);
      }

      throw error;
    }
  }

  /**
   * Определение уровня уверенности на основе ответа
   */
  private determineConfidence(choice: DeepSeekApiResponse['choices'][0]): ConfidenceLevel {
    // Анализируем качество ответа для определения уверенности
    const content = choice.message.content;
    const finishReason = choice.finish_reason;

    // Если ответ был обрезан из-за лимита токенов
    if (finishReason === 'length') {
      return ConfidenceLevel.MEDIUM;
    }

    // Если ответ завершен корректно
    if (finishReason === 'stop') {
      // Анализируем содержание для определения уверенности
      if (content.length < 50) {
        return ConfidenceLevel.LOW;
      }

      // Ищем признаки неуверенности в тексте
      const uncertaintyIndicators = [
        'возможно', 'вероятно', 'предположительно', 'может быть',
        'не уверен', 'сложно сказать', 'требует уточнения'
      ];

      const hasUncertainty = uncertaintyIndicators.some(indicator =>
        content.toLowerCase().includes(indicator)
      );

      if (hasUncertainty) {
        return ConfidenceLevel.MEDIUM;
      }

      // Ищем признаки высокой уверенности
      const confidenceIndicators = [
        'точно', 'определенно', 'рекомендую', 'оптимально',
        'анализ показывает', 'расчеты подтверждают'
      ];

      const hasConfidence = confidenceIndicators.some(indicator =>
        content.toLowerCase().includes(indicator)
      );

      return hasConfidence ? ConfidenceLevel.HIGH : ConfidenceLevel.MEDIUM;
    }

    return ConfidenceLevel.LOW;
  }

  /**
   * Оценка количества токенов (приблизительно)
   */
  private estimateTokens(text: string): number {
    // Простая оценка: примерно 4 символа на токен для русского текста
    return Math.ceil(text.length / 4);
  }

  /**
   * Генерация уникального ID запроса
   */
  private generateRequestId(): string {
    return `deepseek-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Получение текущей конфигурации
   */
  getConfig(): AiProviderConfig {
    return { ...this.config };
  }

  /**
   * Проверка готовности провайдера
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Проверка доступности провайдера
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (!this.initialized || !this.config.apiKey) {
        return false;
      }

      // Проверяем доступность API через простой запрос
      const baseUrl = this.config.baseUrl || 'https://api.deepseek.com';
      const response = await axios.get(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      return response.status === 200;
    } catch (error) {
      this.logger.error('Ошибка проверки доступности DeepSeek AI', error);
      return false;
    }
  }

  /**
   * Получение статистики использования
   */
  async getUsageStats(): Promise<{
    totalRequests: number;
    totalTokens: number;
    averageResponseTime: number;
    errorRate: number;
  }> {
    const averageResponseTime = this.stats.totalRequests > 0
      ? this.stats.totalResponseTime / this.stats.totalRequests
      : 0;

    const errorRate = this.stats.totalRequests > 0
      ? this.stats.errors / this.stats.totalRequests
      : 0;

    return {
      totalRequests: this.stats.totalRequests,
      totalTokens: this.stats.totalTokens,
      averageResponseTime,
      errorRate,
    };
  }
}
