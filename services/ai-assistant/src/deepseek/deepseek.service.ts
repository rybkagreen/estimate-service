import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  stream?: boolean;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class DeepSeekService {
  private readonly logger = new Logger(DeepSeekService.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY') || '';
    this.model = this.configService.get<string>('DEEPSEEK_MODEL') || 'deepseek-r1-2024';
    
    if (!this.apiKey) {
      this.logger.warn('DeepSeek API key not configured');
    }

    this.client = axios.create({
      baseURL: 'https://api.deepseek.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      timeout: 120000, // 2 minutes timeout for R1 model
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug(`DeepSeek API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('DeepSeek API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug(`DeepSeek API Response: ${response.status}`);
        return response;
      },
      async (error: AxiosError) => {
        if (error.response) {
          this.logger.error(`DeepSeek API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          this.logger.error('DeepSeek API Error: No response received');
        } else {
          this.logger.error('DeepSeek API Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Send a chat completion request to DeepSeek R1
   */
  async chat(
    messages: DeepSeekMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ): Promise<DeepSeekResponse> {
    if (!this.apiKey) {
      throw new HttpException(
        'DeepSeek API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    const request: DeepSeekRequest = {
      model: this.model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      stream: options?.stream ?? false,
    };

    return this.executeWithRetry(async () => {
      const response = await this.client.post<DeepSeekResponse>('/chat/completions', request);
      return response.data;
    });
  }

  /**
   * Generate completion with construction domain context
   */
  async generateWithContext(
    prompt: string,
    context: string,
    systemPrompt?: string
  ): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: systemPrompt || this.getDefaultSystemPrompt(),
      },
      {
        role: 'user',
        content: `Контекст: ${context}\n\nЗапрос: ${prompt}`,
      },
    ];

    const response = await this.chat(messages);
    return response.choices[0]?.message.content || '';
  }

  /**
   * Analyze estimate data with AI
   */
  async analyzeEstimate(params: {
    estimateText: string;
    documentType?: string;
    regionCode?: string;
    year?: number;
  }): Promise<string> {
    const prompt = `Проанализируй следующую смету и предоставь рекомендации по оптимизации:
    
    Смета: ${params.estimateText}
    Тип документа: ${params.documentType || 'Не указан'}
    Регион: ${params.regionCode || 'Не указан'}
    Год: ${params.year || 'Не указан'}
    
    Пожалуйста, обрати внимание на:
    1. Возможности снижения затрат
    2. Потенциальные риски
    3. Соответствие стандартам ФСБЦ-2022
    4. Рекомендации по улучшению`;

    return this.generateWithContext(prompt, 'Анализ строительной сметы');
  }

  /**
   * Generate estimate based on project parameters
   */
  async generateEstimate(params: {
    projectDescription: string;
    workTypes: string[];
    area?: number;
    region?: string;
    priceLevel?: string;
  }): Promise<string> {
    const prompt = `Создай детальную смету для строительного проекта:
    
    Описание проекта: ${params.projectDescription}
    Типы работ: ${params.workTypes.join(', ')}
    Площадь: ${params.area ? params.area + ' м²' : 'Не указана'}
    Регион: ${params.region || 'Не указан'}
    Уровень цен: ${params.priceLevel || 'Средний'}
    
    Сгенерируй смету в формате:
    1. Перечень работ с указанием объемов
    2. Расценки по ФСБЦ-2022
    3. Итоговая стоимость с разбивкой по разделам
    4. Рекомендации по оптимизации`;

    return this.generateWithContext(prompt, 'Генерация строительной сметы');
  }

  /**
   * Generate estimate description with AI
   */
  async generateEstimateDescription(
    projectType: string,
    items: any[]
  ): Promise<string> {
    const prompt = `Создай профессиональное описание для сметы строительного проекта:
    
    Тип проекта: ${projectType}
    Количество позиций: ${items.length}
    
    Основные работы:
    ${items.slice(0, 5).map(item => `- ${item.name}: ${item.quantity} ${item.unit}`).join('\n')}
    
    Сгенерируй краткое, но информативное описание сметы.`;

    return this.generateWithContext(prompt, 'Генерация описания сметы');
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    attempt = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.maxRetries) {
        throw this.handleError(error);
      }

      const isRetryable = this.isRetryableError(error);
      if (!isRetryable) {
        throw this.handleError(error);
      }

      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      this.logger.warn(`Retrying DeepSeek API request. Attempt ${attempt + 1}/${this.maxRetries} after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.executeWithRetry(operation, attempt + 1);
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error.response) {
      const status = error.response.status;
      // Retry on rate limit, server errors, and timeout
      return status === 429 || status >= 500 || status === 408;
    }
    // Retry on network errors
    return error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED';
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: any): Error {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          throw new HttpException('Invalid DeepSeek API key', HttpStatus.UNAUTHORIZED);
        case 429:
          throw new HttpException('DeepSeek API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
        case 400:
          throw new HttpException(`Invalid request: ${data.error?.message || 'Unknown error'}`, HttpStatus.BAD_REQUEST);
        default:
          throw new HttpException(
            `DeepSeek API error: ${data.error?.message || 'Unknown error'}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
      }
    }

    throw new HttpException(
      'Failed to connect to DeepSeek API',
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }

/**
   * Get default system prompt for construction domain
   */
  getDefaultSystemPrompt(): string {
    return `Ты - профессиональный ИИ-ассистент для работы со строительными сметами.
    
    Твои основные задачи:
    1. Помощь в составлении и анализе смет
    2. Консультации по стандартам ФСБЦ-2022
    3. Оптимизация затрат и выявление рисков
    4. Предоставление рекомендаций по улучшению проектов
    
    Всегда отвечай на русском языке, используй профессиональную терминологию строительной отрасли.
    Будь точным, конкретным и полезным в своих ответах.`;
  }

  /**
   * Get model information
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await this.client.get('/models');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get model info:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Health check for DeepSeek API
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getModelInfo();
      return true;
    } catch (error) {
      return false;
    }
  }
}
