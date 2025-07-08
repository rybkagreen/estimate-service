import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import circuitBreakerConfig from '../../config/circuit-breaker.config';
import { CircuitBreakerService } from './circuit-breaker.service';

/**
 * Глобальный модуль Circuit Breaker для защиты от сбоев внешних API
 *
 * Предоставляет:
 * - Создание и управление Circuit Breaker'ами
 * - Мониторинг состояния внешних сервисов
 * - Автоматическое восстановление после сбоев
 * - Статистику и метрики
 *
 * @example
 * ```typescript
 * // В сервисе
 * constructor(private circuitBreakerService: CircuitBreakerService) {}
 *
 * async callExternalAPI() {
 *   const breaker = this.circuitBreakerService.create({
 *     name: 'external-api',
 *     failureThreshold: 5,
 *     timeout: 60000
 *   });
 *
 *   return breaker.execute(() => this.httpService.get('/api/data'));
 * }
 * ```
 */
@Global()
@Module({
  imports: [ConfigModule.forFeature(circuitBreakerConfig)],
  providers: [CircuitBreakerService],
  exports: [CircuitBreakerService],
})
export class CircuitBreakerModule {}
