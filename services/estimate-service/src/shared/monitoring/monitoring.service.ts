import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { v4 as uuidv4 } from 'uuid';

export interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

export interface LogContext {
  correlationId?: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  /**
   * Generate correlation ID for request tracking
   */
  generateCorrelationId(): string {
    return uuidv4();
  }

  /**
   * Log performance metrics
   */
  logMetric(metric: MetricData): void {
    this.logger.log(`Metric: ${metric.name} = ${metric.value}`, {
      metric: metric.name,
      value: metric.value,
      tags: metric.tags,
      timestamp: metric.timestamp || new Date(),
    });

    // Send to Sentry performance monitoring
    Sentry.addBreadcrumb({
      category: 'metric',
      message: `${metric.name}: ${metric.value}`,
      level: 'info',
      data: {
        value: metric.value,
        tags: metric.tags,
      },
    });
  }

  /**
   * Log business events with context
   */
  logEvent(event: string, context: LogContext = {}): void {
    const logData = {
      event,
      correlationId: context.correlationId,
      userId: context.userId,
      action: context.action,
      timestamp: new Date().toISOString(),
      ...context.metadata,
    };

    this.logger.log(`Event: ${event}`, logData);

    // Configure Sentry scope
    Sentry.withScope((scope) => {
      scope.setTag('event', event);
      scope.setTag('correlationId', context.correlationId);
      scope.setUser({ id: context.userId });
      scope.setContext('event_context', logData);

      Sentry.addBreadcrumb({
        category: 'business-event',
        message: event,
        level: 'info',
        data: logData,
      });
    });
  }

  /**
   * Log error with context
   */
  logError(error: Error, context: LogContext = {}): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      correlationId: context.correlationId,
      userId: context.userId,
      action: context.action,
      timestamp: new Date().toISOString(),
      ...context.metadata,
    };

    this.logger.error(`Error: ${error.message}`, errorData);

    // Send to Sentry with context
    Sentry.withScope((scope) => {
      scope.setTag('correlationId', context.correlationId);
      scope.setUser({ id: context.userId });
      scope.setContext('error_context', {
        action: context.action,
        metadata: context.metadata,
      });

      Sentry.captureException(error);
    });
  }

  /**
   * Start performance transaction
   */
  startTransaction(name: string, operation: string): void {
    // For now, just log the transaction start
    this.logEvent('transaction_start', {
      action: operation,
      metadata: { transactionName: name }
    });
  }

  /**
   * Log API request metrics
   */
  logApiRequest(data: {
    method: string;
    url: string;
    statusCode: number;
    responseTime: number;
    userAgent?: string;
    correlationId?: string;
    userId?: string;
  }): void {
    this.logMetric({
      name: 'api_request_duration',
      value: data.responseTime,
      tags: {
        method: data.method,
        url: data.url,
        status_code: data.statusCode.toString(),
        correlation_id: data.correlationId || 'unknown',
      },
    });

    this.logEvent('api_request', {
      correlationId: data.correlationId,
      userId: data.userId,
      action: `${data.method} ${data.url}`,
      metadata: {
        statusCode: data.statusCode,
        responseTime: data.responseTime,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * Log database query metrics
   */
  logDatabaseQuery(data: {
    query: string;
    duration: number;
    correlationId?: string;
    error?: Error;
  }): void {
    if (data.error) {
      this.logError(data.error, {
        correlationId: data.correlationId,
        action: 'database_query',
        metadata: {
          query: data.query,
          duration: data.duration,
        },
      });
    } else {
      this.logMetric({
        name: 'database_query_duration',
        value: data.duration,
        tags: {
          correlation_id: data.correlationId || 'unknown',
        },
      });
    }
  }
}
