# Руководство по безопасности Estimate Service

## Обзор безопасности

Данное руководство описывает требования и рекомендации по обеспечению безопасности системы составления сметной документации Estimate Service.

## Модель угроз

### Основные активы
- **Данные ФСБЦ-2022**: Критически важная справочная информация
- **Пользовательские сметы**: Конфиденциальная коммерческая информация
- **ИИ-модели**: Обученные модели и база знаний
- **Пользовательские данные**: Личная информация и учетные записи
- **API ключи**: Токены доступа к внешним сервисам

### Потенциальные угрозы
1. **Несанкционированный доступ** к сметным данным
2. **Инъекции** (SQL, NoSQL, Command Injection)
3. **Атаки на ИИ-компоненты** (Prompt Injection, Model Poisoning)
4. **DDoS атаки** на API endpoints
5. **Утечка данных** через логи или API responses
6. **Компрометация учетных записей**
7. **Man-in-the-middle атаки**

## Аутентификация и авторизация

### 1. JWT Authentication

#### Конфигурация токенов
```typescript
// src/auth/auth.config.ts
export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET, // Минимум 256 бит
    expiresIn: '15m', // Короткое время жизни access token
    issuer: 'estimate-service',
    audience: 'estimate-api',
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
    secure: true, // Только HTTPS
    httpOnly: true, // Защита от XSS
    sameSite: 'strict', // CSRF protection
  },
};
```

#### Безопасная генерация токенов
```typescript
import { randomBytes, createHmac } from 'crypto';

@Injectable()
export class TokenService {
  generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  createJWT(payload: any): string {
    // Добавляем дополнительные claims для безопасности
    const enhancedPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      jti: this.generateSecureToken(), // Unique token ID
      ip: payload.ip, // IP address binding
      ua: createHmac('sha256', process.env.JWT_SECRET)
        .update(payload.userAgent)
        .digest('hex'), // User agent hash
    };

    return this.jwtService.sign(enhancedPayload);
  }
}
```

### 2. Role-Based Access Control (RBAC)

#### Определение ролей
```typescript
// src/auth/roles.enum.ts
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  ESTIMATOR = 'estimator',
  VIEWER = 'viewer',
  API_USER = 'api_user',
}

// src/auth/permissions.enum.ts
export enum Permission {
  // Сметы
  ESTIMATE_CREATE = 'estimate:create',
  ESTIMATE_READ = 'estimate:read',
  ESTIMATE_UPDATE = 'estimate:update',
  ESTIMATE_DELETE = 'estimate:delete',
  ESTIMATE_APPROVE = 'estimate:approve',

  // ФСБЦ-2022
  FSBTS_READ = 'fsbts:read',
  FSBTS_ADMIN = 'fsbts:admin',

  // ИИ-ассистент
  AI_CHAT = 'ai:chat',
  AI_ANALYZE = 'ai:analyze',
  AI_ADMIN = 'ai:admin',

  // Пользователи
  USER_READ = 'user:read',
  USER_MANAGE = 'user:manage',

  // Система
  SYSTEM_ADMIN = 'system:admin',
  AUDIT_READ = 'audit:read',
}
```

#### Матрица разрешений
```typescript
// src/auth/role-permissions.ts
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    ...Object.values(Permission)
  ],

  [Role.ADMIN]: [
    Permission.ESTIMATE_CREATE,
    Permission.ESTIMATE_READ,
    Permission.ESTIMATE_UPDATE,
    Permission.ESTIMATE_DELETE,
    Permission.FSBTS_READ,
    Permission.AI_CHAT,
    Permission.AI_ANALYZE,
    Permission.USER_READ,
    Permission.USER_MANAGE,
    Permission.AUDIT_READ,
  ],

  [Role.PROJECT_MANAGER]: [
    Permission.ESTIMATE_CREATE,
    Permission.ESTIMATE_READ,
    Permission.ESTIMATE_UPDATE,
    Permission.ESTIMATE_APPROVE,
    Permission.FSBTS_READ,
    Permission.AI_CHAT,
    Permission.AI_ANALYZE,
  ],

  [Role.ESTIMATOR]: [
    Permission.ESTIMATE_CREATE,
    Permission.ESTIMATE_READ,
    Permission.ESTIMATE_UPDATE,
    Permission.FSBTS_READ,
    Permission.AI_CHAT,
  ],

  [Role.VIEWER]: [
    Permission.ESTIMATE_READ,
    Permission.FSBTS_READ,
  ],

  [Role.API_USER]: [
    Permission.ESTIMATE_READ,
    Permission.FSBTS_READ,
    Permission.AI_CHAT,
  ],
};
```

### 3. Guards и Decorators

