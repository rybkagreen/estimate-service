import { registerAs } from '@nestjs/config';

/**
 * Расширенная конфигурация безопасности для production окружения
 */
export default registerAs('securityAdvanced', () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // IP Whitelist/Blacklist
    ipRestrictions: {
      enabled: process.env.IP_RESTRICTIONS_ENABLED === 'true',
      whitelist: process.env.IP_WHITELIST?.split(',').map(ip => ip.trim()) || [],
      blacklist: process.env.IP_BLACKLIST?.split(',').map(ip => ip.trim()) || [],
      trustProxy: isProduction,
    },

    // Дополнительные параметры для API ключей
    apiKeys: {
      rotationEnabled: process.env.API_KEY_ROTATION_ENABLED === 'true',
      rotationInterval: parseInt(process.env.API_KEY_ROTATION_INTERVAL || '2592000000', 10), // 30 дней
      maxKeysPerUser: parseInt(process.env.MAX_API_KEYS_PER_USER || '5', 10),
      keyPrefix: process.env.API_KEY_PREFIX || 'est_',
      keyLength: parseInt(process.env.API_KEY_LENGTH || '32', 10),
    },

    // Защита от брутфорса
    bruteForce: {
      enabled: process.env.BRUTE_FORCE_PROTECTION_ENABLED !== 'false',
      freeRetries: parseInt(process.env.BRUTE_FORCE_FREE_RETRIES || '3', 10),
      minWait: parseInt(process.env.BRUTE_FORCE_MIN_WAIT || '5000', 10), // 5 секунд
      maxWait: parseInt(process.env.BRUTE_FORCE_MAX_WAIT || '900000', 10), // 15 минут
      lifetime: parseInt(process.env.BRUTE_FORCE_LIFETIME || '86400', 10), // 24 часа
      prefix: 'brute_',
    },

    // Двухфакторная аутентификация
    twoFactor: {
      enabled: process.env.TWO_FACTOR_ENABLED === 'true',
      issuer: process.env.TWO_FACTOR_ISSUER || 'Estimate Service',
      window: parseInt(process.env.TWO_FACTOR_WINDOW || '1', 10),
      backupCodesCount: parseInt(process.env.TWO_FACTOR_BACKUP_CODES || '10', 10),
    },

    // Аудит и логирование безопасности
    audit: {
      enabled: process.env.SECURITY_AUDIT_ENABLED !== 'false',
      logLevel: process.env.SECURITY_LOG_LEVEL || 'info',
      events: {
        authentication: true,
        authorization: true,
        dataAccess: true,
        configChanges: true,
        suspiciousActivity: true,
      },
      retention: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90', 10),
    },

    // Защита от XSS
    xss: {
      enabled: process.env.XSS_PROTECTION_ENABLED !== 'false',
      mode: process.env.XSS_PROTECTION_MODE || 'sanitize', // 'sanitize' или 'reject'
      whitelistTags: process.env.XSS_WHITELIST_TAGS?.split(',') || [],
    },

    // Валидация входных данных
    validation: {
      strictMode: isProduction,
      maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb',
      maxUrlLength: parseInt(process.env.MAX_URL_LENGTH || '2048', 10),
      maxParameterCount: parseInt(process.env.MAX_PARAMETER_COUNT || '1000', 10),
      rejectUnknownParameters: isProduction,
    },

    // Защита API
    apiProtection: {
      // Версионирование API
      versioning: {
        enabled: true,
        type: 'header', // 'header', 'url', 'media-type'
        header: 'X-API-Version',
        default: 'v1',
      },
      // Ограничения запросов
      requestLimits: {
        maxDepth: parseInt(process.env.MAX_JSON_DEPTH || '10', 10),
        maxKeys: parseInt(process.env.MAX_JSON_KEYS || '1000', 10),
        maxArrayLength: parseInt(process.env.MAX_ARRAY_LENGTH || '1000', 10),
      },
    },

    // Безопасность файлов
    fileUpload: {
      enabled: true,
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10 MB
      allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
      ],
      scanForViruses: process.env.VIRUS_SCAN_ENABLED === 'true',
      storageEncryption: isProduction,
    },

    // Мониторинг безопасности
    monitoring: {
      // Обнаружение аномалий
      anomalyDetection: {
        enabled: process.env.ANOMALY_DETECTION_ENABLED === 'true',
        thresholds: {
          requestsPerMinute: parseInt(process.env.ANOMALY_REQUESTS_THRESHOLD || '1000', 10),
          failedAuthPerHour: parseInt(process.env.ANOMALY_AUTH_THRESHOLD || '20', 10),
          uniqueIpsPerHour: parseInt(process.env.ANOMALY_IP_THRESHOLD || '1000', 10),
        },
      },
      // Алерты
      alerts: {
        enabled: process.env.SECURITY_ALERTS_ENABLED === 'true',
        channels: process.env.ALERT_CHANNELS?.split(',') || ['email', 'slack'],
        criticalEvents: [
          'multiple_failed_logins',
          'suspicious_api_usage',
          'unauthorized_access_attempt',
          'potential_sql_injection',
          'potential_xss_attack',
        ],
      },
    },

    // Политики паролей
    passwordPolicy: {
      minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '12', 10),
      requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
      requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
      requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
      requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
      preventReuse: parseInt(process.env.PASSWORD_HISTORY_COUNT || '5', 10),
      expirationDays: parseInt(process.env.PASSWORD_EXPIRATION_DAYS || '90', 10),
      preventCommonPasswords: true,
    },

    // Защита от SSRF (Server-Side Request Forgery)
    ssrf: {
      enabled: process.env.SSRF_PROTECTION_ENABLED !== 'false',
      allowedHosts: process.env.SSRF_ALLOWED_HOSTS?.split(',') || [],
      blockedHosts: [
        '127.0.0.1',
        'localhost',
        '0.0.0.0',
        '169.254.169.254', // AWS metadata
        '::1',
        '10.0.0.0/8',
        '172.16.0.0/12',
        '192.168.0.0/16',
      ],
    },

    // Токены доступа
    tokens: {
      // Refresh токены
      refresh: {
        length: parseInt(process.env.REFRESH_TOKEN_LENGTH || '64', 10),
        reuse: process.env.REFRESH_TOKEN_REUSE === 'true',
        maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE || '604800', 10), // 7 дней
      },
      // Временные токены
      temporary: {
        length: parseInt(process.env.TEMP_TOKEN_LENGTH || '32', 10),
        maxAge: parseInt(process.env.TEMP_TOKEN_MAX_AGE || '300', 10), // 5 минут
      },
    },

    // Безопасность WebSocket
    websocket: {
      enabled: process.env.WEBSOCKET_ENABLED === 'true',
      origins: process.env.WEBSOCKET_ORIGINS?.split(',') || [],
      maxMessageSize: parseInt(process.env.WS_MAX_MESSAGE_SIZE || '65536', 10), // 64 KB
      heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000', 10), // 30 секунд
      authentication: 'token', // 'token' или 'session'
    },

    // Соответствие стандартам
    compliance: {
      gdpr: {
        enabled: process.env.GDPR_COMPLIANCE_ENABLED === 'true',
        dataRetentionDays: parseInt(process.env.GDPR_DATA_RETENTION || '730', 10), // 2 года
        anonymizeOnDelete: true,
        requireConsent: true,
      },
      pci: {
        enabled: process.env.PCI_COMPLIANCE_ENABLED === 'true',
        maskCreditCards: true,
        tokenizeSensitiveData: true,
      },
    },
  };
});

