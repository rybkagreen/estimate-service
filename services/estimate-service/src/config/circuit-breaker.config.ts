import { registerAs } from '@nestjs/config';

/**
 * Конфигурация Circuit Breaker для защиты от сбоев внешних API
 *
 * @example
 * ```typescript
 * // Получение конфигурации в сервисе
 * const config = this.configService.get('circuitBreaker');
 * ```
 */
export default registerAs('circuitBreaker', () => ({
  /**
   * Пороги ошибок по умолчанию
   */
  defaults: {
    /**
     * Количество последовательных ошибок для открытия Circuit Breaker
     * @default 5
     */
    failureThreshold: parseInt(process.env['CB_FAILURE_THRESHOLD'] || '5', 10),

    /**
     * Количество успешных запросов для закрытия Circuit Breaker в состоянии HALF_OPEN
     * @default 3
     */
    successThreshold: parseInt(process.env['CB_SUCCESS_THRESHOLD'] || '3', 10),

    /**
     * Время ожидания перед переходом из OPEN в HALF_OPEN (мс)
     * @default 60000 (1 минута)
     */
    timeout: parseInt(process.env['CB_TIMEOUT'] || '60000', 10),

    /**
     * Размер скользящего окна для статистики
     * @default 10
     */
    windowSize: parseInt(process.env['CB_WINDOW_SIZE'] || '10', 10),

    /**
     * Время жизни записей в окне статистики (мс)
     * @default 60000 (1 минута)
     */
    windowTime: parseInt(process.env['CB_WINDOW_TIME'] || '60000', 10),
  },

  /**
   * Конфигурации для конкретных сервисов
   */
  services: {
    /**
     * DeepSeek AI API
     */
    deepseek: {
      name: 'deepseek-api',
      failureThreshold: parseInt(process.env['CB_DEEPSEEK_FAILURE_THRESHOLD'] || '3', 10),
      successThreshold: parseInt(process.env['CB_DEEPSEEK_SUCCESS_THRESHOLD'] || '2', 10),
      timeout: parseInt(process.env['CB_DEEPSEEK_TIMEOUT'] || '30000', 10), // 30 секунд
      windowSize: parseInt(process.env['CB_DEEPSEEK_WINDOW_SIZE'] || '15', 10),
      windowTime: parseInt(process.env['CB_DEEPSEEK_WINDOW_TIME'] || '120000', 10), // 2 минуты
    },

    /**
     * HuggingFace API
     */
    huggingface: {
      name: 'huggingface-api',
      failureThreshold: parseInt(process.env['CB_HF_FAILURE_THRESHOLD'] || '5', 10),
      successThreshold: parseInt(process.env['CB_HF_SUCCESS_THRESHOLD'] || '3', 10),
      timeout: parseInt(process.env['CB_HF_TIMEOUT'] || '45000', 10), // 45 секунд
      windowSize: parseInt(process.env['CB_HF_WINDOW_SIZE'] || '20', 10),
      windowTime: parseInt(process.env['CB_HF_WINDOW_TIME'] || '180000', 10), // 3 минуты
    },

    /**
     * Гранд-Смета API
     */
    grandsmeta: {
      name: 'grandsmeta-api',
      failureThreshold: parseInt(process.env['CB_GS_FAILURE_THRESHOLD'] || '3', 10),
      successThreshold: parseInt(process.env['CB_GS_SUCCESS_THRESHOLD'] || '2', 10),
      timeout: parseInt(process.env['CB_GS_TIMEOUT'] || '60000', 10), // 1 минута
      windowSize: parseInt(process.env['CB_GS_WINDOW_SIZE'] || '10', 10),
      windowTime: parseInt(process.env['CB_GS_WINDOW_TIME'] || '300000', 10), // 5 минут
    },

    /**
     * Внешние API справочников
     */
    references: {
      name: 'references-api',
      failureThreshold: parseInt(process.env['CB_REF_FAILURE_THRESHOLD'] || '5', 10),
      successThreshold: parseInt(process.env['CB_REF_SUCCESS_THRESHOLD'] || '3', 10),
      timeout: parseInt(process.env['CB_REF_TIMEOUT'] || '120000', 10), // 2 минуты
      windowSize: parseInt(process.env['CB_REF_WINDOW_SIZE'] || '10', 10),
      windowTime: parseInt(process.env['CB_REF_WINDOW_TIME'] || '600000', 10), // 10 минут
    },
  },

  /**
   * Мониторинг и алерты
   */
  monitoring: {
    /**
     * Включить логирование изменений состояния
     * @default true
     */
    logStateChanges: process.env['CB_LOG_STATE_CHANGES'] !== 'false',

    /**
     * Включить метрики для Prometheus
     * @default true
     */
    enableMetrics: process.env['CB_ENABLE_METRICS'] !== 'false',

    /**
     * Интервал сбора статистики (мс)
     * @default 30000 (30 секунд)
     */
    statsInterval: parseInt(process.env['CB_STATS_INTERVAL'] || '30000', 10),

    /**
     * Пороги для алертов
     */
    alerts: {
      /**
       * Процент открытых Circuit Breaker'ов для критического алерта
       * @default 50
       */
      criticalThreshold: parseInt(process.env['CB_ALERT_CRITICAL'] || '50', 10),

      /**
       * Процент открытых Circuit Breaker'ов для предупреждения
       * @default 25
       */
      warningThreshold: parseInt(process.env['CB_ALERT_WARNING'] || '25', 10),
    },
  },

  /**
   * Экспериментальные функции
   */
  experimental: {
    /**
     * Использовать адаптивные пороги на основе исторических данных
     * @default false
     */
    adaptiveThresholds: process.env['CB_ADAPTIVE_THRESHOLDS'] === 'true',

    /**
     * Автоматический бэкофф при повторных сбоях
     * @default false
     */
    exponentialBackoff: process.env['CB_EXPONENTIAL_BACKOFF'] === 'true',

    /**
     * Множитель для экспоненциального бэкоффа
     * @default 2
     */
    backoffMultiplier: parseFloat(process.env['CB_BACKOFF_MULTIPLIER'] || '2'),

    /**
     * Максимальное время бэкоффа (мс)
     * @default 300000 (5 минут)
     */
    maxBackoffTime: parseInt(process.env['CB_MAX_BACKOFF'] || '300000', 10),
  },
}));
