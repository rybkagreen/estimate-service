#!/usr/bin/env node

/**
 * Estimate Service MCP Server
 * Model Context Protocol server для разработки Estimate Service
 * Полная версия с всеми инструментами и функциями
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { config } from './config/index.js';
import { setupTools } from './tools/index.js';
import { setupResources } from './resources/index.js';
import { setupServices } from './services/index.js';
import { logger } from './utils/logger.js';
import { ErrorHandler } from './utils/error-handler.js';
import { MetricsCollector } from './utils/metrics.js';

/**
 * Главный класс MCP сервера Estimate Service
 */
class EstimateServiceMCPServer {
  private server: Server;
  private metrics: MetricsCollector;
  private errorHandler: ErrorHandler;

  constructor() {
    this.server = new Server(
      {
        name: 'estimate-service-mcp',
        version: '1.0.0',
        description: 'MCP сервер для разработки Estimate Service с ИИ-ассистентом',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
          logging: {},
        },
      }
    );

    this.metrics = new MetricsCollector();
    this.errorHandler = new ErrorHandler();
  }

  /**
   * Инициализация сервера
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🚀 Инициализация Estimate Service MCP Server...');

      // Настройка сервисов
      await setupServices(this.server, config);
      logger.info('✅ Сервисы инициализированы');

      // Настройка инструментов
      await setupTools(this.server, config);
      logger.info('✅ Инструменты настроены');

      // Настройка ресурсов
      await setupResources(this.server, config);
      logger.info('✅ Ресурсы настроены');

      // Настройка обработчиков
      this.setupHandlers();
      logger.info('✅ Обработчики настроены');

      logger.info('🎉 Estimate Service MCP Server успешно инициализирован');
    } catch (error) {
      logger.error('❌ Ошибка инициализации MCP сервера:', error);
      throw error;
    }
  }

  /**
   * Настройка обработчиков событий
   */
  private setupHandlers(): void {
    // Обработчик списка инструментов
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const startTime = Date.now();

      try {
        const tools = await this.server.listTools();
        this.metrics.recordToolListRequest(Date.now() - startTime);

        logger.debug(`📋 Запрошен список инструментов (${tools.tools.length} tools)`);
        return tools;
      } catch (error) {
        this.errorHandler.handleError('list_tools', error);
        throw error;
      }
    });

    // Обработчик вызова инструментов
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const startTime = Date.now();
      const { name, arguments: args } = request.params;

      try {
        logger.info(`🔧 Вызов инструмента: ${name}`, { args });

        const result = await this.server.callTool(request.params);

        this.metrics.recordToolCall(name, Date.now() - startTime, true);
        logger.debug(`✅ Инструмент ${name} выполнен успешно`);

        return result;
      } catch (error) {
        this.metrics.recordToolCall(name, Date.now() - startTime, false);
        this.errorHandler.handleError(`tool_${name}`, error);

        logger.error(`❌ Ошибка выполнения инструмента ${name}:`, error);
        throw error;
      }
    });

    // Обработчик списка ресурсов
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const startTime = Date.now();

      try {
        const resources = await this.server.listResources();
        this.metrics.recordResourceListRequest(Date.now() - startTime);

        logger.debug(`📚 Запрошен список ресурсов (${resources.resources.length} resources)`);
        return resources;
      } catch (error) {
        this.errorHandler.handleError('list_resources', error);
        throw error;
      }
    });

    // Обработчик чтения ресурсов
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const startTime = Date.now();
      const { uri } = request.params;

      try {
        logger.info(`📖 Чтение ресурса: ${uri}`);

        const result = await this.server.readResource(request.params);

        this.metrics.recordResourceRead(uri, Date.now() - startTime, true);
        logger.debug(`✅ Ресурс ${uri} прочитан успешно`);

        return result;
      } catch (error) {
        this.metrics.recordResourceRead(uri, Date.now() - startTime, false);
        this.errorHandler.handleError(`resource_${uri}`, error);

        logger.error(`❌ Ошибка чтения ресурса ${uri}:`, error);
        throw error;
      }
    });

    // Обработчик ошибок соединения
    this.server.onerror = (error) => {
      logger.error('🔌 Ошибка соединения MCP сервера:', error);
      this.errorHandler.handleError('connection', error);
    };
  }

  /**
   * Запуск сервера
   */
  async start(): Promise<void> {
    try {
      await this.initialize();

      const transport = new StdioServerTransport();

      logger.info('🚀 Запуск MCP сервера...');
      logger.info(`📡 Конфигурация: ${config.server.host}:${config.server.port}`);
      logger.info(`🤖 AI Provider: DeepSeek R1 (${config.ai.deepseek.model})`);
      logger.info(`🗄️ Database: ${config.database.url.replace(/\/\/.*@/, '//***@')}`);

      await this.server.connect(transport);

      logger.info('✅ Estimate Service MCP Server запущен и готов к работе!');

      // Запуск метрик (если включены)
      if (config.development.enableMetrics) {
        this.startMetricsReporting();
      }

    } catch (error) {
      logger.error('💥 Критическая ошибка запуска MCP сервера:', error);
      process.exit(1);
    }
  }

  /**
   * Запуск отчетности метрик
   */
  private startMetricsReporting(): void {
    setInterval(() => {
      const metrics = this.metrics.getMetrics();
      logger.info('📊 Метрики MCP сервера:', metrics);
    }, 60000); // Каждую минуту
  }

  /**
   * Корректное завершение работы
   */
  async shutdown(): Promise<void> {
    logger.info('🛑 Завершение работы MCP сервера...');

    try {
      // Сохранить метрики
      await this.metrics.flush();

      // Закрыть соединения
      await this.server.close();

      logger.info('✅ MCP сервер корректно завершил работу');
    } catch (error) {
      logger.error('❌ Ошибка при завершении работы:', error);
    }
  }
}

// Обработка сигналов завершения
const server = new EstimateServiceMCPServer();

process.on('SIGINT', async () => {
  logger.info('📡 Получен сигнал SIGINT, завершение работы...');
  await server.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('📡 Получен сигнал SIGTERM, завершение работы...');
  await server.shutdown();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('💥 Необработанная ошибка:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Необработанное отклонение промиса:', reason, promise);
  process.exit(1);
});

// Запуск сервера
if (import.meta.url === `file://${process.argv[1]}`) {
  server.start().catch((error) => {
    logger.error('💥 Не удалось запустить MCP сервер:', error);
    process.exit(1);
  });
}

export { EstimateServiceMCPServer };
