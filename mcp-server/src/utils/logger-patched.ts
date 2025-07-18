import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// Определяем путь для логов
const LOG_PATH = process.env.LOG_PATH || path.join(process.cwd(), 'mcp-server', 'logs');

// Создаем директорию для логов, если она не существует
try {
  if (!fs.existsSync(LOG_PATH)) {
    fs.mkdirSync(LOG_PATH, { recursive: true });
  }
} catch (error) {
  console.warn('Warning: Could not create logs directory:', error);
}

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'estimate-service-mcp' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Добавляем файловые транспорты только если директория доступна
try {
  if (fs.existsSync(LOG_PATH)) {
    logger.add(new winston.transports.File({
      filename: path.join(LOG_PATH, 'error.log'),
      level: 'error'
    }));
    logger.add(new winston.transports.File({
      filename: path.join(LOG_PATH, 'combined.log')
    }));
  }
} catch (error) {
  console.warn('Warning: Could not add file transports:', error);
}

// If we're not in production, ensure console logging
if (process.env.NODE_ENV !== 'production') {
  logger.info('MCP Server running in development mode');
}
