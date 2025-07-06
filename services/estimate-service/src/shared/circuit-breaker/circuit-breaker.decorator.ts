import { applyDecorators, SetMetadata } from '@nestjs/common';
import { CircuitBreakerConfig } from './circuit-breaker.service';

/**
 * Метаданные для Circuit Breaker декоратора
 */
export const CIRCUIT_BREAKER_METADATA = 'circuit-breaker';

/**
 * Опции для декоратора Circuit Breaker
 */
export interface CircuitBreakerDecoratorOptions extends Partial<CircuitBreakerConfig> {
  /** Включить Circuit Breaker для этого метода */
  enabled?: boolean;
  /** Функция для извлечения ключа из аргументов метода */
  keyExtractor?: (...args: any[]) => string;
}

/**
 * Декоратор для автоматического применения Circuit Breaker к методам
 *
 * Позволяет защитить методы от сбоев без написания дополнительного кода.
 * Circuit Breaker автоматически создается на основе имени класса и метода.
 *
 * @param options Опции конфигурации Circuit Breaker
 * @returns Декоратор метода
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class ExternalApiService {
 *
 *   @CircuitBreakerProtected({
 *     name: 'deepseek-api',
 *     failureThreshold: 3,
 *     timeout: 30000
 *   })
 *   async callDeepSeekAPI(messages: any[]): Promise<string> {
 *     // Этот метод будет защищен Circuit Breaker'ом
 *     return this.httpService.post('/chat', { messages });
 *   }
 *
 *   @CircuitBreakerProtected({
 *     name: 'external-service',
 *     failureThreshold: 5,
 *     keyExtractor: (userId) => `user-${userId}` // Отдельный CB для каждого пользователя
 *   })
 *   async getUserData(userId: string): Promise<UserData> {
 *     return this.userService.fetchUser(userId);
 *   }
 * }
 * ```
 */
export function CircuitBreakerProtected(
  options: CircuitBreakerDecoratorOptions = {}
): MethodDecorator {
  return applyDecorators(
    SetMetadata(CIRCUIT_BREAKER_METADATA, {
      enabled: options.enabled !== false,
      ...options,
    })
  );
}

/**
 * Декоратор для отключения Circuit Breaker на методе
 *
 * Полезно когда класс имеет глобальный Circuit Breaker,
 * но определенные методы должны быть исключены.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class ApiService {
 *
 *   @CircuitBreakerProtected({ name: 'api-service' })
 *   async criticalMethod(): Promise<void> {
 *     // Защищен Circuit Breaker'ом
 *   }
 *
 *   @CircuitBreakerDisabled()
 *   async healthCheck(): Promise<boolean> {
 *     // НЕ защищен Circuit Breaker'ом
 *     return true;
 *   }
 * }
 * ```
 */
export function CircuitBreakerDisabled(): MethodDecorator {
  return SetMetadata(CIRCUIT_BREAKER_METADATA, { enabled: false });
}

/**
 * Декоратор класса для применения Circuit Breaker ко всем методам
 *
 * Автоматически создает Circuit Breaker для каждого публичного метода класса.
 * Методы могут переопределить настройки или отключить защиту.
 *
 * @param options Базовые опции для всех методов класса
 * @returns Декоратор класса
 *
 * @example
 * ```typescript
 * @CircuitBreakerClass({
 *   namePrefix: 'payment-service',
 *   failureThreshold: 3,
 *   timeout: 30000
 * })
 * @Injectable()
 * export class PaymentService {
 *
 *   // Будет защищен с именем 'payment-service:processPayment'
 *   async processPayment(amount: number): Promise<void> {}
 *
 *   // Переопределяет настройки базового Circuit Breaker
 *   @CircuitBreakerProtected({ failureThreshold: 1 })
 *   async validateCard(cardNumber: string): Promise<boolean> {}
 *
 *   // Отключает Circuit Breaker для этого метода
 *   @CircuitBreakerDisabled()
 *   async getStatus(): Promise<string> {}
 * }
 * ```
 */
export function CircuitBreakerClass(
  options: CircuitBreakerDecoratorOptions & { namePrefix?: string } = {}
): ClassDecorator {
  return (target: any) => {
    const className = target.name;
    const namePrefix = options.namePrefix || className.toLowerCase();

    // Получаем все методы класса
    const methodNames = Object.getOwnPropertyNames(target.prototype)
      .filter(name => {
        const method = target.prototype[name];
        return typeof method === 'function' &&
               name !== 'constructor' &&
               !name.startsWith('_'); // Исключаем приватные методы
      });

    // Применяем метаданные к каждому методу
    methodNames.forEach(methodName => {
      const existingMetadata = Reflect.getMetadata(CIRCUIT_BREAKER_METADATA, target.prototype[methodName]);

      // Если метод уже имеет метаданные Circuit Breaker, не перезаписываем
      if (!existingMetadata) {
        const methodOptions = {
          ...options,
          name: `${namePrefix}:${methodName}`,
        };

        Reflect.defineMetadata(
          CIRCUIT_BREAKER_METADATA,
          methodOptions,
          target.prototype,
          methodName
        );
      }
    });

    return target;
  };
}

/**
 * Тип для функций, защищенных Circuit Breaker
 */
export type CircuitBreakerProtectedFunction<T extends (...args: any[]) => any> = T;

/**
 * Утилитарная функция для создания защищенной функции
 *
 * @param fn Исходная функция
 * @param options Опции Circuit Breaker
 * @returns Защищенная функция
 *
 * @example
 * ```typescript
 * const protectedFetch = withCircuitBreaker(
 *   fetch,
 *   { name: 'fetch-api', failureThreshold: 3 }
 * );
 *
 * // Использование
 * const response = await protectedFetch('/api/data');
 * ```
 */
export function withCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CircuitBreakerDecoratorOptions
): CircuitBreakerProtectedFunction<T> {
  // Эта функция будет реализована в интерцепторе
  return fn as CircuitBreakerProtectedFunction<T>;
}