```typescript
// src/auth/guards/permissions.guard.ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userPermissions = this.getUserPermissions(user);

    return requiredPermissions.every(permission =>
      userPermissions.includes(permission),
    );
  }
}

// src/auth/decorators/permissions.decorator.ts
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata('permissions', permissions);
```

## Валидация и санитизация данных

### 1. Input Validation

```typescript
// src/common/dto/base.dto.ts
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { sanitizeHtml } from '../utils/sanitize.util';

export class CreateEstimateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => sanitizeHtml(value))
  @Matches(/^[a-zA-Zа-яА-Я0-9\s\-_.]+$/, {
    message: 'Name contains invalid characters',
  })
  name: string;

  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => sanitizeHtml(value))
  description?: string;

  @IsNumber()
  @Min(1)
  @Max(999999)
  projectId: number;
}
```

### 2. Sanitization Utils

```typescript
// src/common/utils/sanitize.util.ts
import DOMPurify from 'isomorphic-dompurify';
import { escape } from 'html-escaper';

export function sanitizeHtml(input: string): string {
  if (!input) return input;

  // Удаляем HTML теги
  const cleaned = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });

  // Экранируем специальные символы
  return escape(cleaned);
}

export function sanitizeSqlInput(input: string): string {
  if (!input) return input;

  // Удаляем потенциально опасные символы для SQL
  return input.replace(/[;'"`\\]/g, '');
}

export function sanitizeFilename(filename: string): string {
  // Удаляем опасные символы для файловой системы
  return filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
}
```

### 3. Rate Limiting

```typescript
// src/common/guards/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: any,
    storageService: any,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  protected getTracker(req: Record<string, any>): string {
    // Комбинируем IP и User ID для более точного ограничения
    const ip = req.ip || req.connection.remoteAddress;
    const userId = req.user?.id || 'anonymous';
    return `${ip}:${userId}`;
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    // Пропускаем для супер-админов
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.role === Role.SUPER_ADMIN) {
      return true;
    }

    return super.shouldSkip(context);
  }
}
```

## Безопасность API

### 1. API Security Headers

```typescript
// src/main.ts
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'same-origin' },
  }));

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3000);
}
```

### 2. Request Validation Middleware

```typescript
// src/common/middleware/security.middleware.ts
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Проверка размера запроса
    if (req.headers['content-length']) {
      const contentLength = parseInt(req.headers['content-length']);
      if (contentLength > 10 * 1024 * 1024) { // 10MB limit
        throw new PayloadTooLargeException('Request too large');
      }
    }

    // Проверка Content-Type для POST/PUT запросов
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      if (!contentType?.includes('application/json')) {
        throw new BadRequestException('Invalid content type');
      }
    }

    // Логирование подозрительных запросов
    this.logSuspiciousActivity(req);

    next();
  }

  private logSuspiciousActivity(req: Request) {
    const suspiciousPatterns = [
      /[<>'"]/g, // XSS patterns
      /union|select|insert|update|delete|drop/gi, // SQL injection
      /\.\.\/|\.\.\\/, // Path traversal
      /javascript:|data:|vbscript:/gi, // Script injection
    ];

    const url = req.url;
    const body = JSON.stringify(req.body);

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(url) || pattern.test(body)) {
        console.warn(`Suspicious activity detected: ${req.ip} - ${req.method} ${url}`);
      }
    });
  }
}
```

## Безопасность ИИ-компонентов

### 1. Prompt Injection Protection

```typescript
// src/ai/guards/prompt-security.guard.ts
@Injectable()
export class PromptSecurityGuard {
  private readonly dangerousPatterns = [
    /ignore\s+previous\s+instructions/gi,
    /system\s+prompt/gi,
    /pretend\s+to\s+be/gi,
    /act\s+as\s+if/gi,
    /forget\s+everything/gi,
    /new\s+instructions/gi,
    /override\s+instructions/gi,
  ];

