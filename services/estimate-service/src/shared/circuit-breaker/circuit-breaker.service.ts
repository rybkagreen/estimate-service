import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Состояния Circuit Breaker
 */
export enum CircuitBreakerState {
  /** Закрыт - нормальная работа */
  CLOSED = 'CLOSED',
  /** Открыт - все запросы отклоняются */
  OPEN = 'OPEN',
  /** Полуоткрыт - пробные запросы разрешены */
  HALF_OPEN = 'HALF_OPEN'
}

/**
 * Конфигурация Circuit Breaker
 */
export interface CircuitBreakerConfig {
  /** Имя Circuit Breaker для идентификации */
  name: string;
  /** Порог ошибок для открытия (количество ошибок подряд) */
  failureThreshold: number;
  /** Порог успешных запросов для закрытия в полуоткрытом состоянии */
  successThreshold: number;
  /** Таймаут для перехода из открытого в полуоткрытое состояние (мс) */
  timeout: number;
  /** Размер окна для подсчета статистики */
  windowSize: number;
  /** Время жизни статистики (мс) */
  windowTime: number;
  /** Функция определения успешности ответа */
  isSuccess?: (response: any) => boolean;
  /** Функция определения критичности ошибки */
  isCriticalError?: (error: Error) => boolean;
}

/**
 * Статистика Circuit Breaker
 */
export interface CircuitBreakerStats {
  /** Текущее состояние */
  state: CircuitBreakerState;
  /** Общее количество запросов */
  totalRequests: number;
  /** Количество успешных запросов */
  successfulRequests: number;
  /** Количество неудачных запросов */
  failedRequests: number;
  /** Процент успешных запросов */
  successRate: number;
  /** Последняя ошибка */
  lastError?: Error;
  /** Время последнего изменения состояния */
  lastStateChange: Date;
  /** Время следующей попытки (для открытого состояния) */
  nextAttempt?: Date;
}

/**
 * Запись в окне статистики
 */
interface WindowEntry {
  timestamp: number;
  success: boolean;
  error?: Error;
}

/**
 * Реализация паттерна Circuit Breaker для защиты от сбоев внешних API
 *
 * Circuit Breaker отслеживает количество ошибок при вызове внешних сервисов
 * и временно блокирует запросы при превышении порога, предотвращая каскадные сбои.
 *
 * Состояния:
 * - CLOSED: Нормальная работа, все запросы проходят
 * - OPEN: Все запросы отклоняются, возвращается ошибка
 * - HALF_OPEN: Разрешены пробные запросы для проверки восстановления
 *
 * @example
 * ```typescript
 * // Создание Circuit Breaker
 * const breaker = this.circuitBreakerService.create({
 *   name: 'deepseek-api',
 *   failureThreshold: 5,
 *   successThreshold: 3,
 *   timeout: 60000,
 *   windowSize: 10,
 *   windowTime: 60000
 * });
 *
 * // Выполнение запроса через Circuit Breaker
 * const result = await breaker.execute(async () => {
 *   return this.deepSeekService.chat(messages);
 * });
 * ```
 */
export class CircuitBreaker {
  private readonly logger = new Logger(`CircuitBreaker:${this.config.name}`);

  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private lastStateChange = new Date();
  private window: WindowEntry[] = [];
  private lastError?: Error;

  constructor(
    private readonly config: CircuitBreakerConfig,
    private readonly configService: ConfigService
  ) {
    this.logger.log(`Circuit Breaker initialized: ${config.name}`);
  }

  /**
   * Выполнение операции через Circuit Breaker
   *
   * @param operation Асинхронная операция для выполнения
   * @returns Результат операции
   * @throws Error если Circuit Breaker открыт или операция завершилась ошибкой
   *
   * @example
   * ```typescript
   * const result = await circuitBreaker.execute(async () => {
   *   const response = await fetch('https://api.external.com/data');
   *   if (!response.ok) throw new Error('API Error');
   *   return response.json();
   * });
   * ```
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Проверяем можем ли выполнить запрос
    if (!this.canExecute()) {
      const error = new Error(`Circuit Breaker is OPEN for ${this.config.name}`);
      this.logger.warn(`Request blocked by Circuit Breaker: ${this.config.name}`);
      throw error;
    }

    const startTime = Date.now();

    try {
      this.logger.debug(`Executing operation through Circuit Breaker: ${this.config.name}`);

      const result = await operation();

      // Проверяем успешность ответа
      const isSuccess = this.config.isSuccess ?
        this.config.isSuccess(result) :
        true;

      if (isSuccess) {
        this.recordSuccess();
        this.logger.debug(`Operation succeeded: ${this.config.name}`);
      } else {
        const error = new Error('Operation returned unsuccessful result');
        this.recordFailure(error);
        throw error;
      }

      return result;
    } catch (error) {
      const execError = error instanceof Error ? error : new Error(String(error));
      this.recordFailure(execError);

      this.logger.error(`Operation failed: ${this.config.name}`, {
        error: execError.message,
        duration: Date.now() - startTime
      });

      throw execError;
    }
  }

  /**
   * Принудительное открытие Circuit Breaker
   *
   * @example
   * ```typescript
   * // При обнаружении критической ошибки
   * circuitBreaker.trip();
   * ```
   */
  trip(): void {
    this.setState(CircuitBreakerState.OPEN);
    this.lastFailureTime = Date.now();
    this.logger.warn(`Circuit Breaker manually tripped: ${this.config.name}`);
  }

