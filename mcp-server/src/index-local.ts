#!/usr/bin/env node

/**
 * Estimate Service MCP Server with Local DeepSeek R1
 * MCP сервер с поддержкой локальной модели DeepSeek R1 через Hugging Face
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { huggingFaceLocalService } from './services/huggingface-local.service.js';
import { logger } from './utils/logger.js';

/**
 * Local DeepSeek R1 tools definitions
 */
const LOCAL_DEEPSEEK_TOOLS = [
  {
    name: 'local_deepseek_analyze_code',
    description: 'Анализ кода с помощью локальной модели DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Код для анализа' },
        context: { type: 'string', description: 'Контекст анализа' },
        language: { type: 'string', enum: ['typescript', 'javascript', 'react', 'nestjs', 'python'], description: 'Язык программирования' }
      },
      required: ['code']
    }
  },
  {
    name: 'local_deepseek_generate_docs',
    description: 'Генерация документации с помощью локальной модели DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Код для документирования' },
        type: { type: 'string', enum: ['function', 'class', 'component', 'api', 'module'], description: 'Тип документации' },
        format: { type: 'string', enum: ['jsdoc', 'markdown', 'typescript'], description: 'Формат документации', default: 'jsdoc' }
      },
      required: ['code']
    }
  },
  {
    name: 'local_deepseek_generate_tests',
    description: 'Генерация тестов с помощью локальной модели DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Код для создания тестов' },
        framework: { type: 'string', enum: ['jest', 'vitest', 'playwright', 'cypress'], description: 'Тестовый фреймворк' },
        testType: { type: 'string', enum: ['unit', 'integration', 'e2e'], description: 'Тип тестов' },
        coverage: { type: 'boolean', description: 'Включить покрытие кода', default: true }
      },
      required: ['code']
    }
  },
  {
    name: 'local_deepseek_refactor_code',
    description: 'Рефакторинг кода с помощью локальной модели DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Код для рефакторинга' },
        goals: { type: 'array', items: { type: 'string' }, description: 'Цели рефакторинга' },
        style: { type: 'string', enum: ['clean-code', 'performance', 'maintainability', 'readability'], description: 'Стиль рефакторинга' }
      },
      required: ['code']
    }
  },
  {
    name: 'local_deepseek_architecture_advice',
    description: 'Архитектурные советы от локальной модели DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Описание задачи или проблемы' },
        constraints: { type: 'array', items: { type: 'string' }, description: 'Технические ограничения' },
        domain: { type: 'string', enum: ['frontend', 'backend', 'fullstack', 'database', 'devops', 'mobile'], description: 'Область разработки' },
        scale: { type: 'string', enum: ['small', 'medium', 'large', 'enterprise'], description: 'Масштаб проекта' }
      },
      required: ['description']
    }
  },
  {
    name: 'local_deepseek_chat',
    description: 'Общение с локальной моделью DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Сообщение для DeepSeek R1' },
        context: { type: 'string', description: 'Дополнительный контекст' },
        temperature: { type: 'number', minimum: 0, maximum: 1, description: 'Температура для генерации', default: 0.7 },
        maxTokens: { type: 'number', minimum: 1, maximum: 2048, description: 'Максимальное количество токенов', default: 512 }
      },
      required: ['message']
    }
  },
  {
    name: 'local_deepseek_health_check',
    description: 'Проверка работоспособности локальной модели DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: 'local_deepseek_code_review',
    description: 'Код-ревью с помощью локальной модели DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Код для ревью' },
        checklist: { type: 'array', items: { type: 'string' }, description: 'Пункты для проверки' },
        severity: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Уровень строгости проверки', default: 'medium' }
      },
      required: ['code']
    }
  }
];

/**
 * Создание и настройка MCP сервера
 */
