/**
 * DeepSeek R1 AI Service for MCP Server
 * Интеграция с DeepSeek R1 через прямые HTTP-запросы
 */

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import {
  startModelCall,
  endModelCall,
  recordModelError,
  recordTokenUsage,
  updateModelAvailability
} from '../utils/prometheus-metrics.js';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
 * Сервис для работы с DeepSeek R1 API через прямые HTTP-запросы
 */
export class DeepSeekService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly mockMode: boolean;

  constructor() {
    this.apiKey = config.ai.deepseek.apiKey;
    this.model = config.ai.deepseek.model;
    this.baseUrl = config.ai.deepseek.baseUrl;
    this.mockMode = config.ai.deepseek.mockMode;

    if (!this.mockMode && !this.apiKey) {
      throw new Error('DeepSeek API key is required when not in mock mode');
    }

    logger.info(`🤖 DeepSeek R1 service initialized ${this.mockMode ? '(Mock Mode)' : 'with HTTP API'}`);
    logger.debug('🔧 DeepSeek config:', {
      model: this.model,
      baseUrl: this.baseUrl,
      mockMode: this.mockMode,
      configModel: config.ai.deepseek.model,
      envModel: process.env.DEEPSEEK_MODEL
    });
  }

  /**
   * Отправка запроса к DeepSeek R1 через прямые HTTP-запросы или мок-ответ
   */
  async chat(messages: DeepSeekMessage[], options: {
    temperature?: number;
    maxTokens?: number;
  } = {}): Promise<string> {
    // Start metrics tracking
    const metricsCall = startModelCall('deepseek-r1', 'deepseek', 'chat');
    
    try {
      logger.debug('🚀 Sending request to DeepSeek R1:', {
        model: this.model,
        messagesCount: messages.length,
        temperature: options.temperature ?? config.ai.deepseek.temperature,
        mockMode: this.mockMode,
      });

      // Мок-режим для тестирования
      if (this.mockMode) {
        const response = this.generateMockResponse(messages);
        endModelCall(metricsCall, true, false);
        return response;
      }

      // Подготовка запроса к DeepSeek API
      const requestBody = {
        model: this.model,
        messages: messages,
        temperature: options.temperature ?? config.ai.deepseek.temperature,
        max_tokens: options.maxTokens ?? config.ai.deepseek.maxTokens,
        stream: false,
      };

      // Отправка HTTP-запроса к DeepSeek API
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('❌ DeepSeek API HTTP error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        });

        // Специфичные ошибки DeepSeek
        let errorType = 'unknown_error';
        
        if (response.status === 401) {
          errorType = 'auth_error';
          recordModelError('deepseek-r1', 'deepseek', 'chat', errorType);
          endModelCall(metricsCall, false, false);
          updateModelAvailability('deepseek-r1', 'deepseek', false);
          throw new Error('Invalid DeepSeek API key (401 Unauthorized)');
        }
        if (response.status === 429) {
          errorType = 'rate_limit';
          recordModelError('deepseek-r1', 'deepseek', 'chat', errorType);
          endModelCall(metricsCall, false, false);
          throw new Error('DeepSeek API rate limit exceeded (429)');
        }
        if (response.status === 402) {
          errorType = 'payment_required';
          recordModelError('deepseek-r1', 'deepseek', 'chat', errorType);
          endModelCall(metricsCall, false, false);
          updateModelAvailability('deepseek-r1', 'deepseek', false);
          throw new Error('Insufficient balance on DeepSeek account (402)');
        }
        if (response.status >= 500) {
          errorType = 'server_error';
          recordModelError('deepseek-r1', 'deepseek', 'chat', errorType);
          endModelCall(metricsCall, false, false);
          updateModelAvailability('deepseek-r1', 'deepseek', false);
          throw new Error(`DeepSeek API server error (${response.status})`);
        }

        recordModelError('deepseek-r1', 'deepseek', 'chat', errorType);
        endModelCall(metricsCall, false, false);
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data: DeepSeekResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        recordModelError('deepseek-r1', 'deepseek', 'chat', 'empty_response');
        endModelCall(metricsCall, false, false);
        throw new Error('No response from DeepSeek R1');
      }

      const content = data.choices[0].message.content;

      if (!content) {
        recordModelError('deepseek-r1', 'deepseek', 'chat', 'empty_content');
        endModelCall(metricsCall, false, false);
        throw new Error('Empty response from DeepSeek R1');
      }

      // Record token usage
      if (data.usage) {
        recordTokenUsage(
          'deepseek-r1',
          'deepseek',
          data.usage.prompt_tokens || 0,
          data.usage.completion_tokens || 0
        );
      }

      logger.debug('✅ DeepSeek R1 response received:', {
        tokensUsed: data.usage?.total_tokens || 0,
        responseLength: content.length,
      });

      // Mark successful completion
      endModelCall(metricsCall, true, false);
      updateModelAvailability('deepseek-r1', 'deepseek', true);

      return content;
    } catch (error) {
      logger.error('❌ DeepSeek R1 API error:', error);

      // Передаем уже обработанные ошибки как есть
      if (error instanceof Error && error.message.includes('DeepSeek')) {
        throw error;
      }

      // Обработка сетевых ошибок
      if (error instanceof TypeError && error.message.includes('fetch')) {
        recordModelError('deepseek-r1', 'deepseek', 'chat', 'network_error');
        endModelCall(metricsCall, false, false);
        updateModelAvailability('deepseek-r1', 'deepseek', false);
        throw new Error('Network error: Unable to connect to DeepSeek API');
      }

      // Record generic error
      recordModelError('deepseek-r1', 'deepseek', 'chat', 'unknown_error');
      endModelCall(metricsCall, false, false);
      
      throw new Error(`DeepSeek API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Анализ кода с помощью DeepSeek R1
   */
  async analyzeCode(code: string, context: string = ''): Promise<string> {
    const metricsCall = startModelCall('deepseek-r1', 'deepseek', 'analyze_code');
    
    try {
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

      const result = await this.chat(messages, { temperature: 0.2 });
      endModelCall(metricsCall, true, false);
      return result;
    } catch (error) {
      endModelCall(metricsCall, false, false);
      throw error;
    }
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

  /**
   * Генерация мок-ответа для тестирования
   */
  private generateMockResponse(messages: DeepSeekMessage[]): string {
    const lastMessage = messages[messages.length - 1];

    // Определяем тип запроса и генерируем соответствующий мок-ответ
    const userContent = lastMessage.content.toLowerCase();

    if (userContent.includes('анализ') || userContent.includes('analyze')) {
      return `# 🔍 Мок-анализ кода

Это демонстрационный ответ анализа кода в мок-режиме.

## Обнаруженные паттерны:
- ✅ Хорошая структура кода
- ✅ Соответствие TypeScript best practices
- ⚠️ Можно улучшить error handling

## Рекомендации:
1. Добавить более детальную обработку ошибок
2. Использовать строгую типизацию
3. Добавить unit-тесты

*Примечание: Это мок-ответ для демонстрации. В production используйте реальный API.*`;
    }

    if (userContent.includes('документац') || userContent.includes('documentation')) {
      return `# 📚 Мок-генерация документации

\`\`\`typescript
/**
 * Демонстрационная функция
 * @param input - Входные данные
 * @returns Обработанный результат
 * @example
 * const result = demoFunction('test');
 */
function demoFunction(input: string): string {
  return \`Processed: \${input}\`;
}
\`\`\`

*Примечание: Это мок-ответ для демонстрации.*`;
    }

    if (userContent.includes('тест') || userContent.includes('test')) {
      return `# 🧪 Мок-генерация тестов

\`\`\`typescript
import { describe, it, expect } from '@jest/globals';

describe('Demo Test Suite', () => {
  it('should work correctly', () => {
    const result = demoFunction('test');
    expect(result).toBe('Processed: test');
  });
});
\`\`\`

*Примечание: Это мок-ответ для демонстрации.*`;
    }

    if (userContent.includes('api is working') || userContent.includes('health')) {
      return 'API is working correctly in mock mode';
    }

    // Общий мок-ответ
    return `# 🤖 DeepSeek R1 Мок-режим

Это демонстрационный ответ от DeepSeek R1 в мок-режиме.

Ваш запрос: "${lastMessage.content.slice(0, 100)}..."

В production режиме здесь был бы реальный ответ от DeepSeek R1 AI.

**Время:** ${new Date().toISOString()}
**Модель:** ${this.model} (мок)
**Сообщений:** ${messages.length}`;
  }
}

export const deepSeekService = new DeepSeekService();