  /**
   * Принудительное закрытие Circuit Breaker
   *
   * @example
   * ```typescript
   * // После устранения проблемы
   * circuitBreaker.reset();
   * ```
   */
  reset(): void {
    this.setState(CircuitBreakerState.CLOSED);
    this.failureCount = 0;
    this.successCount = 0;
    this.lastError = undefined;
    this.window = [];
    this.logger.log(`Circuit Breaker reset: ${this.config.name}`);
  }

  /**
   * Получение текущей статистики Circuit Breaker
   *
   * @returns Объект со статистикой
   *
   * @example
   * ```typescript
   * const stats = circuitBreaker.getStats();
   * console.log(`Success rate: ${stats.successRate}%`);
   * ```
   */
  getStats(): CircuitBreakerStats {
    this.cleanupWindow();

    const totalRequests = this.window.length;
    const successfulRequests = this.window.filter(entry => entry.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const successRate = totalRequests > 0 ?
      Math.round((successfulRequests / totalRequests) * 100) :
      100;

    return {
      state: this.state,
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate,
      lastError: this.lastError,
      lastStateChange: this.lastStateChange,
      nextAttempt: this.state === CircuitBreakerState.OPEN ?
        new Date(this.lastFailureTime + this.config.timeout) :
        undefined
    };
  }

  /**
   * Проверка возможности выполнения запроса
   *
   * @returns true если запрос может быть выполнен
   *
   * @private
   */
  private canExecute(): boolean {
    switch (this.state) {
      case CircuitBreakerState.CLOSED:
        return true;

      case CircuitBreakerState.OPEN:
        // Проверяем не пора ли перейти в полуоткрытое состояние
        if (Date.now() - this.lastFailureTime >= this.config.timeout) {
          this.setState(CircuitBreakerState.HALF_OPEN);
          this.successCount = 0;
          return true;
        }
        return false;

      case CircuitBreakerState.HALF_OPEN:
        return true;

      default:
        return false;
    }
  }

  /**
   * Запись успешного выполнения
   *
   * @private
   */
  private recordSuccess(): void {
    this.addToWindow(true);
    this.failureCount = 0;
    this.lastError = undefined;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        this.setState(CircuitBreakerState.CLOSED);
        this.logger.log(`Circuit Breaker closed after successful recovery: ${this.config.name}`);
      }
    }
  }

  /**
   * Запись неудачного выполнения
   *
   * @param error Ошибка
   *
   * @private
   */
  private recordFailure(error: Error): void {
    this.addToWindow(false, error);
    this.failureCount++;
    this.lastError = error;
    this.lastFailureTime = Date.now();

    // Проверяем критичность ошибки
    const isCritical = this.config.isCriticalError ?
      this.config.isCriticalError(error) :
      true;

    if (isCritical) {
      if (this.state === CircuitBreakerState.CLOSED &&
          this.failureCount >= this.config.failureThreshold) {
        this.setState(CircuitBreakerState.OPEN);
        this.logger.warn(
          `Circuit Breaker opened due to ${this.failureCount} failures: ${this.config.name}`
        );
      } else if (this.state === CircuitBreakerState.HALF_OPEN) {
        this.setState(CircuitBreakerState.OPEN);
        this.logger.warn(
          `Circuit Breaker reopened after failure in HALF_OPEN state: ${this.config.name}`
        );
      }
    }
  }

  /**
   * Добавление записи в окно статистики
   *
   * @param success Успешность операции
   * @param error Ошибка (если есть)
   *
   * @private
   */
  private addToWindow(success: boolean, error?: Error): void {
    this.window.push({
      timestamp: Date.now(),
      success,
      error
    });

    // Ограничиваем размер окна
    if (this.window.length > this.config.windowSize) {
      this.window = this.window.slice(-this.config.windowSize);
    }
  }

  /**
   * Очистка устаревших записей из окна
   *
   * @private
   */
  private cleanupWindow(): void {
    const cutoff = Date.now() - this.config.windowTime;
    this.window = this.window.filter(entry => entry.timestamp > cutoff);
  }

  /**
   * Изменение состояния Circuit Breaker
   *
   * @param newState Новое состояние
   *
   * @private
   */
  private setState(newState: CircuitBreakerState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.lastStateChange = new Date();

      this.logger.log(
        `Circuit Breaker state changed: ${oldState} -> ${newState} (${this.config.name})`
      );
    }
  }
}