async function createServer(): Promise<Server> {
  const server = new Server(
    {
      name: 'estimate-service-local-deepseek',
      version: '1.0.0',
      description: 'MCP server with local DeepSeek R1 model support',
    }
  );

  // Обработчик списка инструментов
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug('📋 Listing available tools');
    return {
      tools: LOCAL_DEEPSEEK_TOOLS,
    };
  });

  // Обработчик вызова инструментов
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info(`🔧 Tool called: ${name}`);
    logger.debug('🔧 Tool arguments:', args);

    try {
      switch (name) {
        case 'local_deepseek_analyze_code':
          return await handleCodeAnalysis(args);

        case 'local_deepseek_generate_docs':
          return await handleDocumentationGeneration(args);

        case 'local_deepseek_generate_tests':
          return await handleTestGeneration(args);

        case 'local_deepseek_refactor_code':
          return await handleCodeRefactoring(args);

        case 'local_deepseek_architecture_advice':
          return await handleArchitectureAdvice(args);

        case 'local_deepseek_chat':
          return await handleChat(args);

        case 'local_deepseek_health_check':
          return await handleHealthCheck();

        case 'local_deepseek_code_review':
          return await handleCodeReview(args);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error(`❌ Tool execution error for ${name}:`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Ошибка выполнения инструмента ${name}: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  });

  return server;
}

/**
 * Обработка анализа кода
 */
async function handleCodeAnalysis(args: any) {
  const { code, context = '', language = 'typescript' } = args;

  const systemPrompt = `Ты - эксперт по анализу кода. Проанализируй предоставленный код и дай подробную оценку:

1. Качество кода (читаемость, структура)
2. Потенциальные проблемы и баги
3. Производительность
4. Безопасность
5. Соответствие best practices
6. Конкретные рекомендации по улучшению

Язык программирования: ${language}
${context ? `Дополнительный контекст: ${context}` : ''}

Код для анализа:`;

  const response = await huggingFaceLocalService.generateResponse([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: code }
  ]);

  return {
    content: [
      {
        type: 'text',
        text: `# 🔍 Анализ кода (${language})\n\n${response}`,
      },
    ],
  };
}

/**
 * Обработка генерации документации
 */
async function handleDocumentationGeneration(args: any) {
  const { code, type = 'function', format = 'jsdoc' } = args;

  const systemPrompt = `Ты - эксперт по написанию технической документации. Создай качественную документацию для предоставленного кода:

Тип: ${type}
Формат: ${format}

Требования:
- Подробное описание назначения
- Документация всех параметров
- Примеры использования
- Описание возвращаемых значений
- Обработка ошибок (если применимо)

Код для документирования:`;

  const response = await huggingFaceLocalService.generateResponse([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: code }
  ]);

  return {
    content: [
      {
        type: 'text',
        text: `# 📚 Документация (${type}, ${format})\n\n${response}`,
      },
    ],
  };
}

/**
 * Обработка генерации тестов
 */
async function handleTestGeneration(args: any) {
  const { code, framework = 'jest', testType = 'unit', coverage = true } = args;

  const systemPrompt = `Ты - эксперт по написанию тестов. Создай comprehensive тесты для предоставленного кода:

Фреймворк: ${framework}
Тип тестов: ${testType}
Покрытие кода: ${coverage ? 'включено' : 'выключено'}

Требования:
- Полное покрытие функциональности
- Тестирование edge cases
- Правильная структура тестов
- Моки и стабы где необходимо
- Проверка ошибок

Код для тестирования:`;

  const response = await huggingFaceLocalService.generateResponse([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: code }
  ]);

  return {
    content: [
      {
        type: 'text',
        text: `# 🧪 Тесты (${framework}, ${testType})\n\n${response}`,
      },
    ],
  };
}

/**
 * Обработка рефакторинга кода
 */
async function handleCodeRefactoring(args: any) {
  const { code, goals = [], style = 'clean-code' } = args;

  const goalsText = goals.length > 0 ? goals.join(', ') : 'улучшение качества кода';
  const systemPrompt = `Ты - эксперт по рефакторингу кода. Предложи улучшенную версию кода:

Цели рефакторинга: ${goalsText}
Стиль: ${style}

Требования:
- Сохранить функциональность
- Улучшить читаемость
- Оптимизировать производительность
- Следовать принципам ${style}
- Объяснить изменения

Код для рефакторинга:`;

  const response = await huggingFaceLocalService.generateResponse([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: code }
  ]);

  return {
    content: [
      {
        type: 'text',
        text: `# 🔄 Рефакторинг (${style})\n\nЦели: ${goalsText}\n\n${response}`,
      },
    ],
  };
}

