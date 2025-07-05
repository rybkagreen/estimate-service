/**
 * DeepSeek R1 AI Service for MCP Server
 * Интеграция с DeepSeek R1 для помощи в разработке
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Сервис для работы с DeepSeek R1 API
 */
export class DeepSeekService {
  private client: AxiosInstance;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = config.ai.deepseek.apiKey;
    this.model = config.ai.deepseek.model;
    this.baseUrl = config.ai.deepseek.baseUrl;

    if (!this.apiKey) {
      throw new Error('DeepSeek API key is required');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: config.ai.deepseek.timeout || 30000,
    });

    logger.info('🤖 DeepSeek R1 service initialized');
  }

  /**
   * Отправка запроса к DeepSeek R1
   */
  async chat(messages: DeepSeekMessage[], options: {
    temperature?: number;
    maxTokens?: number;
  } = {}): Promise<string> {
    try {
      const request: DeepSeekRequest = {
        model: this.model,
        messages,
        temperature: options.temperature ?? config.ai.deepseek.temperature,
        max_tokens: options.maxTokens ?? config.ai.deepseek.maxTokens,
      };

      logger.debug('🚀 Sending request to DeepSeek R1:', {
        model: request.model,
        messagesCount: messages.length,
        temperature: request.temperature,
      });

      const response = await this.client.post<DeepSeekResponse>('/chat/completions', request);

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No response from DeepSeek R1');
      }

      const content = response.data.choices[0].message.content;

      logger.debug('✅ DeepSeek R1 response received:', {
        tokensUsed: response.data.usage?.total_tokens || 0,
        responseLength: content.length,
      });

      return content;
    } catch (error) {
      logger.error('❌ DeepSeek R1 API error:', error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid DeepSeek API key');
        }
        if (error.response?.status === 429) {
          throw new Error('DeepSeek API rate limit exceeded');
        }
        if (error.response?.status === 500) {
          throw new Error('DeepSeek API server error');
        }
      }

      throw new Error(`DeepSeek API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Анализ кода с помощью DeepSeek R1
   */
  async analyzeCode(code: string, context: string = ''): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `Ты - эксперт по разработке TypeScript/React/NestJS приложений.
Анализируй предоставленный код и дай конструктивные рекомендации по:
- Качеству кода и архитектуре
- Потенциальным ошибкам и уязвимостям
- Производительности и оптимизациям
- Соответствию best practices
- Возможным улучшениям

Отвечай конкретно и практично. Всегда предлагай примеры улучшенного кода.`
      },
      {
        role: 'user',
        content: `Проанализируй этот код:

${context ? `Контекст: ${context}\n\n` : ''}

\`\`\`typescript
${code}
\`\`\``
      }
    ];

    return await this.chat(messages, { temperature: 0.2 });
  }

  /**
   * Генерация документации с помощью DeepSeek R1
   */
  async generateDocumentation(code: string, type: 'function' | 'class' | 'component' | 'api' = 'function'): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `Ты - эксперт по документированию кода. Создавай качественную документацию в формате JSDoc/TSDoc.

Для ${type} генерируй:
- Описание назначения и функциональности
- Параметры с типами и описаниями
- Возвращаемые значения
- Примеры использования
- Возможные исключения

Используй современный стиль документации с примерами на TypeScript.`
      },
      {
        role: 'user',
        content: `Создай документацию для этого ${type}:

\`\`\`typescript
${code}
\`\`\``
      }
    ];

    return await this.chat(messages, { temperature: 0.3 });
  }

  /**
   * Помощь в написании тестов
   */
  async generateTests(code: string, framework: 'jest' | 'vitest' | 'playwright' = 'jest'): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `Ты - эксперт по тестированию JavaScript/TypeScript приложений.
Пиши качественные тесты используя ${framework}.

Создавай тесты:
- Unit тесты для функций и классов
- Component тесты для React компонентов (с React Testing Library)
- Integration тесты для API endpoints
- E2E тесты для пользовательских сценариев (Playwright)

Используй современные паттерны: mocking, fixtures, test utilities, describe/it структуру.
Покрывай happy path, edge cases и error handling.`
      },
      {
        role: 'user',
        content: `Напиши тесты для этого кода используя ${framework}:

\`\`\`typescript
${code}
\`\`\``
      }
    ];

    return await this.chat(messages, { temperature: 0.4 });
  }

  /**
   * Рефакторинг кода
   */
  async refactorCode(code: string, goals: string[]): Promise<string> {
    const goalsText = goals.length > 0 ? goals.join(', ') : 'улучшение качества кода';

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `Ты - эксперт по рефакторингу кода. Улучшай код сохраняя функциональность.

Применяй принципы:
- SOLID принципы
- Clean Code
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Типизация TypeScript
- Современные паттерны React/NestJS

Всегда объясняй изменения и их преимущества.`
      },
      {
        role: 'user',
        content: `Отрефактори этот код с целью: ${goalsText}

\`\`\`typescript
${code}
\`\`\``
      }
    ];

    return await this.chat(messages, { temperature: 0.3 });
  }

  /**
   * Помощь в архитектурных решениях
   */
  async architectureAdvice(description: string, constraints: string[] = []): Promise<string> {
    const constraintsText = constraints.length > 0
      ? `\n\nОграничения: ${constraints.join(', ')}`
      : '';

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `Ты - архитектор программного обеспечения с экспертизой в:
- Full-stack разработке (React + NestJS)
- Микросервисной архитектуре
- Database design (PostgreSQL, Prisma)
- Cloud-native решениях
- Performance optimization
- Security best practices

Предлагай конкретные, реализуемые решения с обоснованием выбора.`
      },
      {
        role: 'user',
        content: `Нужен совет по архитектуре:

${description}${constraintsText}

Предложи оптимальное решение с объяснением архитектурных решений, технологического стека и потенциальных проблем.`
      }
    ];

    return await this.chat(messages, { temperature: 0.4 });
  }

  /**
   * Проверка работоспособности DeepSeek API
   */
  async healthCheck(): Promise<{ status: 'ok' | 'error'; message: string; latency?: number }> {
    const startTime = Date.now();

    try {
      const messages: DeepSeekMessage[] = [
        {
          role: 'user',
          content: 'Hello! Please respond with "API is working" to confirm connectivity.'
        }
      ];

      const response = await this.chat(messages, {
        temperature: 0,
        maxTokens: 50
      });

      const latency = Date.now() - startTime;

      return {
        status: 'ok',
        message: `DeepSeek R1 API is operational. Response: ${response.slice(0, 100)}`,
        latency
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const deepSeekService = new DeepSeekService();
