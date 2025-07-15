import { registerAs } from '@nestjs/config';

/**
 * Конфигурация систем мониторинга и наблюдаемости
 */
export default registerAs('monitoring', () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    // Sentry конфигурация для отслеживания ошибок
    sentry: {
      enabled: process.env.SENTRY_ENABLED !== 'false',
      dsn: process.env.SENTRY_DSN || '',
      environment: process.env.NODE_ENV || 'development',
      debug: process.env.SENTRY_DEBUG === 'true',
      sampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE || '1.0'), // 100% в dev, можно снизить в prod
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'), // 10% трассировок
      profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'), // 10% профилей
      attachStacktrace: true,
      autoSessionTracking: true,
      maxBreadcrumbs: parseInt(process.env.SENTRY_MAX_BREADCRUMBS || '100', 10),
      // Интеграции
      integrations: {
        http: true,
        express: true,
        postgres: true,
        redis: true,
      },
      // Фильтрация чувствительных данных
      beforeSend: {
        enabled: true,
        // Список полей для очистки
        scrubFields: [
          'password',
          'token',
          'api_key',
          'apiKey',
          'secret',
          'authorization',
          'cookie',
          'csrf',
          'credit_card',
          'creditCard',
          'cvv',
          'ssn',
        ],
      },
      // Игнорируемые ошибки
      ignoreErrors: [
        // Браузерные ошибки
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        // Сетевые ошибки
        'NetworkError',
        'Failed to fetch',
        // Известные проблемы
        'AbortError',
      ],
      // Конфигурация релизов
      release: process.env.SENTRY_RELEASE || process.env.APP_VERSION || 'unknown',
      dist: process.env.SENTRY_DIST || undefined,
    },

    // Структурированное логирование
    logging: {
      // Основные настройки
      level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
      format: process.env.LOG_FORMAT || 'json', // 'json' или 'pretty'
      timestamp: true,
      colorize: !isProduction,
      
      // Настройки для разных транспортов
      transports: {
        console: {
          enabled: true,
          level: process.env.CONSOLE_LOG_LEVEL || 'info',
        },
        file: {
          enabled: process.env.FILE_LOGGING_ENABLED === 'true',
          filename: process.env.LOG_FILE_PATH || 'logs/app.log',
          maxSize: process.env.LOG_MAX_SIZE || '100m',
          maxFiles: process.env.LOG_MAX_FILES || '7d',
          compress: true,
        },
        elasticsearch: {
          enabled: process.env.ELASTICSEARCH_LOGGING_ENABLED === 'true',
          node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
          index: process.env.ELASTICSEARCH_INDEX || 'estimate-service-logs',
          type: '_doc',
        },
      },
      
      // Метаданные для логов
      metadata: {
        service: 'estimate-service',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        hostname: process.env.HOSTNAME || 'unknown',
      },
      
      // Настройки для разных модулей
      modules: {
        http: {
          enabled: true,
          logBody: isDevelopment,
          logHeaders: isDevelopment,
          excludePaths: ['/health', '/metrics', '/api/docs'],
        },
        database: {
          enabled: true,
          logQueries: isDevelopment,
          slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10), // ms
        },
        redis: {
          enabled: true,
          logCommands: isDevelopment,
        },
      },
    },

    // OpenTelemetry конфигурация
    opentelemetry: {
      enabled: process.env.OTEL_ENABLED === 'true',
      serviceName: process.env.OTEL_SERVICE_NAME || 'estimate-service',
      serviceVersion: process.env.OTEL_SERVICE_VERSION || process.env.APP_VERSION || '1.0.0',
      
      // Экспортеры
      exporters: {
        // OTLP экспортер
        otlp: {
          enabled: process.env.OTEL_EXPORTER_OTLP_ENABLED !== 'false',
          endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
          headers: process.env.OTEL_EXPORTER_OTLP_HEADERS || '',
          compression: process.env.OTEL_EXPORTER_OTLP_COMPRESSION || 'gzip',
        },
        // Jaeger экспортер
        jaeger: {
          enabled: process.env.OTEL_EXPORTER_JAEGER_ENABLED === 'true',
          endpoint: process.env.OTEL_EXPORTER_JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
        },
        // Prometheus экспортер для метрик
        prometheus: {
          enabled: process.env.OTEL_EXPORTER_PROMETHEUS_ENABLED !== 'false',
          port: parseInt(process.env.OTEL_EXPORTER_PROMETHEUS_PORT || '9464', 10),
          path: process.env.OTEL_EXPORTER_PROMETHEUS_PATH || '/metrics',
        },
      },
      
      // Настройки трассировки
      tracing: {
        enabled: process.env.OTEL_TRACES_ENABLED !== 'false',
        sampler: process.env.OTEL_TRACES_SAMPLER || 'parentbased_always_on',
        samplerArg: parseFloat(process.env.OTEL_TRACES_SAMPLER_ARG || '1.0'),
        // Автоматическая инструментация
        instrumentations: {
          http: true,
          express: true,
          nestjs: true,
          postgres: true,
          redis: true,
          fs: isDevelopment,
          dns: isDevelopment,
        },
      },
      
      // Настройки метрик
      metrics: {
        enabled: process.env.OTEL_METRICS_ENABLED !== 'false',
        interval: parseInt(process.env.OTEL_METRICS_INTERVAL || '30000', 10), // 30 секунд
        // Включенные метрики
        collectors: {
          system: true, // CPU, память, диск
          http: true, // HTTP запросы
          database: true, // Запросы к БД
          custom: true, // Кастомные метрики
        },
      },
      
      // Настройки логов
      logs: {
        enabled: process.env.OTEL_LOGS_ENABLED === 'true',
        level: process.env.OTEL_LOG_LEVEL || 'info',
      },
      
      // Ресурсы и атрибуты
      resource: {
        attributes: {
          'service.namespace': process.env.SERVICE_NAMESPACE || 'estimate',
          'deployment.environment': process.env.NODE_ENV || 'development',
          'service.instance.id': process.env.SERVICE_INSTANCE_ID || process.env.HOSTNAME || 'unknown',
          'cloud.provider': process.env.CLOUD_PROVIDER || 'none',
          'cloud.region': process.env.CLOUD_REGION || 'none',
        },
      },
    },

    // Метрики производительности
    performance: {
      enabled: process.env.PERFORMANCE_MONITORING_ENABLED !== 'false',
      
      // Пороговые значения для алертов
      thresholds: {
        responseTime: {
          p50: parseInt(process.env.PERF_RESPONSE_TIME_P50 || '100', 10), // ms
          p95: parseInt(process.env.PERF_RESPONSE_TIME_P95 || '500', 10), // ms
          p99: parseInt(process.env.PERF_RESPONSE_TIME_P99 || '1000', 10), // ms
        },
        errorRate: parseFloat(process.env.PERF_ERROR_RATE_THRESHOLD || '0.05'), // 5%
        cpuUsage: parseFloat(process.env.PERF_CPU_THRESHOLD || '0.8'), // 80%
        memoryUsage: parseFloat(process.env.PERF_MEMORY_THRESHOLD || '0.85'), // 85%
        
        // База данных
        database: {
          connectionPoolUsage: parseFloat(process.env.PERF_DB_POOL_THRESHOLD || '0.9'), // 90%
          queryTime: parseInt(process.env.PERF_DB_QUERY_TIME || '1000', 10), // ms
          transactionTime: parseInt(process.env.PERF_DB_TRANSACTION_TIME || '5000', 10), // ms
        },
        
        // Redis
        redis: {
          connectionPoolUsage: parseFloat(process.env.PERF_REDIS_POOL_THRESHOLD || '0.9'), // 90%
          commandTime: parseInt(process.env.PERF_REDIS_COMMAND_TIME || '100', 10), // ms
        },
      },
      
      // Сбор метрик
      collection: {
        interval: parseInt(process.env.METRICS_COLLECTION_INTERVAL || '10000', 10), // 10 секунд
        // Включенные метрики
        metrics: {
          // HTTP метрики
          httpRequestDuration: true,
          httpRequestSize: true,
          httpResponseSize: true,
          httpActiveRequests: true,
          
          // Системные метрики
          cpuUsage: true,
          memoryUsage: true,
          eventLoopDelay: true,
          gcDuration: true,
          
          // Метрики базы данных
          dbConnectionPool: true,
          dbQueryDuration: true,
          dbTransactionDuration: true,
          
          // Redis метрики
          redisCommandDuration: true,
          redisConnectionPool: true,
          
          // Бизнес-метрики
          estimateCreationTime: true,
          fileProcessingTime: true,
          aiResponseTime: true,
          exportGenerationTime: true,
        },
      },
      
      // Настройки для APM (Application Performance Monitoring)
      apm: {
        enabled: process.env.APM_ENABLED === 'true',
        serviceName: process.env.APM_SERVICE_NAME || 'estimate-service',
        serverUrl: process.env.APM_SERVER_URL || 'http://localhost:8200',
        secretToken: process.env.APM_SECRET_TOKEN || '',
        environment: process.env.NODE_ENV || 'development',
        transactionSampleRate: parseFloat(process.env.APM_TRANSACTION_SAMPLE_RATE || '0.1'), // 10%
        captureBody: isDevelopment ? 'all' : 'off',
        captureHeaders: isDevelopment,
      },
    },

    // Настройки для Health Checks
    healthChecks: {
      enabled: true,
      endpoint: '/health',
      detailedEndpoint: '/health/detailed',
      timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10), // 5 секунд
      
      // Проверяемые компоненты
      checks: {
        database: {
          enabled: true,
          timeout: 3000,
        },
        redis: {
          enabled: true,
          timeout: 1000,
        },
        disk: {
          enabled: true,
          thresholdPercent: 90,
          path: process.env.HEALTH_CHECK_DISK_PATH || '/',
        },
        memory: {
          enabled: true,
          heapUsedThreshold: 1200 * 1024 * 1024, // 1.2 GB
          rssThreshold: 1500 * 1024 * 1024, // 1.5 GB
        },
        externalServices: {
          enabled: true,
          services: [
            {
              name: 'FSBC API',
              url: process.env.FSBC_API_URL || 'https://api.fsbc.ru/health',
              timeout: 5000,
            },
            {
              name: 'AI Service',
              url: process.env.AI_SERVICE_URL || 'http://localhost:3002/health',
              timeout: 3000,
            },
          ],
        },
      },
    },

    // Настройки для дашбордов и визуализации
    dashboards: {
      grafana: {
        enabled: process.env.GRAFANA_ENABLED === 'true',
        url: process.env.GRAFANA_URL || 'http://localhost:3000',
        apiKey: process.env.GRAFANA_API_KEY || '',
        dashboards: {
          main: process.env.GRAFANA_MAIN_DASHBOARD_ID || '',
          performance: process.env.GRAFANA_PERF_DASHBOARD_ID || '',
          business: process.env.GRAFANA_BUSINESS_DASHBOARD_ID || '',
        },
      },
      kibana: {
        enabled: process.env.KIBANA_ENABLED === 'true',
        url: process.env.KIBANA_URL || 'http://localhost:5601',
        space: process.env.KIBANA_SPACE || 'default',
      },
    },

    // Настройки алертинга
    alerting: {
      enabled: process.env.ALERTING_ENABLED === 'true',
      channels: {
        email: {
          enabled: process.env.ALERT_EMAIL_ENABLED === 'true',
          to: process.env.ALERT_EMAIL_TO?.split(',') || [],
          from: process.env.ALERT_EMAIL_FROM || 'alerts@estimate-service.com',
        },
        slack: {
          enabled: process.env.ALERT_SLACK_ENABLED === 'true',
          webhookUrl: process.env.ALERT_SLACK_WEBHOOK_URL || '',
          channel: process.env.ALERT_SLACK_CHANNEL || '#alerts',
        },
        telegram: {
          enabled: process.env.ALERT_TELEGRAM_ENABLED === 'true',
          botToken: process.env.ALERT_TELEGRAM_BOT_TOKEN || '',
          chatId: process.env.ALERT_TELEGRAM_CHAT_ID || '',
        },
      },
      
      // Правила алертинга
      rules: {
        errorRate: {
          enabled: true,
          threshold: 0.05, // 5%
          window: 300, // 5 минут
          severity: 'critical',
        },
        responseTime: {
          enabled: true,
          threshold: 1000, // 1 секунда
          window: 300, // 5 минут
          severity: 'warning',
        },
        systemResources: {
          enabled: true,
          cpu: 0.9, // 90%
          memory: 0.9, // 90%
          disk: 0.95, // 95%
          severity: 'critical',
        },
        serviceHealth: {
          enabled: true,
          consecutiveFailures: 3,
          severity: 'critical',
        },
      },
    },
  };
});