/**
 * Обработка архитектурных советов
 */
async function handleArchitectureAdvice(args: any) {
  const { description, constraints = [], domain = 'fullstack', scale = 'medium' } = args;

  const constraintsText = constraints.length > 0 ? constraints.join(', ') : 'нет особых ограничений';
  const systemPrompt = `Ты - архитектор программного обеспечения. Дай экспертный совет по архитектуре:

Область: ${domain}
Масштаб: ${scale}
Ограничения: ${constraintsText}

Требования:
- Подходящие архитектурные паттерны
- Технологический стек
- Структура проекта
- Масштабируемость
- Производительность
- Безопасность

Описание задачи:`;

  const response = await huggingFaceLocalService.generateResponse([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: description }
  ]);

  return {
    content: [
      {
        type: 'text',
        text: `# 🏗️ Архитектурные рекомендации (${domain}, ${scale})\n\n${response}`,
      },
    ],
  };
}

/**
 * Обработка чата
 */
async function handleChat(args: any) {
  const { message, context = '', temperature = 0.7, maxTokens = 512 } = args;

  const systemPrompt = `Ты - DeepSeek R1, продвинутая AI-модель для разработки ПО. Ты работаешь локально и помогаешь разработчикам.

${context ? `Контекст: ${context}` : ''}

Отвечай профессионально, конструктивно и с пониманием специфики разработки.`;

  const response = await huggingFaceLocalService.generateResponse([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ], {
    temperature,
    maxTokens
  });

  return {
    content: [
      {
        type: 'text',
        text: `# 🤖 DeepSeek R1 (Local)\n\n${response}`,
      },
    ],
  };
}

/**
 * Обработка проверки здоровья
 */
async function handleHealthCheck() {
  const health = await huggingFaceLocalService.healthCheck();

  return {
    content: [
      {
        type: 'text',
        text: `# 💚 Статус локальной модели DeepSeek R1

**Статус:** ${health.status}
**Модель:** ${health.model}
**Инициализирована:** ${health.initialized ? '✅' : '❌'}
**Режим эмуляции:** ${health.mockMode ? '🎭' : '🤖'}

${health.mockMode ?
            '⚠️ **Работает в режиме эмуляции.** Для полной функциональности загрузите локальную модель.' :
            '✅ **Локальная модель готова к работе.**'
          }`,
      },
    ],
  };
}

/**
 * Обработка код-ревью
 */
async function handleCodeReview(args: any) {
  const { code, checklist = [], severity = 'medium' } = args;

  const checklistText = checklist.length > 0 ?
    `\nДополнительные пункты для проверки: ${checklist.join(', ')}` : '';

  const systemPrompt = `Ты - опытный код-ревьюер. Проведи детальный код-ревью:

Уровень строгости: ${severity}
${checklistText}

Проверь:
- Корректность логики
- Читаемость и стиль
- Производительность
- Безопасность
- Тестируемость
- Соответствие стандартам

Дай конструктивные комментарии и предложения по улучшению.

Код для ревью:`;

  const response = await huggingFaceLocalService.generateResponse([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: code }
  ]);

  return {
    content: [
      {
        type: 'text',
        text: `# 👀 Код-ревью (уровень: ${severity})\n\n${response}`,
      },
    ],
  };
}

/**
 * Основная функция запуска сервера
 */
async function main() {
  logger.info('🚀 Starting Estimate Service MCP Server with Local DeepSeek R1...');

  try {
    const server = await createServer();
    const transport = new StdioServerTransport();

    logger.info('✅ MCP Server ready with local DeepSeek R1 support');
    logger.info('🤗 Available tools: code analysis, documentation, tests, refactoring, architecture advice, chat, health check, code review');

    await server.connect(transport);
  } catch (error) {
    logger.error('❌ Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Обработка сигналов завершения
process.on('SIGINT', async () => {
  logger.info('🛑 Shutting down MCP server...');
  await huggingFaceLocalService.dispose();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Shutting down MCP server...');
  await huggingFaceLocalService.dispose();
  process.exit(0);
});

// Запуск сервера
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { createServer, main };
