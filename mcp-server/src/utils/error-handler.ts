/**
 * Обработчик ошибок для MCP сервера
 */

import { logger } from './logger.js';

export interface ErrorStats {
  count: number;
  lastError: Date;
  lastMessage: string;
}

export class ErrorHandler {
  private errorStats: Map<string, ErrorStats> = new Map();

  /**
   * Обработка ошибки
   */
  handleError(context: string, error: unknown): void {
    const errorMessage = this.extractErrorMessage(error);

    // Обновляем статистику
    const stats = this.errorStats.get(context) || {
      count: 0,
      lastError: new Date(),
      lastMessage: '',
    };

    stats.count++;
    stats.lastError = new Date();
    stats.lastMessage = errorMessage;

    this.errorStats.set(context, stats);

    // Логируем ошибку
    logger.error(`[${context}] Ошибка:`, {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      errorCount: stats.count,
    });

    // Критические ошибки требуют немедленного внимания
    if (this.isCriticalError(error)) {
      logger.error('🚨 КРИТИЧЕСКАЯ ОШИБКА:', {
        context,
        message: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Извлечение сообщения об ошибке
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error';
    }
  }

  /**
   * Проверка критичности ошибки
   */
  private isCriticalError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    const criticalPatterns = [
      /database.*connection/i,
      /out of memory/i,
      /enotfound/i,
      /econnrefused/i,
      /timeout/i,
      /unauthorized/i,
      /access.*denied/i,
    ];

    return criticalPatterns.some(pattern =>
      pattern.test(error.message) || pattern.test(error.name)
    );
  }

  /**
   * Получение статистики ошибок
   */
  getErrorStats(): Record<string, ErrorStats> {
    const stats: Record<string, ErrorStats> = {};

    this.errorStats.forEach((value, key) => {
      stats[key] = { ...value };
    });

    return stats;
  }

  /**
   * Очистка старой статистики
   */
  cleanupOldStats(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = new Date();

    this.errorStats.forEach((stats, context) => {
      if (now.getTime() - stats.lastError.getTime() > maxAge) {
        this.errorStats.delete(context);
      }
    });
  }

  /**
   * Получение общего количества ошибок
   */
  getTotalErrorCount(): number {
    let total = 0;
    this.errorStats.forEach(stats => {
      total += stats.count;
    });
    return total;
  }

  /**
   * Проверка здоровья системы
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    totalErrors: number;
    recentErrors: number;
    contexts: string[];
  } {
    const totalErrors = this.getTotalErrorCount();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    let recentErrors = 0;
    const contextsWithErrors: string[] = [];

    this.errorStats.forEach((stats, context) => {
      if (stats.lastError > oneHourAgo) {
        recentErrors += stats.count;
        contextsWithErrors.push(context);
      }
    });

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (recentErrors > 10) {
      status = 'critical';
    } else if (recentErrors > 3) {
      status = 'warning';
    }

    return {
      status,
      totalErrors,
      recentErrors,
      contexts: contextsWithErrors,
    };
  }
}