/**
 * Типы для расширенной конфигурации безопасности
 */
export interface SecurityAdvancedConfig {
  ipRestrictions: {
    enabled: boolean;
    whitelist: string[];
    blacklist: string[];
    trustProxy: boolean;
  };
  apiKeys: {
    rotationEnabled: boolean;
    rotationInterval: number;
    maxKeysPerUser: number;
    keyPrefix: string;
    keyLength: number;
  };
  bruteForce: {
    enabled: boolean;
    freeRetries: number;
    minWait: number;
    maxWait: number;
    lifetime: number;
    prefix: string;
  };
  twoFactor: {
    enabled: boolean;
    issuer: string;
    window: number;
    backupCodesCount: number;
  };
  audit: {
    enabled: boolean;
    logLevel: string;
    events: {
      authentication: boolean;
      authorization: boolean;
      dataAccess: boolean;
      configChanges: boolean;
      suspiciousActivity: boolean;
    };
    retention: number;
  };
  xss: {
    enabled: boolean;
    mode: string;
    whitelistTags: string[];
  };
  validation: {
    strictMode: boolean;
    maxRequestSize: string;
    maxUrlLength: number;
    maxParameterCount: number;
    rejectUnknownParameters: boolean;
  };
  apiProtection: {
    versioning: {
      enabled: boolean;
      type: string;
      header: string;
      default: string;
    };
    requestLimits: {
      maxDepth: number;
      maxKeys: number;
      maxArrayLength: number;
    };
  };
  fileUpload: {
    enabled: boolean;
    maxFileSize: number;
    allowedMimeTypes: string[];
    scanForViruses: boolean;
    storageEncryption: boolean;
  };
  monitoring: {
    anomalyDetection: {
      enabled: boolean;
      thresholds: {
        requestsPerMinute: number;
        failedAuthPerHour: number;
        uniqueIpsPerHour: number;
      };
    };
    alerts: {
      enabled: boolean;
      channels: string[];
      criticalEvents: string[];
    };
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse: number;
    expirationDays: number;
    preventCommonPasswords: boolean;
  };
  ssrf: {
    enabled: boolean;
    allowedHosts: string[];
    blockedHosts: string[];
  };
  tokens: {
    refresh: {
      length: number;
      reuse: boolean;
      maxAge: number;
    };
    temporary: {
      length: number;
      maxAge: number;
    };
  };
  websocket: {
    enabled: boolean;
    origins: string[];
    maxMessageSize: number;
    heartbeatInterval: number;
    authentication: string;
  };
  compliance: {
    gdpr: {
      enabled: boolean;
      dataRetentionDays: number;
      anonymizeOnDelete: boolean;
      requireConsent: boolean;
    };
    pci: {
      enabled: boolean;
      maskCreditCards: boolean;
      tokenizeSensitiveData: boolean;
    };
  };
}