/**
 * Типы для конфигурации мониторинга
 */
export interface MonitoringConfig {
  sentry: {
    enabled: boolean;
    dsn: string;
    environment: string;
    debug: boolean;
    sampleRate: number;
    tracesSampleRate: number;
    profilesSampleRate: number;
    attachStacktrace: boolean;
    autoSessionTracking: boolean;
    maxBreadcrumbs: number;
    integrations: {
      http: boolean;
      express: boolean;
      postgres: boolean;
      redis: boolean;
    };
    beforeSend: {
      enabled: boolean;
      scrubFields: string[];
    };
    ignoreErrors: string[];
    release: string;
    dist?: string;
  };
  logging: {
    level: string;
    format: string;
    timestamp: boolean;
    colorize: boolean;
    transports: {
      console: {
        enabled: boolean;
        level: string;
      };
      file: {
        enabled: boolean;
        filename: string;
        maxSize: string;
        maxFiles: string;
        compress: boolean;
      };
      elasticsearch: {
        enabled: boolean;
        node: string;
        index: string;
        type: string;
      };
    };
    metadata: {
      service: string;
      version: string;
      environment: string;
      hostname: string;
    };
    modules: {
      http: {
        enabled: boolean;
        logBody: boolean;
        logHeaders: boolean;
        excludePaths: string[];
      };
      database: {
        enabled: boolean;
        logQueries: boolean;
        slowQueryThreshold: number;
      };
      redis: {
        enabled: boolean;
        logCommands: boolean;
      };
    };
  };
  opentelemetry: {
    enabled: boolean;
    serviceName: string;
    serviceVersion: string;
    exporters: {
      otlp: {
        enabled: boolean;
        endpoint: string;
        headers: string;
        compression: string;
      };
      jaeger: {
        enabled: boolean;
        endpoint: string;
      };
      prometheus: {
        enabled: boolean;
        port: number;
        path: string;
      };
    };
    tracing: {
      enabled: boolean;
      sampler: string;
      samplerArg: number;
      instrumentations: {
        http: boolean;
        express: boolean;
        nestjs: boolean;
        postgres: boolean;
        redis: boolean;
        fs: boolean;
        dns: boolean;
      };
    };
    metrics: {
      enabled: boolean;
      interval: number;
      collectors: {
        system: boolean;
        http: boolean;
        database: boolean;
        custom: boolean;
      };
    };
    logs: {
      enabled: boolean;
      level: string;
    };
    resource: {
      attributes: Record<string, string>;
    };
  };
  performance: {
    enabled: boolean;
    thresholds: {
      responseTime: {
        p50: number;
        p95: number;
        p99: number;
      };
      errorRate: number;
      cpuUsage: number;
      memoryUsage: number;
      database: {
        connectionPoolUsage: number;
        queryTime: number;
        transactionTime: number;
      };
      redis: {
        connectionPoolUsage: number;
        commandTime: number;
      };
    };
    collection: {
      interval: number;
      metrics: Record<string, boolean>;
    };
    apm: {
      enabled: boolean;
      serviceName: string;
      serverUrl: string;
      secretToken: string;
      environment: string;
      transactionSampleRate: number;
      captureBody: string;
      captureHeaders: boolean;
    };
  };
  healthChecks: {
    enabled: boolean;
    endpoint: string;
    detailedEndpoint: string;
    timeout: number;
    checks: {
      database: {
        enabled: boolean;
        timeout: number;
      };
      redis: {
        enabled: boolean;
        timeout: number;
      };
      disk: {
        enabled: boolean;
        thresholdPercent: number;
        path: string;
      };
      memory: {
        enabled: boolean;
        heapUsedThreshold: number;
        rssThreshold: number;
      };
      externalServices: {
        enabled: boolean;
        services: Array<{
          name: string;
          url: string;
          timeout: number;
        }>;
      };
    };
  };
  dashboards: {
    grafana: {
      enabled: boolean;
      url: string;
      apiKey: string;
      dashboards: {
        main: string;
        performance: string;
        business: string;
      };
    };
    kibana: {
      enabled: boolean;
      url: string;
      space: string;
    };
  };
  alerting: {
    enabled: boolean;
    channels: {
      email: {
        enabled: boolean;
        to: string[];
        from: string;
      };
      slack: {
        enabled: boolean;
        webhookUrl: string;
        channel: string;
      };
      telegram: {
        enabled: boolean;
        botToken: string;
        chatId: string;
      };
    };
    rules: {
      errorRate: {
        enabled: boolean;
        threshold: number;
        window: number;
        severity: string;
      };
      responseTime: {
        enabled: boolean;
        threshold: number;
        window: number;
        severity: string;
      };
      systemResources: {
        enabled: boolean;
        cpu: number;
        memory: number;
        disk: number;
        severity: string;
      };
      serviceHealth: {
        enabled: boolean;
        consecutiveFailures: number;
        severity: string;
      };
    };
  };
}
