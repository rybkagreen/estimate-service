import { Injectable, Inject, LoggerService as NestLoggerService, LogLevel } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { MonitoringConfig } from '../config/monitoring.config';
import * as Sentry from '@sentry/node';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(
    @Inject('MONITORING_CONFIG') private config: MonitoringConfig,
  ) {
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const { logging } = this.config;
    const transports: winston.transport[] = [];

    // Console transport
    if (logging.transports.console.enabled) {
      transports.push(
        new winston.transports.Console({
          level: logging.transports.console.level,
          format: winston.format.combine(
            logging.colorize ? winston.format.colorize() : winston.format.uncolorize(),
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            logging.format === 'json' 
              ? winston.format.json()
              : winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                  const ctx = context || this.context || 'Application';
                  return `${timestamp} [${ctx}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
                })
          ),
        })
      );
    }

    // File transport with rotation
    if (logging.transports.file.enabled) {
      const fileTransport = new DailyRotateFile({
        filename: logging.transports.file.filename,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: logging.transports.file.compress,
        maxSize: logging.transports.file.maxSize,
        maxFiles: logging.transports.file.maxFiles,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        ),
      });

      transports.push(fileTransport);
    }

    // Elasticsearch transport
    if (logging.transports.elasticsearch.enabled) {
      const esTransport = new ElasticsearchTransport({
        level: logging.level,
        clientOpts: {
          node: logging.transports.elasticsearch.node,
        },
        index: logging.transports.elasticsearch.index,
        dataStream: true,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.metadata()
        ),
      });

      transports.push(esTransport);
    }

    return winston.createLogger({
      level: logging.level,
      defaultMeta: logging.metadata,
      transports,
      exitOnError: false,
    });
  }

  // NestJS LoggerService implementation
  log(message: any, context?: string): void {
    this.logger.info(message, { context: context || this.context });
    this.addBreadcrumb('info', message, context);
  }

  error(message: any, trace?: string, context?: string): void {
    const errorObj = message instanceof Error ? message : new Error(message);
    this.logger.error(message, { 
      context: context || this.context, 
      trace,
      stack: errorObj.stack 
    });
    
    // Send to Sentry
    if (this.config.sentry.enabled) {
      Sentry.captureException(errorObj, {
        tags: { context: context || this.context },
        extra: { trace },
      });
    }
  }

  warn(message: any, context?: string): void {
    this.logger.warn(message, { context: context || this.context });
    this.addBreadcrumb('warning', message, context);
  }

  debug(message: any, context?: string): void {
    this.logger.debug(message, { context: context || this.context });
    this.addBreadcrumb('debug', message, context);
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose(message, { context: context || this.context });
  }

  // Extended logging methods
  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, { ...meta, context: this.context });
    this.addBreadcrumb('info', message, this.context, meta);
  }

  http(req: any, res: any, responseTime: number): void {
    if (!this.config.logging.modules.http.enabled) return;
    
    const shouldLog = !this.config.logging.modules.http.excludePaths.some(
      path => req.url?.startsWith(path)
    );

    if (!shouldLog) return;

    const logData: any = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers?.['user-agent'],
    };

    if (this.config.logging.modules.http.logHeaders) {
      logData.headers = req.headers;
    }

    if (this.config.logging.modules.http.logBody && req.body) {
      logData.requestBody = this.sanitizeBody(req.body);
    }

    this.logger.http('HTTP Request', logData);
  }

  database(query: string, duration: number, params?: any[]): void {
    if (!this.config.logging.modules.database.enabled) return;

    const logData: any = {
      query,
      duration,
      slow: duration > this.config.logging.modules.database.slowQueryThreshold,
    };

    if (this.config.logging.modules.database.logQueries && params) {
      logData.params = params;
    }

    const level = logData.slow ? 'warn' : 'debug';
    this.logger[level]('Database Query', logData);
  }

  redis(command: string, duration: number, args?: any[]): void {
    if (!this.config.logging.modules.redis.enabled) return;

    const logData: any = {
      command,
      duration,
    };

    if (this.config.logging.modules.redis.logCommands && args) {
      logData.args = args;
    }

    this.logger.debug('Redis Command', logData);
  }

  // Utility methods
  setContext(context: string): void {
    this.context = context;
  }

  child(meta: Record<string, any>): LoggerService {
    const childLogger = Object.create(this);
    childLogger.logger = this.logger.child(meta);
    return childLogger;
  }

  private addBreadcrumb(
    level: Sentry.SeverityLevel, 
    message: string, 
    category?: string,
    data?: Record<string, any>
  ): void {
    if (this.config.sentry.enabled) {
      Sentry.addBreadcrumb({
        message,
        level,
        category: category || this.context || 'app',
        timestamp: Date.now() / 1000,
        data,
      });
    }
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sensitiveFields = this.config.sentry.beforeSend.scrubFields;
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  // Performance logging
  startTimer(label: string): () => void {
    const start = process.hrtime.bigint();
    
    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds
      
      this.logger.debug(`Timer ${label}`, {
        label,
        duration,
        unit: 'ms',
      });
      
      return duration;
    };
  }

  // Structured error logging
  logError(error: Error, context: Record<string, any> = {}): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context,
    };

    this.logger.error('Application Error', errorInfo);

    if (this.config.sentry.enabled) {
      Sentry.captureException(error, {
        tags: context,
        level: 'error',
      });
    }
  }

  // Audit logging
  audit(action: string, userId: string, details: Record<string, any>): void {
    this.logger.info('Audit Event', {
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  // Security event logging
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', details: Record<string, any>): void {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    
    this.logger[level]('Security Event', {
      event,
      severity,
      timestamp: new Date().toISOString(),
      ...details,
    });

    if (this.config.sentry.enabled && (severity === 'critical' || severity === 'high')) {
      Sentry.captureMessage(`Security Event: ${event}`, severity as Sentry.SeverityLevel);
    }
  }
}
