import { registerAs } from '@nestjs/config';

/**
 * Конфигурация безопасности приложения
 */
export default registerAs('security', () => {
  // Проверяем наличие критических переменных окружения
  const requiredEnvVars = ['JWT_SECRET', 'MASTER_API_KEY', 'ENCRYPTION_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required security environment variables: ${missingVars.join(', ')}`);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // JWT Configuration
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      algorithm: 'HS512' as const,
    },

    // Master API Key для административных операций
    masterApiKey: process.env.MASTER_API_KEY,

    // Encryption Configuration
    encryption: {
      key: process.env.ENCRYPTION_KEY,
      algorithm: 'aes-256-gcm' as const,
      ivLength: 16,
      saltLength: 64,
      tagLength: 16,
      pbkdf2Iterations: 100000,
    },

    // Bcrypt Configuration
    bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    },

    // CORS Configuration для production доменов
    cors: {
      origin: isProduction 
        ? (process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || ['https://estimate.yourdomain.com'])
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: process.env.CORS_METHODS?.split(',') || ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10),
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },

    // Rate Limiting параметры
    rateLimit: {
      // Общие лимиты
      global: {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10), // 1 минута
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 запросов
      },
      // Специфичные лимиты для разных эндпоинтов
      endpoints: {
        auth: {
          ttl: 300000, // 5 минут
          max: 5, // 5 попыток входа
        },
        api: {
          ttl: 60000, // 1 минута
          max: 100, // 100 запросов
        },
        upload: {
          ttl: 300000, // 5 минут
          max: 10, // 10 загрузок
        },
        export: {
          ttl: 600000, // 10 минут
          max: 5, // 5 экспортов
        },
      },
      // Настройки для production
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req: any) => req.ip || req.connection.remoteAddress,
    },

    // Security Headers
    helmet: {
      enabled: process.env.HELMET_ENABLED !== 'false', // Включено по умолчанию
      hsts: {
        maxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10), // 1 год
        includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS !== 'false',
        preload: process.env.HSTS_PRELOAD === 'true',
      },
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          connectSrc: ["'self'", 'https://api.deepseek.com', 'wss:', 'https:'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: isProduction ? [] : null,
        },
      },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    },

    // CSP (Content Security Policy) правила
    csp: {
      enabled: process.env.CSP_ENABLED !== 'false',
      reportOnly: process.env.CSP_REPORT_ONLY === 'true',
      reportUri: process.env.CSP_REPORT_URI || '/api/csp-report',
      nonce: {
        enabled: isProduction,
        length: 16,
      },
    },

    // CSRF Protection
    csrf: {
      enabled: process.env.CSRF_ENABLED !== 'false',
      tokenLength: 32,
      cookieName: '_csrf',
      headerName: 'X-CSRF-Token',
      parameterName: '_csrf',
      sessionKey: 'csrf-secret',
    },

    // Session и cookie настройки
    session: {
      secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
      name: isProduction ? '__Host-session' : 'session', // Используем __Host- префикс в production
      resave: false,
      saveUninitialized: false,
      rolling: true, // Обновляем время жизни сессии при активности
      proxy: isProduction, // Доверяем прокси в production
      cookie: {
        secure: isProduction, // HTTPS only в production
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 часа
        sameSite: isProduction ? 'strict' : 'lax',
        domain: process.env.COOKIE_DOMAIN || undefined,
        path: '/',
      },
      // Стораж сессий (можно настроить Redis)
      store: undefined, // TODO: Использовать Redis store в production
    },
  };
});

/**
 * Типы для автодополнения и проверки типов
 */
export interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    algorithm: 'HS512';
  };
  masterApiKey: string;
  encryption: {
    key: string;
    algorithm: 'aes-256-gcm';
    ivLength: number;
    saltLength: number;
    tagLength: number;
    pbkdf2Iterations: number;
  };
  bcrypt: {
    rounds: number;
  };
  cors: {
    origin: string[] | boolean | ((origin: any, callback: any) => void);
    credentials: boolean;
    methods: string[];
    maxAge: number;
    allowedHeaders: string[];
    exposedHeaders: string[];
    preflightContinue: boolean;
    optionsSuccessStatus: number;
  };
  rateLimit: {
    global: {
      ttl: number;
      max: number;
    };
    endpoints: {
      auth: { ttl: number; max: number; };
      api: { ttl: number; max: number; };
      upload: { ttl: number; max: number; };
      export: { ttl: number; max: number; };
    };
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
    keyGenerator: (req: any) => string;
  };
  helmet: {
    enabled: boolean;
    hsts: {
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
    contentSecurityPolicy: {
      useDefaults: boolean;
      directives: Record<string, any>;
    };
    dnsPrefetchControl: { allow: boolean };
    frameguard: { action: string };
    hidePoweredBy: boolean;
    ieNoOpen: boolean;
    noSniff: boolean;
    originAgentCluster: boolean;
    permittedCrossDomainPolicies: boolean;
    referrerPolicy: { policy: string };
    xssFilter: boolean;
  };
  csp: {
    enabled: boolean;
    reportOnly: boolean;
    reportUri: string;
    nonce: {
      enabled: boolean;
      length: number;
    };
  };
  csrf: {
    enabled: boolean;
    tokenLength: number;
    cookieName: string;
    headerName: string;
    parameterName: string;
    sessionKey: string;
  };
  session: {
    secret: string;
    name: string;
    resave: boolean;
    saveUninitialized: boolean;
    rolling: boolean;
    proxy: boolean;
    cookie: {
      secure: boolean;
      httpOnly: boolean;
      maxAge: number;
      sameSite: 'strict' | 'lax' | 'none';
      domain?: string;
      path: string;
    };
    store?: any;
  };
}
