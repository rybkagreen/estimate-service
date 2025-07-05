/**
 * Сборщик метрик для MCP сервера
 */

import { logger } from './logger.js';

export interface ToolMetrics {
  name: string;
  callCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastCall: Date;
}

export interface ResourceMetrics {
  uri: string;
  readCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastRead: Date;
}

export interface ServerMetrics {
  startTime: Date;
  uptime: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
}

export class MetricsCollector {
  private toolMetrics: Map<string, ToolMetrics> = new Map();
  private resourceMetrics: Map<string, ResourceMetrics> = new Map();
  private serverStartTime: Date = new Date();
  private requestCounts = {
    total: 0,
    successful: 0,
    failed: 0,
  };
  private responseTimes: number[] = [];

  /**
   * Записать вызов инструмента
   */
  recordToolCall(toolName: string, responseTime: number, success: boolean): void {
    let metrics = this.toolMetrics.get(toolName);

    if (!metrics) {
      metrics = {
        name: toolName,
        callCount: 0,
        successCount: 0,
        errorCount: 0,
        averageResponseTime: 0,
        lastCall: new Date(),
      };
      this.toolMetrics.set(toolName, metrics);
    }

    // Обновляем метрики
    metrics.callCount++;
    metrics.lastCall = new Date();

    if (success) {
      metrics.successCount++;
    } else {
      metrics.errorCount++;
    }

    // Обновляем среднее время ответа
    metrics.averageResponseTime = this.updateAverageResponseTime(
      metrics.averageResponseTime,
      responseTime,
      metrics.callCount
    );

    this.recordRequest(responseTime, success);
  }

  /**
   * Записать чтение ресурса
   */
  recordResourceRead(uri: string, responseTime: number, success: boolean): void {
    let metrics = this.resourceMetrics.get(uri);

    if (!metrics) {
      metrics = {
        uri,
        readCount: 0,
        successCount: 0,
        errorCount: 0,
        averageResponseTime: 0,
        lastRead: new Date(),
      };
      this.resourceMetrics.set(uri, metrics);
    }

    // Обновляем метрики
    metrics.readCount++;
    metrics.lastRead = new Date();

    if (success) {
      metrics.successCount++;
    } else {
      metrics.errorCount++;
    }

    // Обновляем среднее время ответа
    metrics.averageResponseTime = this.updateAverageResponseTime(
      metrics.averageResponseTime,
      responseTime,
      metrics.readCount
    );

    this.recordRequest(responseTime, success);
  }

  /**
   * Записать запрос списка инструментов
   */
  recordToolListRequest(responseTime: number): void {
    this.recordRequest(responseTime, true);
  }

  /**
   * Записать запрос списка ресурсов
   */
  recordResourceListRequest(responseTime: number): void {
    this.recordRequest(responseTime, true);
  }

  /**
   * Записать общий запрос
   */
  private recordRequest(responseTime: number, success: boolean): void {
    this.requestCounts.total++;

    if (success) {
      this.requestCounts.successful++;
    } else {
      this.requestCounts.failed++;
    }

    // Сохраняем время ответа (максимум 1000 последних)
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }
  }

  /**
   * Обновить среднее время ответа
   */
  private updateAverageResponseTime(
    currentAverage: number,
    newResponseTime: number,
    totalCount: number
  ): number {
    return ((currentAverage * (totalCount - 1)) + newResponseTime) / totalCount;
  }

  /**
   * Получить метрики инструментов
   */
  getToolMetrics(): ToolMetrics[] {
    return Array.from(this.toolMetrics.values());
  }

  /**
   * Получить метрики ресурсов
   */
  getResourceMetrics(): ResourceMetrics[] {
    return Array.from(this.resourceMetrics.values());
  }

  /**
   * Получить метрики сервера
   */
  getServerMetrics(): ServerMetrics {
    const now = new Date();
    const uptime = now.getTime() - this.serverStartTime.getTime();

    const averageResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
      : 0;

    return {
      startTime: this.serverStartTime,
      uptime,
      totalRequests: this.requestCounts.total,
      successfulRequests: this.requestCounts.successful,
      failedRequests: this.requestCounts.failed,
      averageResponseTime,
    };
  }

  /**
   * Получить все метрики
   */
  getMetrics(): {
    server: ServerMetrics;
    tools: ToolMetrics[];
    resources: ResourceMetrics[];
    summary: {
      mostUsedTool: string | null;
      mostAccessedResource: string | null;
      successRate: number;
      totalOperations: number;
    };
  } {
    const serverMetrics = this.getServerMetrics();
    const toolMetrics = this.getToolMetrics();
    const resourceMetrics = this.getResourceMetrics();

    // Находим самый используемый инструмент
    const mostUsedTool = toolMetrics.reduce((prev, current) =>
      (current.callCount > (prev?.callCount || 0)) ? current : prev,
      toolMetrics[0] || null
    );

    // Находим самый доступный ресурс
    const mostAccessedResource = resourceMetrics.reduce((prev, current) =>
      (current.readCount > (prev?.readCount || 0)) ? current : prev,
      resourceMetrics[0] || null
    );

    // Вычисляем общий уровень успеха
    const successRate = serverMetrics.totalRequests > 0
      ? (serverMetrics.successfulRequests / serverMetrics.totalRequests) * 100
      : 100;

    const totalOperations = toolMetrics.reduce((sum, tool) => sum + tool.callCount, 0) +
                           resourceMetrics.reduce((sum, resource) => sum + resource.readCount, 0);

    return {
      server: serverMetrics,
      tools: toolMetrics,
      resources: resourceMetrics,
      summary: {
        mostUsedTool: mostUsedTool?.name || null,
        mostAccessedResource: mostAccessedResource?.uri || null,
        successRate,
        totalOperations,
      },
    };
  }

  /**
   * Сбросить метрики
   */
  reset(): void {
    this.toolMetrics.clear();
    this.resourceMetrics.clear();
    this.serverStartTime = new Date();
    this.requestCounts = {
      total: 0,
      successful: 0,
      failed: 0,
    };
    this.responseTimes = [];

    logger.info('📊 Метрики сброшены');
  }

  /**
   * Экспорт метрик в JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.getMetrics(), null, 2);
  }

  /**
   * Сохранение метрик (flush)
   */
  async flush(): Promise<void> {
    try {
      const metrics = this.getMetrics();
      logger.info('💾 Сохранение финальных метрик:', metrics);
      // Здесь можно добавить сохранение в файл или базу данных
    } catch (error) {
      logger.error('❌ Ошибка сохранения метрик:', error);
    }
  }

  /**
   * Получить статистику производительности
   */
  getPerformanceStats(): {
    requestsPerMinute: number;
    averageResponseTime: number;
    successRate: number;
    uptime: string;
  } {
    const serverMetrics = this.getServerMetrics();
    const uptimeMinutes = serverMetrics.uptime / (1000 * 60);

    return {
      requestsPerMinute: uptimeMinutes > 0 ? serverMetrics.totalRequests / uptimeMinutes : 0,
      averageResponseTime: serverMetrics.averageResponseTime,
      successRate: serverMetrics.totalRequests > 0
        ? (serverMetrics.successfulRequests / serverMetrics.totalRequests) * 100
        : 100,
      uptime: this.formatUptime(serverMetrics.uptime),
    };
  }

  /**
   * Форматирование времени работы
   */
  private formatUptime(uptime: number): string {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
