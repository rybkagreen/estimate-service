#!/usr/bin/env node

/**
 * HTTP Test Server for Local DeepSeek R1 MCP
 * HTTP сервер для тестирования локальной модели DeepSeek R1
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as http from 'http';
import { logger } from './utils/logger.js';

/**
 * Инструменты для локальной модели
 */
const LOCAL_TOOLS = [
  {
    name: 'local_deepseek_chat',
    description: 'Общение с локальной моделью DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Сообщение для модели' },
        context: { type: 'string', description: 'Дополнительный контекст' }
      },
      required: ['message']
    }
  },
  {
    name: 'local_deepseek_health_check',
    description: 'Проверка статуса локальной модели',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false
    }
  }
];

/**
 * Эмуляция локальной модели DeepSeek R1
 */
class LocalDeepSeekEmulator {
  private initialized = false;

  async initialize() {
    if (!this.initialized) {
      logger.info('🤗 Инициализация локальной модели DeepSeek R1...');
      await new Promise(resolve => setTimeout(resolve, 500));
      this.initialized = true;
      logger.info('✅ Локальная модель готова (режим эмуляции)');
    }
  }

  async chat(message: string, context?: string): Promise<string> {
    await this.initialize();

    // Более реалистичная эмуляция ответов
    if (message.toLowerCase().includes('анализ') || message.toLowerCase().includes('analyze')) {
      return `🔍 **Анализ кода (DeepSeek R1 Local)**

Проанализировал ваш запрос: "${message}"

**Рекомендации:**
1. Код структурирован корректно
2. Рассмотрите добавление типизации TypeScript
3. Добавьте unit-тесты для критически важных функций
4. Используйте ESLint/Prettier для форматирования

${context ? `**Контекст:** ${context}` : ''}

*Ответ сгенерирован локальной моделью DeepSeek R1*`;
    }

    if (message.toLowerCase().includes('тест') || message.toLowerCase().includes('test')) {
      return `🧪 **Генерация тестов (DeepSeek R1 Local)**

\`\`\`typescript
describe('Тестирование функциональности', () => {
  test('должен корректно обрабатывать входные данные', () => {
    // Arrange
    const input = { message: '${message}' };

    // Act
    const result = processInput(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
\`\`\`

*Тесты сгенерированы локальной моделью DeepSeek R1*`;
    }

    return `🤖 **DeepSeek R1 (Локальная модель)**

Получил ваше сообщение: "${message}"

${context ? `Контекст: ${context}\n\n` : ''}Я готов помочь с:
- 📊 Анализом кода
- 📚 Написанием документации
- 🧪 Генерацией тестов
- 🔄 Рефакторингом
- 🏗️ Архитектурными решениями

*Работаю в режиме локальной эмуляции*`;
  }

  getStatus() {
    return {
      status: this.initialized ? 'ready' : 'initializing',
      model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
      mode: 'local_emulation',
      initialized: this.initialized,
      features: ['code_analysis', 'documentation', 'test_generation', 'refactoring']
    };
  }
}

const localModel = new LocalDeepSeekEmulator();

/**
 * Создание MCP сервера
 */
function createMCPServer() {
  const server = new Server(
    {
      name: 'estimate-service-local-deepseek-http',
      version: '1.0.0',
      description: 'HTTP MCP server with local DeepSeek R1 emulation',
    }
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
          const response = await localModel.chat(message, context);

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
          const status = localModel.getStatus();

          return {
            content: [
              {
                type: 'text',
                text: `# 💚 Статус локальной модели DeepSeek R1

**Статус:** ${status.status}
**Модель:** ${status.model}
**Режим:** ${status.mode}
**Инициализирована:** ${status.initialized ? '✅' : '❌'}
**Возможности:** ${status.features.join(', ')}

${status.initialized ?
                    '✅ **Локальная модель готова к работе**' :
                    '⏳ **Модель инициализируется...**'
                  }

Для полноценной работы загрузите реальную модель DeepSeek R1 с Hugging Face.`,
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
            text: `❌ Ошибка: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  });

  return server;
}

/**
 * HTTP сервер для тестирования
 */
async function main() {
  logger.info('🚀 Запуск HTTP MCP сервера с локальной DeepSeek R1...');

  const server = createMCPServer();

  // HTTP сервер
  const httpServer = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        service: 'estimate-service-mcp-local',
        model: 'deepseek-r1-local-emulation',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>Estimate Service MCP - Local DeepSeek R1</title></head>
          <body>
            <h1>🤖 Estimate Service MCP Server</h1>
            <h2>🤗 Локальная модель DeepSeek R1</h2>
            <p><strong>Статус:</strong> Активен</p>
            <p><strong>Режим:</strong> Локальная эмуляция</p>
            <p><strong>Доступные инструменты:</strong></p>
            <ul>
              <li>local_deepseek_chat - Общение с моделью</li>
              <li>local_deepseek_health_check - Проверка статуса</li>
            </ul>
            <p><a href="/health">Проверить статус</a></p>
          </body>
        </html>
      `);
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });

  const PORT = 9460;
  httpServer.listen(PORT, () => {
    logger.info(`✅ HTTP сервер запущен на порту ${PORT}`);
    logger.info(`🌐 Откройте http://localhost:${PORT} для проверки`);
    logger.info('🤗 Локальная модель DeepSeek R1 готова (режим эмуляции)');
  });

  // Инициализация модели
  await localModel.initialize();
}

// Обработка завершения
process.on('SIGINT', () => {
  logger.info('🛑 Завершение работы сервера...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Завершение работы сервера...');
  process.exit(0);
});

// Запуск
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });
}
