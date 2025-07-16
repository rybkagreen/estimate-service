#!/usr/bin/env node

/**
 * Simple Local DeepSeek R1 MCP Server
 * Простая версия MCP сервера с локальной моделью DeepSeek R1
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from './utils/logger.js';
import { deepSeekService } from './services/deepseek.service.js';
import { config } from './config/index.js';

/**
 * Простые инструменты для локальной модели
 */
const LOCAL_TOOLS = [
  {
    name: 'local_deepseek_chat',
    description: 'Общение с локальной моделью DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Сообщение для модели' },
        context: { type: 'string', description: 'Дополнительный контекст' },
      },
      required: ['message'],
    },
  },
  {
    name: 'local_deepseek_health_check',
    description: 'Проверка статуса локальной модели',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
];

/**
 * Управление DeepSeek сервисом
 */
class DeepSeekManager {
  private initialized = false;

  private isShuttingDown = false;

  async initialize() {
    if (!this.initialized && !this.isShuttingDown) {
      try {
        logger.info('🤗 Инициализация DeepSeek сервиса...');
        logger.info(`📋 Конфигурация: ${config.ai.deepseek.mockMode ? 'Mock Mode' : 'API Mode'}`);
        logger.info(`🔧 Модель: ${config.ai.deepseek.model}`);
        logger.info(`🌐 API URL: ${config.ai.deepseek.baseUrl}`);

        // Проверка здоровья сервиса
        const health = await deepSeekService.healthCheck();

        if (health.status === 'ok') {
          this.initialized = true;
          logger.info(`✅ DeepSeek сервис готов к работе (latency: ${health.latency}ms)`);
        } else {
          throw new Error(`DeepSeek health check failed: ${health.message}`);
        }
      } catch (error) {
        logger.error('❌ Ошибка инициализации DeepSeek:', error);
        // В случае ошибки переключаемся в mock режим
        logger.warn('⚠️ Переключение в mock режим из-за ошибки инициализации');
        this.initialized = true; // Позволяем серверу работать в mock режиме
      }
    }
  }

  async generateResponse(message: string, context?: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.isShuttingDown) {
      throw new Error('Сервер завершает работу');
    }

    try {
      const messages = [
        {
          role: 'system' as const,
          content: `Ты - ИИ-ассистент для разработки Estimate Service.
          Помогаешь с архитектурой, кодом и решением технических задач.
          ${context ? `\nКонтекст: ${context}` : ''}`,
        },
        {
          role: 'user' as const,
          content: message,
        },
      ];

      const response = await deepSeekService.chat(messages, {
        temperature: 0.3,
        maxTokens: 2000,
      });

      return response;
    } catch (error) {
      logger.error('❌ Ошибка генерации ответа:', error);
      throw error;
    }
  }

  async getStatus() {
    try {
      const health = await deepSeekService.healthCheck();

      return {
        status: health.status === 'ok' ? 'ready' : 'error',
        model: config.ai.deepseek.model,
        mode: config.ai.deepseek.mockMode ? 'mock' : 'api',
        initialized: this.initialized,
        apiUrl: config.ai.deepseek.baseUrl,
        latency: health.latency,
        message: health.message,
      };
    } catch (error) {
      return {
        status: 'error',
        model: config.ai.deepseek.model,
        mode: config.ai.deepseek.mockMode ? 'mock' : 'api',
        initialized: this.initialized,
        apiUrl: config.ai.deepseek.baseUrl,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  shutdown() {
    this.isShuttingDown = true;
    logger.info('🛑 DeepSeek Manager: начало graceful shutdown');
  }
}

const deepSeekManager = new DeepSeekManager();

/**
 * Основной сервер
 */
async function main() {
  logger.info('🚀 Запуск простого MCP сервера с локальной DeepSeek R1...');

  // Инициализация DeepSeek при запуске
  try {
    await deepSeekManager.initialize();
  } catch (error) {
    logger.error('❌ Не удалось инициализировать DeepSeek:', error);
    logger.info('👉 Продолжаем в mock режиме...');
  }

  const server = new Server(
    {
      name: 'estimate-service-local-simple',
      version: '1.0.0',
      description: 'Simple MCP server with local DeepSeek R1 emulation',
    },
  );

  // Список инструментов
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug('📋 Запрос списка инструментов');

    return { tools: LOCAL_TOOLS };
  });

  // Выполнение инструментов
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info(`🔧 Вызов инструмента: ${name}`);

    try {
      switch (name) {
        case 'local_deepseek_chat': {
          const { message, context } = args as { message: string; context?: string };
          const response = await deepSeekManager.generateResponse(message, context);

          return {
            content: [
              {
                type: 'text',
                text: response,
              },
            ],
          };
        }

        case 'local_deepseek_health_check': {
          const status = await deepSeekManager.getStatus();

          return {
            content: [
              {
                type: 'text',
                text: `# 💚 Статус DeepSeek R1

**Статус:** ${status.status}
**Модель:** ${status.model}
**Режим:** ${status.mode}
**API URL:** ${status.apiUrl}
**Инициализирована:** ${status.initialized ? '✅' : '❌'}
${status.latency ? `**Latency:** ${status.latency}ms` : ''}

${status.message ? `**Сообщение:** ${status.message}` : ''}

${status.status === 'ready'
    ? '✅ **Модель готова к работе**'
    : '⏳ **Модель инициализируется...**'
}`,
              },
            ],
          };
        }

        default:
          throw new Error(`Неизвестный инструмент: ${name}`);
      }
    } catch (error) {
      logger.error(`❌ Ошибка выполнения ${name}:`, error);

      return {
        content: [
          {
            type: 'text',
            text: `Ошибка: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  });

  // Запуск сервера
  const transport = new StdioServerTransport();

  logger.info('✅ MCP сервер готов с локальной поддержкой DeepSeek R1');
  logger.info('🤗 Доступные инструменты: local_deepseek_chat, local_deepseek_health_check');

  await server.connect(transport);
}

// Обработка завершения
process.on('SIGINT', async () => {
  logger.info('🛑 SIGINT получен. Начало graceful shutdown...');
  deepSeekManager.shutdown();
  setTimeout(() => {
    logger.info('🛑 Завершение работы MCP сервера...');
    process.exit(0);
  }, 3000).unref();
});

process.on('SIGTERM', async () => {
  logger.info('🛑 SIGTERM получен. Начало graceful shutdown...');
  deepSeekManager.shutdown();
  setTimeout(() => {
    logger.info('🛑 Завершение работы MCP сервера...');
    process.exit(0);
  }, 3000).unref();
});

// Запуск
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });
}
