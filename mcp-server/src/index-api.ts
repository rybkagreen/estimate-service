#!/usr/bin/env node

/**
 * MCP Server for DeepSeek R1 via Hugging Face API
 * Использует платную подписку Hugging Face для работы с DeepSeek R1
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { config } from './config/index.js';
import { novitaClient } from './services/novita-client.service.js';
import { logger } from './utils/logger.js';

/**
 * MCP сервер для работы с DeepSeek R1 через Hugging Face API
 */
class McpDeepSeekApiServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'estimate-service-deepseek-api',
        version: '1.0.0',
        description: 'MCP server with DeepSeek R1 via Hugging Face API',
      }
    );

    this.setupErrorHandling();
    this.setupToolHandlers();
  }

  /**
   * Настройка обработки ошибок
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      logger.error('❌ MCP Server error:', error);
    };

    process.on('SIGINT', async () => {
      logger.info('🛑 Received SIGINT, shutting down gracefully...');
      await this.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('🛑 Received SIGTERM, shutting down gracefully...');
      await this.cleanup();
      process.exit(0);
    });
  }

  /**
   * Настройка handlers для инструментов
   */
  private setupToolHandlers(): void {
    // Список доступных инструментов
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'chat_with_deepseek',
            description: 'Общение с моделью DeepSeek R1 через Hugging Face API',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Сообщение для модели',
                },
                system_prompt: {
                  type: 'string',
                  description: 'Системный промпт (опционально)',
                },
                temperature: {
                  type: 'number',
                  description: 'Температура для генерации (0.0-1.0)',
                  minimum: 0,
                  maximum: 1,
                },
                max_tokens: {
                  type: 'number',
                  description: 'Максимальное количество токенов',
                },
                stream: {
                  type: 'boolean',
                  description: 'Использовать потоковую генерацию',
                },
              },
              required: ['message'],
            },
          },
          {
            name: 'analyze_code',
            description: 'Анализ кода с помощью DeepSeek R1',
            inputSchema: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Код для анализа',
                },
                language: {
                  type: 'string',
                  description: 'Язык программирования',
                  default: 'typescript',
                },
                focus: {
                  type: 'string',
                  description: 'На чем сосредоточиться при анализе',
                  enum: ['performance', 'security', 'readability', 'best-practices', 'bugs'],
                },
              },
              required: ['code'],
            },
          },
          {
            name: 'generate_tests',
            description: 'Генерация тестов для кода',
            inputSchema: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Код для создания тестов',
                },
                language: {
                  type: 'string',
                  description: 'Язык программирования',
                  default: 'typescript',
                },
                test_framework: {
                  type: 'string',
                  description: 'Фреймворк для тестирования',
                  enum: ['jest', 'vitest', 'mocha', 'jasmine'],
                  default: 'jest',
                },
                coverage_type: {
                  type: 'string',
                  description: 'Тип покрытия тестами',
                  enum: ['unit', 'integration', 'e2e'],
                  default: 'unit',
                },
              },
              required: ['code'],
            },
          },
          {
            name: 'refactor_code',
            description: 'Рефакторинг кода',
            inputSchema: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Код для рефакторинга',
                },
                language: {
                  type: 'string',
                  description: 'Язык программирования',
                  default: 'typescript',
                },
                instructions: {
                  type: 'string',
                  description: 'Специальные инструкции для рефакторинга',
                },
                focus: {
                  type: 'string',
                  description: 'Фокус рефакторинга',
                  enum: ['performance', 'readability', 'maintainability', 'patterns'],
                },
              },
              required: ['code'],
            },
          },
          {
            name: 'health_check',
            description: 'Проверка состояния DeepSeek API сервиса',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Выполнение инструментов
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'chat_with_deepseek':
            return await this.chatWithDeepSeek(args);
          case 'analyze_code':
            return await this.analyzeCode(args);
          case 'generate_tests':
            return await this.generateTests(args);
          case 'refactor_code':
            return await this.refactorCode(args);
          case 'health_check':
            return await this.healthCheck();
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`❌ Tool execution failed: ${name}`, error);

        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${errorMessage}`
        );
      }
    });
  }

  /**
   * Общение с DeepSeek R1
   */
  private async chatWithDeepSeek(args: any) {
    const {
      message,
      system_prompt,
      temperature,
      max_tokens,
      stream = false,
    } = args;

    const messages = [];

    if (system_prompt) {
      messages.push({
        role: 'system' as const,
        content: system_prompt,
      });
    }

    messages.push({
      role: 'user' as const,
      content: message,
    });

    const response = await novitaClient.generateResponse(messages, {
      temperature,
      maxTokens: max_tokens,
      stream,
    });

    return {
      content: [
        {
          type: 'text',
          text: response.content,
        },
      ],
      isError: false,
    };
  }

  /**
   * Анализ кода
   */
  private async analyzeCode(args: any) {
    const { code, language = 'typescript', focus } = args;

    // Анализ кода через generateResponse
    const analysisMessages = [
      {
        role: 'system' as const,
        content: 'Ты эксперт по анализу кода. Проанализируй предоставленный код и дай подробный анализ.',
      },
      {
        role: 'user' as const,
        content: `Проанализируй этот ${language} код:\n\n\`\`\`${language}\n${code}\n\`\`\``,
      },
    ];

    const analysisResponse = await novitaClient.generateResponse(analysisMessages, {
      temperature: 0.3,
      maxTokens: 1024,
    });

    let analysis = analysisResponse.content;

    if (focus) {
      const focusPrompt = `Дополнительно сосредоточься на аспекте: ${focus}`;
      const focusedAnalysis = await novitaClient.generateResponse([
        {
          role: 'system',
          content: focusPrompt,
        },
        {
          role: 'user',
          content: `Проанализируй этот код:\n\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ], { temperature: 0.2 });

      analysis += '\n\n### Фокусированный анализ:\n' + focusedAnalysis.content;
    }

    return {
      content: [
        {
          type: 'text',
          text: analysis,
        },
      ],
      isError: false,
    };
  }

  /**
   * Генерация тестов
   */
  private async generateTests(args: any) {
    const {
      code,
      language = 'typescript',
      test_framework = 'jest',
      coverage_type = 'unit',
    } = args;

    const messages = [
      {
        role: 'system' as const,
        content: `Ты эксперт по тестированию. Создай ${coverage_type} тесты для предоставленного кода на ${language} используя ${test_framework}.`,
      },
      {
        role: 'user' as const,
        content: `Создай тесты для этого кода:\n\n\`\`\`${language}\n${code}\n\`\`\``,
      },
    ];

    const response = await novitaClient.generateResponse(messages, {
      temperature: 0.2,
      maxTokens: 3072,
    });

    return {
      content: [
        {
          type: 'text',
          text: response.content,
        },
      ],
      isError: false,
    };
  }

  /**
   * Рефакторинг кода
   */
  private async refactorCode(args: any) {
    const {
      code,
      language = 'typescript',
      instructions,
      focus,
    } = args;

    // Рефакторинг кода через generateResponse
    const refactorMessages = [
      {
        role: 'system' as const,
        content: 'Ты эксперт по рефакторингу кода. Улучши предоставленный код согласно инструкциям.',
      },
      {
        role: 'user' as const,
        content: `Отрефактори этот ${language} код согласно инструкциям: ${instructions}\n\n\`\`\`${language}\n${code}\n\`\`\``,
      },
    ];

    const refactorResponse = await novitaClient.generateResponse(refactorMessages, {
      temperature: 0.2,
      maxTokens: 2048,
    });

    let refactoredCode = refactorResponse.content;

    if (focus) {
      const focusPrompt = `Дополнительно сосредоточься на: ${focus}`;
      const focusedRefactorMessages = [
        {
          role: 'system' as const,
          content: 'Ты эксперт по рефакторингу кода. Улучши предоставленный код с фокусом на конкретном аспекте.',
        },
        {
          role: 'user' as const,
          content: `Отрефактори этот ${language} код с фокусом на: ${focusPrompt}\n\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ];

      const focusedRefactorResponse = await novitaClient.generateResponse(focusedRefactorMessages, {
        temperature: 0.2,
        maxTokens: 2048,
      });

      const focusedRefactor = focusedRefactorResponse.content;

      refactoredCode += '\n\n### Альтернативный вариант с фокусом на ' + focus + ':\n' + focusedRefactor;
    }

    return {
      content: [
        {
          type: 'text',
          text: refactoredCode,
        },
      ],
      isError: false,
    };
  }

  /**
   * Проверка состояния сервиса
   */
  private async healthCheck() {
    const status = novitaClient.getHealthStatus();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(status, null, 2),
        },
      ],
      isError: false,
    };
  }

  /**
   * Запуск сервера
   */
  async start(): Promise<void> {
    logger.info('🚀 Starting MCP DeepSeek API Server...');

    try {
      // Инициализация HuggingFace Novita API сервиса
      await novitaClient.testConnection();

      // Создание transport
      const transport = new StdioServerTransport();

      // Подключение сервера к transport
      await this.server.connect(transport);

      logger.info('✅ MCP DeepSeek API Server started successfully');
      logger.info(`🤖 Using model: ${config.ai.huggingface?.modelName}`);
      logger.info(`🔗 API Mode: ${config.ai.huggingface?.useApi ? 'Enabled' : 'Disabled'}`);
    } catch (error) {
      logger.error('❌ Failed to start MCP DeepSeek API Server:', error);
      throw error;
    }
  }

  /**
   * Очистка ресурсов
   */
  private async cleanup(): Promise<void> {
    logger.info('🧹 Cleaning up MCP DeepSeek API Server...');

    try {
      // Novita client не требует специальной очистки
      logger.info('✅ MCP DeepSeek API Server cleanup completed');
    } catch (error) {
      logger.error('❌ Error during cleanup:', error);
    }
  }
}

// Запуск сервера если файл выполняется напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new McpDeepSeekApiServer();

  server.start().catch((error) => {
    logger.error('💥 Fatal error starting server:', error);
    process.exit(1);
  });
}

export { McpDeepSeekApiServer };