  validatePrompt(prompt: string): boolean {
    // Проверка на опасные паттерны
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(prompt)) {
        return false;
      }
    }

    // Проверка длины
    if (prompt.length > 4000) {
      return false;
    }

    return true;
  }

  sanitizePrompt(prompt: string): string {
    // Удаляем потенциально опасный контент
    let sanitized = prompt.replace(/[<>'"]/g, '');

    // Ограничиваем специальные символы
    sanitized = sanitized.replace(/[{}[\]\\]/g, '');

    return sanitized.trim();
  }
}
```

### 2. AI Response Filtering

```typescript
// src/ai/filters/response-filter.service.ts
@Injectable()
export class AIResponseFilterService {
  private readonly sensitivePatterns = [
    /password|secret|key|token/gi,
    /\b\d{16}\b/, // Credit card numbers
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN patterns
    /api[_-]?key/gi,
  ];

  filterResponse(response: string): string {
    let filtered = response;

    // Удаляем потенциально чувствительную информацию
    this.sensitivePatterns.forEach(pattern => {
      filtered = filtered.replace(pattern, '[REDACTED]');
    });

    return filtered;
  }

  validateResponse(response: string): boolean {
    // Проверяем, что ответ не содержит вредоносного контента
    const harmfulPatterns = [
      /javascript:/gi,
      /<script/gi,
      /eval\(/gi,
      /onclick/gi,
    ];

    return !harmfulPatterns.some(pattern => pattern.test(response));
  }
}
```

## Безопасность базы данных

### 1. Prisma Security Configuration

```typescript
// src/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });

    // Логирование всех запросов в продакшене
    this.$on('query', (e) => {
      if (process.env.NODE_ENV === 'production') {
        console.log('Query: ' + e.query);
        console.log('Duration: ' + e.duration + 'ms');
      }
    });

    // Логирование ошибок
    this.$on('error', (e) => {
      console.error('Database error:', e);
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  // Безопасный метод для raw queries
  async safeRawQuery<T>(query: string, params: any[] = []): Promise<T[]> {
    // Валидация query для предотвращения SQL injection
    if (this.containsSqlInjection(query)) {
      throw new BadRequestException('Invalid query detected');
    }

    return this.$queryRaw`${query}`;
  }

  private containsSqlInjection(query: string): boolean {
    const dangerousPatterns = [
      /;/g, // Multiple statements
      /--/g, // Comments
      /\/\*/g, // Block comments
      /\bexec\b/gi,
      /\bexecute\b/gi,
      /\bsp_/gi,
      /\bxp_/gi,
    ];

    return dangerousPatterns.some(pattern => pattern.test(query));
  }
}
```

### 2. Row Level Security (RLS)

```sql
-- Включение RLS для таблицы смет
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свои сметы
CREATE POLICY user_estimates ON estimates
  FOR ALL TO estimate_user
  USING (created_by = current_setting('app.user_id')::int);

-- Политика: администраторы видят все сметы
CREATE POLICY admin_estimates ON estimates
  FOR ALL TO estimate_admin
  USING (true);

-- Функция для установки контекста пользователя
CREATE OR REPLACE FUNCTION set_user_context(user_id int, user_role text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_id', user_id::text, true);
  PERFORM set_config('app.user_role', user_role, true);
END;
$$ LANGUAGE plpgsql;
```

## Шифрование данных

### 1. Encryption at Rest

```typescript
// src/common/services/encryption.service.ts
import { createCipher, createDecipher, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;

  async encrypt(text: string, password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await promisify(scrypt)(password, salt, this.keyLength) as Buffer;
    const iv = randomBytes(16);

    const cipher = createCipher(this.algorithm, key);
    cipher.setAAD(salt);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  async decrypt(encryptedData: string, password: string): Promise<string> {
    const [saltHex, ivHex, authTagHex, encrypted] = encryptedData.split(':');

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const key = await promisify(scrypt)(password, salt, this.keyLength) as Buffer;

    const decipher = createDecipher(this.algorithm, key);
    decipher.setAAD(salt);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### 2. Encryption in Transit

```typescript
// SSL/TLS configuration
// src/main.ts
import { readFileSync } from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync('./secrets/private-key.pem'),
    cert: readFileSync('./secrets/certificate.pem'),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  await app.listen(3000);
}
```

## Аудит и логирование

### 1. Audit Log Service

```typescript
// src/audit/audit.service.ts
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logActivity(data: {
    userId: number;
    action: string;
    resource: string;
    resourceId?: string;
    ip: string;
    userAgent: string;
    details?: any;
  }) {
    await this.prisma.auditLog.create({
      data: {
        ...data,
        timestamp: new Date(),
        success: true,
      },
    });
  }

  async logSecurityEvent(data: {
    type: 'LOGIN_FAILED' | 'SUSPICIOUS_ACTIVITY' | 'PERMISSION_DENIED';
    ip: string;
    userAgent: string;
    details: any;
  }) {
    await this.prisma.securityEvent.create({
      data: {
        ...data,
        timestamp: new Date(),
      },
    });

    // Отправка алертов при критических событиях
    if (data.type === 'SUSPICIOUS_ACTIVITY') {
      await this.sendSecurityAlert(data);
    }
  }

  private async sendSecurityAlert(event: any) {
    // Отправка уведомления администраторам
    console.warn('Security Alert:', event);
  }
}
```

### 2. Audit Interceptor

```typescript
// src/common/interceptors/audit.interceptor.ts
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, ip, headers } = request;
    const action = `${request.method} ${request.route.path}`;

    return next.handle().pipe(
      tap(async () => {
        await this.auditService.logActivity({
          userId: user?.id,
          action,
          resource: this.getResourceName(context),
          ip,
          userAgent: headers['user-agent'],
        });
      }),
      catchError(async (error) => {
        await this.auditService.logActivity({
          userId: user?.id,
          action,
          resource: this.getResourceName(context),
          ip,
          userAgent: headers['user-agent'],
          details: { error: error.message },
        });
        throw error;
      }),
    );
  }

  private getResourceName(context: ExecutionContext): string {
    return context.getClass().name.replace('Controller', '');
  }
}
```

## Мониторинг безопасности

### 1. Security Metrics

```typescript
// src/security/security-metrics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class SecurityMetricsService {
  constructor(
    @InjectMetric('security_events_total')
    private readonly securityEventsCounter: Counter<string>,

    @InjectMetric('auth_attempts_total')
    private readonly authAttemptsCounter: Counter<string>,

    @InjectMetric('rate_limit_hits_total')
    private readonly rateLimitCounter: Counter<string>,
  ) {}

  recordSecurityEvent(type: string) {
    this.securityEventsCounter.inc({ type });
  }

  recordAuthAttempt(success: boolean) {
    this.authAttemptsCounter.inc({ success: success.toString() });
  }

  recordRateLimitHit(endpoint: string) {
    this.rateLimitCounter.inc({ endpoint });
  }
}
```

### 2. Alerting Rules

```yaml
# monitoring/alerts.yml
groups:
  - name: security
    rules:
      - alert: HighFailedLoginAttempts
        expr: rate(auth_attempts_total{success="false"}[5m]) > 5
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "High number of failed login attempts"
          description: "{{ $value }} failed login attempts per second"

      - alert: SuspiciousActivity
        expr: increase(security_events_total{type="SUSPICIOUS_ACTIVITY"}[5m]) > 10
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Suspicious activity detected"

      - alert: RateLimitExceeded
        expr: rate(rate_limit_hits_total[1m]) > 100
        for: 30s
        labels:
          severity: warning
        annotations:
          summary: "Rate limit frequently exceeded"
```

## Compliance и регулятивные требования

### 1. GDPR Compliance

```typescript
// src/privacy/gdpr.service.ts
@Injectable()
export class GdprService {
  constructor(private readonly prisma: PrismaService) {}

  // Право на получение данных
  async exportUserData(userId: number): Promise<any> {
    const userData = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        estimates: true,
        auditLogs: true,
      },
    });

    return this.anonymizeExportData(userData);
  }

  // Право на удаление
  async deleteUserData(userId: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.auditLog.deleteMany({ where: { userId } }),
      this.prisma.estimate.updateMany({
        where: { createdBy: userId },
        data: { createdBy: null, anonymized: true },
      }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  // Анонимизация персональных данных
  private anonymizeExportData(data: any): any {
    return {
      ...data,
      email: this.hashEmail(data.email),
      phone: '***-***-****',
      ip: '***.***.***.**',
    };
  }

  private hashEmail(email: string): string {
    return createHash('sha256').update(email).digest('hex').substring(0, 10) + '@anonymized.com';
  }
}
```

### 2. Данные для аудита

```sql
-- Таблица для GDPR compliance
CREATE TABLE data_processing_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  processing_type VARCHAR(50) NOT NULL, -- 'export', 'delete', 'anonymize'
  legal_basis VARCHAR(100) NOT NULL,
  processed_at TIMESTAMP DEFAULT NOW(),
  processor_id INTEGER REFERENCES users(id),
  retention_period INTERVAL,
  details JSONB
);
```

## Checklist безопасности

### Перед развертыванием

- [ ] Все секреты хранятся в переменных окружения
- [ ] Включено HTTPS для всех endpoints
- [ ] Настроены security headers
- [ ] Включена валидация всех входных данных
- [ ] Настроено rate limiting
- [ ] Включено логирование безопасности
- [ ] Проведено тестирование на проникновение
- [ ] Настроены алерты безопасности
- [ ] Обновлены все зависимости
- [ ] Включен мониторинг безопасности

### Регулярное обслуживание

- [ ] Еженедельный аудит логов безопасности
- [ ] Ежемесячное обновление зависимостей
- [ ] Квартальный penetration testing
- [ ] Полугодовой security audit
- [ ] Годовая проверка соответствия требованиям

## Контакты по безопасности

- **Security Team**: security@estimate-service.com
- **Bug Bounty**: https://hackerone.com/estimate-service
- **Emergency**: +7-XXX-XXX-XXXX (24/7)