/**
 * Сервис для управления Circuit Breaker'ами
 */
@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly breakers = new Map<string, CircuitBreaker>();

  constructor(private readonly configService: ConfigService) {}

  /**
   * Создание или получение существующего Circuit Breaker
   *
   * @param config Конфигурация Circuit Breaker
   * @returns Экземпляр Circuit Breaker
   *
   * @example
   * ```typescript
   * const breaker = this.circuitBreakerService.create({
   *   name: 'external-api',
   *   failureThreshold: 5,
   *   successThreshold: 3,
   *   timeout: 60000,
   *   windowSize: 20,
   *   windowTime: 120000
   * });
   * ```
   */
  create(config: CircuitBreakerConfig): CircuitBreaker {
    if (this.breakers.has(config.name)) {
      return this.breakers.get(config.name)!;
    }

    // Применяем значения по умолчанию из конфигурации
    const defaultConfig = {
      failureThreshold: this.configService.get('circuitBreaker.failureThreshold', 5),
      successThreshold: this.configService.get('circuitBreaker.successThreshold', 3),
      timeout: this.configService.get('circuitBreaker.timeout', 60000),
      windowSize: this.configService.get('circuitBreaker.windowSize', 10),
      windowTime: this.configService.get('circuitBreaker.windowTime', 60000),
    };

    const fullConfig: CircuitBreakerConfig = {
      ...defaultConfig,
      ...config
    };

    const breaker = new CircuitBreaker(fullConfig, this.configService);
    this.breakers.set(config.name, breaker);

    this.logger.log(`Created Circuit Breaker: ${config.name}`);

    return breaker;
  }

  /**
   * Получение Circuit Breaker по имени
   *
   * @param name Имя Circuit Breaker
   * @returns Circuit Breaker или undefined
   *
   * @example
   * ```typescript
   * const breaker = this.circuitBreakerService.get('external-api');
   * if (breaker) {
   *   const stats = breaker.getStats();
   * }
   * ```
   */
  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  /**
   * Получение статистики всех Circuit Breaker'ов
   *
   * @returns Массив объектов со статистикой
   *
   * @example
   * ```typescript
   * const allStats = this.circuitBreakerService.getAllStats();
   * allStats.forEach(stat => {
   *   console.log(`${stat.name}: ${stat.stats.successRate}%`);
   * });
   * ```
   */
  getAllStats(): Array<{ name: string; stats: CircuitBreakerStats }> {
    return Array.from(this.breakers.entries()).map(([name, breaker]) => ({
      name,
      stats: breaker.getStats()
    }));
  }

  /**
   * Сброс всех Circuit Breaker'ов
   *
   * @example
   * ```typescript
   * // После устранения проблем с инфраструктурой
   * this.circuitBreakerService.resetAll();
   * ```
   */
  resetAll(): void {
    this.breakers.forEach((breaker, name) => {
      breaker.reset();
      this.logger.log(`Reset Circuit Breaker: ${name}`);
    });
  }

  /**
   * Удаление Circuit Breaker
   *
   * @param name Имя Circuit Breaker для удаления
   *
   * @example
   * ```typescript
   * this.circuitBreakerService.remove('temporary-api');
   * ```
   */
  remove(name: string): boolean {
    const result = this.breakers.delete(name);
    if (result) {
      this.logger.log(`Removed Circuit Breaker: ${name}`);
    }
    return result;
  }

  /**
   * Проверка здоровья всех Circuit Breaker'ов
   *
   * @returns Сводная информация о состоянии
   *
   * @example
   * ```typescript
   * const health = this.circuitBreakerService.getHealthStatus();
   * if (health.hasOpenBreakers) {
   *   console.warn('Some external services are unavailable');
   * }
   * ```
   */
  getHealthStatus(): {
    totalBreakers: number;
    openBreakers: number;
    halfOpenBreakers: number;
    hasOpenBreakers: boolean;
    overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  } {
    const stats = this.getAllStats();
    const openBreakers = stats.filter(s => s.stats.state === CircuitBreakerState.OPEN).length;
    const halfOpenBreakers = stats.filter(s => s.stats.state === CircuitBreakerState.HALF_OPEN).length;

    let overallHealth: 'healthy' | 'degraded' | 'unhealthy';
    if (openBreakers === 0) {
      overallHealth = halfOpenBreakers > 0 ? 'degraded' : 'healthy';
    } else if (openBreakers < stats.length) {
      overallHealth = 'degraded';
    } else {
      overallHealth = 'unhealthy';
    }

    return {
      totalBreakers: stats.length,
      openBreakers,
      halfOpenBreakers,
      hasOpenBreakers: openBreakers > 0,
      overallHealth
    };
  }
}
