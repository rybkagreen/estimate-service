/**
 * Local Hugging Face DeepSeek R1 Model Service
 * Сервис для работы с локальной моделью DeepSeek R1 через Hugging Face Transformers
 */

import { AutoModelForCausalLM, AutoTokenizer, pipeline } from '@huggingface/transformers';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface HuggingFaceMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface HuggingFaceGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  repetitionPenalty?: number;
}

/**
 * Сервис для работы с локальной моделью DeepSeek R1
 */
export class HuggingFaceLocalService {
  private model: any = null;
  private tokenizer: any = null;
  private generator: any = null;
  private isInitialized = false;
  private readonly modelName: string;
  private readonly modelPath: string;
  private mockMode: boolean;

  constructor() {
    // Локальная модель DeepSeek R1
    this.modelName = config.ai.huggingface?.modelName || 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B';
    this.modelPath = config.ai.huggingface?.modelPath || './models/deepseek-r1';
    this.mockMode = config.ai.huggingface?.mockMode || false;

    logger.info(`🤗 HuggingFace Local Service initialized`);
    logger.debug('🔧 HuggingFace config:', {
      modelName: this.modelName,
      modelPath: this.modelPath,
      mockMode: this.mockMode,
    });
  }

  /**
   * Инициализация локальной модели
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('🚀 Initializing local DeepSeek R1 model...');

      if (this.mockMode) {
        logger.info('🎭 Running in mock mode - skipping model loading');
        this.isInitialized = true;
        return;
      }

      // Попробуем загрузить модель из локального пути, если не получится - скачаем
      try {
        logger.info(`📂 Trying to load model from local path: ${this.modelPath}`);
        this.tokenizer = await AutoTokenizer.from_pretrained(this.modelPath);
        this.model = await AutoModelForCausalLM.from_pretrained(this.modelPath);
      } catch (localError) {
        logger.warn('⚠️ Local model not found, downloading from Hugging Face...');
        logger.info(`📥 Downloading model: ${this.modelName}`);

        // Скачиваем модель с Hugging Face
        this.tokenizer = await AutoTokenizer.from_pretrained(this.modelName);
        this.model = await AutoModelForCausalLM.from_pretrained(this.modelName, {
          // Настройки для экономии памяти
          // torch_dtype: 'float16', // Не поддерживается в JS версии
          // device_map: 'auto',     // Не поддерживается в JS версии
          // Сохраняем модель локально для последующего использования
          cache_dir: this.modelPath,
        });

        logger.info(`💾 Model saved to: ${this.modelPath}`);
      }

      // Создаем генератор текста
      this.generator = await pipeline('text-generation', this.modelName);

      this.isInitialized = true;
      logger.info('✅ DeepSeek R1 model initialized successfully');

    } catch (error) {
      logger.error('❌ Failed to initialize DeepSeek R1 model:', error);

      // Fallback to mock mode if initialization fails
      logger.warn('🎭 Falling back to mock mode');
      this.mockMode = true;
      this.isInitialized = true;
    }
  }

  /**
   * Генерация ответа с помощью локальной модели
   */
  async generateResponse(
    messages: HuggingFaceMessage[],
    options: HuggingFaceGenerationOptions = {}
  ): Promise<string> {
    await this.initialize();

    try {
      logger.debug('🚀 Generating response with DeepSeek R1:', {
        messagesCount: messages.length,
        temperature: options.temperature,
        mockMode: this.mockMode,
      });

      // Мок-режим для тестирования
      if (this.mockMode) {
        return this.generateMockResponse(messages);
      }

      // Формируем промпт из сообщений
      const prompt = this.formatMessagesAsPrompt(messages);

      // Генерируем ответ
      const result = await this.generator(prompt, {
        max_new_tokens: options.maxTokens || 512,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.9,
        top_k: options.topK || 50,
        repetition_penalty: options.repetitionPenalty || 1.1,
        do_sample: true,
        return_full_text: false,
      });

      const generatedText = result[0]?.generated_text || '';

      logger.debug('✅ Response generated successfully');
      return generatedText.trim();

    } catch (error) {
      logger.error('❌ Error generating response:', error);

      // Fallback to mock response
      logger.warn('🎭 Falling back to mock response');
      return this.generateMockResponse(messages);
    }
  }

  /**
   * Форматирование сообщений в промпт
   */
  private formatMessagesAsPrompt(messages: HuggingFaceMessage[]): string {
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
   * Генерация мок-ответа для тестирования
   */
  private generateMockResponse(messages: HuggingFaceMessage[]): string {
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || '';

    // Базовые мок-ответы в зависимости от типа запроса
    if (userMessage.toLowerCase().includes('анализ') || userMessage.toLowerCase().includes('analyze')) {
      return `🔍 Анализ кода (Mock Response):

Основные наблюдения:
- Код структурирован и читаем
- Соблюдаются принципы чистого кода
- Рекомендуется добавить типизацию TypeScript
- Стоит рассмотреть добавление unit-тестов

Предложения по улучшению:
1. Добавить JSDoc комментарии
2. Реализовать error handling
3. Оптимизировать производительность`;
    }

    if (userMessage.toLowerCase().includes('документаци') || userMessage.toLowerCase().includes('docs')) {
      return `📚 Документация (Mock Response):

## Описание
Функция выполняет специфическую задачу в контексте приложения.

## Параметры
- \`param1\` - описание первого параметра
- \`param2\` - описание второго параметра

## Возвращаемое значение
Возвращает результат операции в указанном формате.

## Пример использования
\`\`\`typescript
const result = functionName(param1, param2);
\`\`\``;
    }

    if (userMessage.toLowerCase().includes('тест') || userMessage.toLowerCase().includes('test')) {
      return `🧪 Unit-тесты (Mock Response):

\`\`\`typescript
describe('Component Tests', () => {
  test('should handle basic functionality', () => {
    // Arrange
    const input = { test: 'data' };

    // Act
    const result = component.process(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  test('should handle edge cases', () => {
    // Arrange
    const edgeCase = null;

    // Act & Assert
    expect(() => component.process(edgeCase))
      .toThrow('Invalid input');
  });
});
\`\`\``;
    }

    // Общий мок-ответ
    return `🤖 DeepSeek R1 Response (Mock Mode):

Привет! Я DeepSeek R1 в режиме эмуляции. Ваш запрос: "${userMessage}"

В реальном режиме я бы:
- Проанализировал ваш код с помощью передовых алгоритмов
- Предоставил детальные рекомендации
- Сгенерировал качественную документацию
- Создал comprehensive тесты

Для полной функциональности загрузите локальную модель DeepSeek R1.`;
  }

  /**
   * Проверка работоспособности сервиса
   */
  async healthCheck(): Promise<{ status: string; model: string; initialized: boolean; mockMode: boolean }> {
    return {
      status: this.isInitialized ? 'healthy' : 'not_initialized',
      model: this.modelName,
      initialized: this.isInitialized,
      mockMode: this.mockMode,
    };
  }

  /**
   * Освобождение ресурсов
   */
  async dispose(): Promise<void> {
    if (this.model) {
      // Освобождаем память, занятую моделью
      this.model = null;
    }
    if (this.tokenizer) {
      this.tokenizer = null;
    }
    if (this.generator) {
      this.generator = null;
    }
    this.isInitialized = false;
    logger.info('🧹 HuggingFace Local Service disposed');
  }
}

// Экспортируем singleton instance
export const huggingFaceLocalService = new HuggingFaceLocalService();
