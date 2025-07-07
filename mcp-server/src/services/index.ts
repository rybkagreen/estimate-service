/**
 * Инициализация сервисов MCP сервера
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { logger } from '../utils/logger.js';
import { DatabaseService } from './database.js';
import { AIService } from './ai.js';
import { ExternalService } from './external.js';
import { ProjectService } from './project.js';
import { ModelManagerService, modelManager } from './model-manager.service.js';

export interface Services {
  database: DatabaseService;
  ai: AIService;
  external: ExternalService;
  project: ProjectService;
  modelManager: ModelManagerService;
}

let services: Services | null = null;

export async function setupServices(server: Server, config: any): Promise<Services> {
  logger.info('🔧 Инициализация сервисов MCP сервера...');

  try {
    // Инициализация сервиса базы данных
    const database = new DatabaseService(config.database);
    await database.initialize();
    logger.info('✅ Сервис базы данных инициализирован');

    // Инициализация AI сервиса
    const ai = new AIService(config.ai);
    await ai.initialize();
    logger.info('✅ AI сервис инициализирован');

    // Инициализация внешних сервисов
    const external = new ExternalService(config.external);
    await external.initialize();
    logger.info('✅ Внешние сервисы инициализированы');

    // Инициализация проектного сервиса
    const project = new ProjectService(config.project);
    await project.initialize();
    logger.info('✅ Проектный сервис инициализирован');

    // Инициализация Model Manager
    await modelManager.initializeClaude(config.ai?.claude?.apiKey);
    logger.info('✅ Model Manager инициализирован');

    services = {
      database,
      ai,
      external,
      project,
      modelManager,
    };

    logger.info('🎉 Все сервисы успешно инициализированы');
    return services;

  } catch (error) {
    logger.error('❌ Ошибка инициализации сервисов:', error);
    throw error;
  }
}

export function getServices(): Services {
  if (!services) {
    throw new Error('Сервисы не инициализированы. Вызовите setupServices() сначала.');
  }
  return services;
}

export async function shutdownServices(): Promise<void> {
  if (!services) {
    return;
  }

  logger.info('🛑 Завершение работы сервисов...');

  try {
    await services.database.shutdown();
    await services.ai.shutdown();
    await services.external.shutdown();
    await services.project.shutdown();

    services = null;
    logger.info('✅ Все сервисы завершили работу');
  } catch (error) {
    logger.error('❌ Ошибка завершения работы сервисов:', error);
    throw error;
  }
}
