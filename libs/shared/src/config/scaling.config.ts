import { registerAs } from '@nestjs/config';

/**
 * Конфигурация горизонтального масштабирования
 * Поддерживает Kubernetes, Docker Swarm и PM2
 *
 * @example
 * ```typescript
 * const scalingConfig = this.configService.get('scaling');
 * ```
 */
export default registerAs('scaling', () => ({
  /**
   * Режим масштабирования
   * @values 'kubernetes' | 'swarm' | 'pm2' | 'manual'
   * @default 'pm2'
   */
  mode: process.env['SCALING_MODE'] || 'pm2',

  /**
   * Общие настройки масштабирования
   */
  general: {
    /**
     * Минимальное количество инстансов
     * @default 1
     */
    minInstances: parseInt(process.env['MIN_INSTANCES'] || '1', 10),

    /**
     * Максимальное количество инстансов
     * @default 10
     */
    maxInstances: parseInt(process.env['MAX_INSTANCES'] || '10', 10),

    /**
     * Желаемое количество инстансов при старте
     * @default 2
     */
    desiredInstances: parseInt(process.env['DESIRED_INSTANCES'] || '2', 10),

    /**
     * Включить автомасштабирование
     * @default true
     */
    autoScale: process.env['AUTO_SCALE'] !== 'false',

    /**
     * Интервал проверки метрик (мс)
     * @default 30000 (30 секунд)
     */
    metricsInterval: parseInt(process.env['METRICS_INTERVAL'] || '30000', 10),

    /**
     * Задержка перед масштабированием (мс)
     * @default 60000 (1 минута)
     */
    scaleDelay: parseInt(process.env['SCALE_DELAY'] || '60000', 10),

    /**
     * Период стабилизации после масштабирования (мс)
     * @default 300000 (5 минут)
     */
    stabilizationPeriod: parseInt(process.env['STABILIZATION_PERIOD'] || '300000', 10),
  },

  /**
   * Метрики для автомасштабирования
   */
  metrics: {
    /**
     * CPU метрики
     */
    cpu: {
      /**
       * Включить масштабирование по CPU
       * @default true
       */
      enabled: process.env['CPU_SCALING_ENABLED'] !== 'false',

      /**
       * Порог для увеличения инстансов (%)
       * @default 70
       */
      scaleUpThreshold: parseInt(process.env['CPU_SCALE_UP'] || '70', 10),

      /**
       * Порог для уменьшения инстансов (%)
       * @default 20
       */
      scaleDownThreshold: parseInt(process.env['CPU_SCALE_DOWN'] || '20', 10),

      /**
       * Период усреднения (мс)
       * @default 300000 (5 минут)
       */
      averagePeriod: parseInt(process.env['CPU_AVERAGE_PERIOD'] || '300000', 10),
    },

    /**
     * Метрики памяти
     */
    memory: {
      /**
       * Включить масштабирование по памяти
       * @default true
       */
      enabled: process.env['MEMORY_SCALING_ENABLED'] !== 'false',

      /**
       * Порог для увеличения инстансов (%)
       * @default 80
       */
      scaleUpThreshold: parseInt(process.env['MEMORY_SCALE_UP'] || '80', 10),

      /**
       * Порог для уменьшения инстансов (%)
       * @default 30
       */
      scaleDownThreshold: parseInt(process.env['MEMORY_SCALE_DOWN'] || '30', 10),

      /**
       * Период усреднения (мс)
       * @default 300000 (5 минут)
       */
      averagePeriod: parseInt(process.env['MEMORY_AVERAGE_PERIOD'] || '300000', 10),
    },

    /**
     * Метрики запросов
     */
    requests: {
      /**
       * Включить масштабирование по количеству запросов
       * @default true
       */
      enabled: process.env['REQUEST_SCALING_ENABLED'] !== 'false',

      /**
       * Порог RPS для увеличения инстансов
       * @default 1000
       */
      scaleUpThreshold: parseInt(process.env['REQUEST_SCALE_UP'] || '1000', 10),

      /**
       * Порог RPS для уменьшения инстансов
       * @default 100
       */
      scaleDownThreshold: parseInt(process.env['REQUEST_SCALE_DOWN'] || '100', 10),

      /**
       * Период усреднения (мс)
       * @default 60000 (1 минута)
       */
      averagePeriod: parseInt(process.env['REQUEST_AVERAGE_PERIOD'] || '60000', 10),
    },

    /**
     * Метрики очередей
     */
    queue: {
      /**
       * Включить масштабирование по размеру очереди
       * @default true
       */
      enabled: process.env['QUEUE_SCALING_ENABLED'] !== 'false',

      /**
       * Порог размера очереди для увеличения инстансов
       * @default 100
       */
      scaleUpThreshold: parseInt(process.env['QUEUE_SCALE_UP'] || '100', 10),

      /**
       * Порог размера очереди для уменьшения инстансов
       * @default 10
       */
      scaleDownThreshold: parseInt(process.env['QUEUE_SCALE_DOWN'] || '10', 10),

      /**
       * Период проверки (мс)
       * @default 30000 (30 секунд)
       */
      checkPeriod: parseInt(process.env['QUEUE_CHECK_PERIOD'] || '30000', 10),
    },

    /**
     * Кастомные метрики
     */
    custom: {
      /**
       * Включить кастомные метрики
       * @default false
       */
      enabled: process.env['CUSTOM_METRICS_ENABLED'] === 'true',

      /**
       * Имя кастомной метрики
       */
      metricName: process.env['CUSTOM_METRIC_NAME'] || 'custom_metric',

      /**
       * Порог для увеличения инстансов
       * @default 100
       */
      scaleUpThreshold: parseInt(process.env['CUSTOM_SCALE_UP'] || '100', 10),

      /**
       * Порог для уменьшения инстансов
       * @default 10
       */
      scaleDownThreshold: parseInt(process.env['CUSTOM_SCALE_DOWN'] || '10', 10),
    },
  },

  /**
   * Настройки для Kubernetes
   */
  kubernetes: {
    /**
     * Namespace
     * @default 'default'
     */
    namespace: process.env['K8S_NAMESPACE'] || 'default',

    /**
     * Имя deployment
     * @default 'estimate-service'
     */
    deploymentName: process.env['K8S_DEPLOYMENT'] || 'estimate-service',

    /**
     * Настройки HPA (Horizontal Pod Autoscaler)
     */
    hpa: {
      /**
       * Версия API HPA
       * @default 'v2'
       */
      apiVersion: process.env['K8S_HPA_VERSION'] || 'v2',

      /**
       * Поведение при масштабировании вверх
       */
      scaleUp: {
        /**
         * Максимальное количество реплик за период
         * @default 4
         */
        maxReplicas: parseInt(process.env['K8S_SCALE_UP_MAX'] || '4', 10),

        /**
         * Период стабилизации (секунды)
         * @default 60
         */
        stabilizationWindow: parseInt(process.env['K8S_SCALE_UP_WINDOW'] || '60', 10),

        /**
         * Политика выбора
         * @values 'Max' | 'Min' | 'Disabled'
         * @default 'Max'
         */
        selectPolicy: process.env['K8S_SCALE_UP_POLICY'] || 'Max',
      },

      /**
       * Поведение при масштабировании вниз
       */
      scaleDown: {
        /**
         * Максимальное количество реплик за период
         * @default 2
         */
        maxReplicas: parseInt(process.env['K8S_SCALE_DOWN_MAX'] || '2', 10),

        /**
         * Период стабилизации (секунды)
         * @default 300
         */
        stabilizationWindow: parseInt(process.env['K8S_SCALE_DOWN_WINDOW'] || '300', 10),

        /**
         * Политика выбора
         * @values 'Max' | 'Min' | 'Disabled'
         * @default 'Min'
         */
        selectPolicy: process.env['K8S_SCALE_DOWN_POLICY'] || 'Min',
      },
    },

    /**
     * Настройки ресурсов
     */
    resources: {
      /**
       * Запросы ресурсов
       */
      requests: {
        /**
         * CPU (millicores)
         * @default 250
         */
        cpu: process.env['K8S_REQUEST_CPU'] || '250m',

        /**
         * Память
         * @default 512Mi
         */
        memory: process.env['K8S_REQUEST_MEMORY'] || '512Mi',
      },

      /**
       * Лимиты ресурсов
       */
      limits: {
        /**
         * CPU (millicores)
         * @default 1000
         */
        cpu: process.env['K8S_LIMIT_CPU'] || '1000m',

        /**
         * Память
         * @default 2Gi
         */
        memory: process.env['K8S_LIMIT_MEMORY'] || '2Gi',
      },
    },

    /**
     * Настройки проб
     */
    probes: {
      /**
       * Liveness probe
       */
      liveness: {
        /**
         * Путь для проверки
         * @default '/health'
         */
        path: process.env['K8S_LIVENESS_PATH'] || '/health',

        /**
         * Начальная задержка (секунды)
         * @default 30
         */
        initialDelay: parseInt(process.env['K8S_LIVENESS_DELAY'] || '30', 10),

        /**
         * Период проверки (секунды)
         * @default 10
         */
        period: parseInt(process.env['K8S_LIVENESS_PERIOD'] || '10', 10),

        /**
         * Таймаут (секунды)
         * @default 5
         */
        timeout: parseInt(process.env['K8S_LIVENESS_TIMEOUT'] || '5', 10),
      },

      /**
       * Readiness probe
       */
      readiness: {
        /**
         * Путь для проверки
         * @default '/ready'
         */
        path: process.env['K8S_READINESS_PATH'] || '/ready',

        /**
         * Начальная задержка (секунды)
         * @default 10
         */
        initialDelay: parseInt(process.env['K8S_READINESS_DELAY'] || '10', 10),

        /**
         * Период проверки (секунды)
         * @default 5
         */
        period: parseInt(process.env['K8S_READINESS_PERIOD'] || '5', 10),

        /**
         * Таймаут (секунды)
         * @default 3
         */
        timeout: parseInt(process.env['K8S_READINESS_TIMEOUT'] || '3', 10),
      },
    },
  },

  /**
   * Настройки для Docker Swarm
   */
  swarm: {
    /**
     * Имя сервиса
     * @default 'estimate-service'
     */
    serviceName: process.env['SWARM_SERVICE'] || 'estimate-service',

    /**
     * Настройки репликации
     */
    replicas: {
      /**
       * Режим репликации
       * @values 'replicated' | 'global'
       * @default 'replicated'
       */
      mode: process.env['SWARM_MODE'] || 'replicated',

      /**
       * Количество реплик (для replicated mode)
       * @default 2
       */
      count: parseInt(process.env['SWARM_REPLICAS'] || '2', 10),
    },

    /**
     * Настройки обновления
     */
    update: {
      /**
       * Параллельность обновления
       * @default 1
       */
      parallelism: parseInt(process.env['SWARM_UPDATE_PARALLEL'] || '1', 10),

      /**
       * Задержка между обновлениями (секунды)
       * @default 10
       */
      delay: parseInt(process.env['SWARM_UPDATE_DELAY'] || '10', 10),

      /**
       * Действие при сбое
       * @values 'pause' | 'continue' | 'rollback'
       * @default 'rollback'
       */
      failureAction: process.env['SWARM_FAILURE_ACTION'] || 'rollback',
    },

    /**
     * Настройки ресурсов
     */
    resources: {
      /**
       * Резервирование ресурсов
       */
      reservations: {
        /**
         * CPU (доля от 1.0)
         * @default 0.25
         */
        cpu: parseFloat(process.env['SWARM_RESERVE_CPU'] || '0.25'),

        /**
         * Память (MB)
         * @default 512
         */
        memory: parseInt(process.env['SWARM_RESERVE_MEMORY'] || '512', 10),
      },

      /**
       * Лимиты ресурсов
       */
      limits: {
        /**
         * CPU (доля от 1.0)
         * @default 1.0
         */
        cpu: parseFloat(process.env['SWARM_LIMIT_CPU'] || '1.0'),

        /**
         * Память (MB)
         * @default 2048
         */
        memory: parseInt(process.env['SWARM_LIMIT_MEMORY'] || '2048', 10),
      },
    },
  },

  /**
   * Настройки для PM2
   */
  pm2: {
    /**
     * Имя приложения
     * @default 'estimate-service'
     */
    name: process.env['PM2_APP_NAME'] || 'estimate-service',

    /**
     * Режим выполнения
     * @values 'cluster' | 'fork'
     * @default 'cluster'
     */
    execMode: process.env['PM2_EXEC_MODE'] || 'cluster',

    /**
     * Количество инстансов
     * @default 'max' (все CPU ядра)
     */
    instances: process.env['PM2_INSTANCES'] || 'max',

    /**
     * Настройки автомасштабирования (PM2 Plus)
     */
    autoScaling: {
      /**
       * Минимальное количество инстансов
       * @default 2
       */
      min: parseInt(process.env['PM2_MIN_INSTANCES'] || '2', 10),

      /**
       * Максимальное количество инстансов
       * @default 10
       */
      max: parseInt(process.env['PM2_MAX_INSTANCES'] || '10', 10),

      /**
       * CPU порог для масштабирования вверх (%)
       * @default 70
       */
      cpuUp: parseInt(process.env['PM2_CPU_UP'] || '70', 10),

      /**
       * CPU порог для масштабирования вниз (%)
       * @default 20
       */
      cpuDown: parseInt(process.env['PM2_CPU_DOWN'] || '20', 10),

      /**
       * Память порог для масштабирования вверх (MB)
       * @default 1024
       */
      memoryUp: parseInt(process.env['PM2_MEMORY_UP'] || '1024', 10),

      /**
       * Память порог для масштабирования вниз (MB)
       * @default 256
       */
      memoryDown: parseInt(process.env['PM2_MEMORY_DOWN'] || '256', 10),
    },

    /**
     * Настройки перезапуска
     */
    restart: {
      /**
       * Максимальная память перед перезапуском (MB)
       * @default 1500
       */
      maxMemory: process.env['PM2_MAX_MEMORY_RESTART'] || '1500M',

      /**
       * Максимальное количество перезапусков
       * @default 10
       */
      maxRestarts: parseInt(process.env['PM2_MAX_RESTARTS'] || '10', 10),

      /**
       * Минимальное время работы (мс)
       * @default 5000
       */
      minUptime: parseInt(process.env['PM2_MIN_UPTIME'] || '5000', 10),
    },

    /**
     * Настройки логирования
     */
    logs: {
      /**
       * Максимальный размер лог файла
       * @default '10M'
       */
      maxSize: process.env['PM2_LOG_MAX_SIZE'] || '10M',

      /**
       * Количество ротаций логов
       * @default 10
       */
      retain: parseInt(process.env['PM2_LOG_RETAIN'] || '10', 10),

      /**
       * Сжимать архивные логи
       * @default true
       */
      compress: process.env['PM2_LOG_COMPRESS'] !== 'false',
    },
  },

  /**
   * Балансировка нагрузки
   */
  loadBalancing: {
    /**
     * Алгоритм балансировки
     * @values 'round-robin' | 'least-connections' | 'ip-hash' | 'random'
     * @default 'round-robin'
     */
    algorithm: process.env['LB_ALGORITHM'] || 'round-robin',

    /**
     * Включить sticky sessions
     * @default false
     */
    stickySession: process.env['LB_STICKY_SESSION'] === 'true',

    /**
     * TTL для sticky sessions (секунды)
     * @default 3600 (1 час)
     */
    sessionTTL: parseInt(process.env['LB_SESSION_TTL'] || '3600', 10),

    /**
     * Проверка здоровья
     */
    healthCheck: {
      /**
       * Включить проверку здоровья
       * @default true
       */
      enabled: process.env['LB_HEALTH_CHECK'] !== 'false',

      /**
       * Путь для проверки
       * @default '/health'
       */
      path: process.env['LB_HEALTH_PATH'] || '/health',

      /**
       * Интервал проверки (секунды)
       * @default 10
       */
      interval: parseInt(process.env['LB_HEALTH_INTERVAL'] || '10', 10),

      /**
       * Таймаут проверки (секунды)
       * @default 5
       */
      timeout: parseInt(process.env['LB_HEALTH_TIMEOUT'] || '5', 10),

      /**
       * Количество неудачных проверок для исключения
       * @default 3
       */
      unhealthyThreshold: parseInt(process.env['LB_UNHEALTHY_THRESHOLD'] || '3', 10),

      /**
       * Количество успешных проверок для включения
       * @default 2
       */
      healthyThreshold: parseInt(process.env['LB_HEALTHY_THRESHOLD'] || '2', 10),
    },
  },

  /**
   * Service Discovery
   */
  serviceDiscovery: {
    /**
     * Включить service discovery
     * @default true
     */
    enabled: process.env['SD_ENABLED'] !== 'false',

    /**
     * Провайдер service discovery
     * @values 'consul' | 'etcd' | 'kubernetes' | 'dns'
     * @default 'dns'
     */
    provider: process.env['SD_PROVIDER'] || 'dns',

    /**
     * Настройки регистрации
     */
    registration: {
      /**
       * Имя сервиса
       * @default 'estimate-service'
       */
      serviceName: process.env['SD_SERVICE_NAME'] || 'estimate-service',

      /**
       * Теги сервиса
       * @default ['api', 'v1']
       */
      tags: process.env['SD_TAGS']?.split(',') || ['api', 'v1'],

      /**
       * TTL регистрации (секунды)
       * @default 30
       */
      ttl: parseInt(process.env['SD_TTL'] || '30', 10),

      /**
       * Интервал обновления (секунды)
       * @default 20
       */
      refreshInterval: parseInt(process.env['SD_REFRESH'] || '20', 10),
    },
  },
}));

/**
 * Тип конфигурации масштабирования
 */
export interface ScalingConfig {
  mode: 'kubernetes' | 'swarm' | 'pm2' | 'manual';
  general: {
    minInstances: number;
    maxInstances: number;
    desiredInstances: number;
    autoScale: boolean;
    metricsInterval: number;
    scaleDelay: number;
    stabilizationPeriod: number;
  };
  metrics: {
    cpu: {
      enabled: boolean;
      scaleUpThreshold: number;
      scaleDownThreshold: number;
      averagePeriod: number;
    };
    memory: {
      enabled: boolean;
      scaleUpThreshold: number;
      scaleDownThreshold: number;
      averagePeriod: number;
    };
    requests: {
      enabled: boolean;
      scaleUpThreshold: number;
      scaleDownThreshold: number;
      averagePeriod: number;
    };
    queue: {
      enabled: boolean;
      scaleUpThreshold: number;
      scaleDownThreshold: number;
      checkPeriod: number;
    };
    custom: {
      enabled: boolean;
      metricName: string;
      scaleUpThreshold: number;
      scaleDownThreshold: number;
    };
  };
  kubernetes: any;
  swarm: any;
  pm2: any;
  loadBalancing: any;
  serviceDiscovery: any;
}
