# Конфигурация безопасности Estimate Service

## Обзор

Данный документ описывает настройки безопасности приложения Estimate Service.
Все параметры безопасности разделены на две категории:

- **Базовые настройки** (`security.config.ts`) - обязательные параметры
  безопасности
- **Расширенные настройки** (`security-advanced.config.ts`) - дополнительные
  параметры для production

## Базовые настройки безопасности

### 1. JWT Configuration

```env
JWT_SECRET=your-super-secret-jwt-key-here  # Обязательно! Сгенерируйте с помощью: openssl rand -base64 64
JWT_EXPIRES_IN=1h                          # Время жизни access токена
JWT_REFRESH_EXPIRES_IN=7d                  # Время жизни refresh токена
```

### 2. CORS Configuration

```env
# Production домены
CORS_ORIGIN=https://estimate.yourdomain.com,https://admin.estimate.yourdomain.com
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS
CORS_MAX_AGE=86400  # 24 часа
```

**Параметры CORS:**

- `origin` - список разрешенных доменов (автоматически разделяется по запятым)
- `credentials` - всегда `true` для поддержки cookie
- `allowedHeaders` - заголовки: Content-Type, Authorization, X-API-Key,
  X-Requested-With
- `exposedHeaders` - заголовки для клиента: X-Total-Count, X-Page-Count

### 3. Rate Limiting

```env
# Общие лимиты
RATE_LIMIT_TTL=60000      # 1 минута
RATE_LIMIT_MAX=100        # 100 запросов в минуту
```

**Специфичные лимиты для эндпоинтов:**

- **Auth endpoints**: 5 попыток за 5 минут
- **API endpoints**: 100 запросов в минуту
- **Upload endpoints**: 10 загрузок за 5 минут
- **Export endpoints**: 5 экспортов за 10 минут

### 4. Security Headers (Helmet)

```env
HELMET_ENABLED=true                    # Включить Helmet (рекомендуется)
HSTS_MAX_AGE=31536000                 # 1 год
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true
```

### 5. Content Security Policy (CSP)

```env
CSP_ENABLED=true
CSP_REPORT_ONLY=false                  # true для тестирования
CSP_REPORT_URI=/api/csp-report
```

**CSP директивы:**

- `default-src`: 'self'
- `script-src`: 'self', 'unsafe-inline', 'unsafe-eval', https://cdn.jsdelivr.net
- `style-src`: 'self', 'unsafe-inline', https://fonts.googleapis.com
- `font-src`: 'self', https://fonts.gstatic.com
- `img-src`: 'self', data:, https:, blob:
- `connect-src`: 'self', https://api.deepseek.com, wss:, https:
- `frame-src`: 'none'
- `object-src`: 'none'

### 6. CSRF Protection

```env
CSRF_ENABLED=true
```

**CSRF параметры:**

- Token длина: 32 символа
- Cookie имя: \_csrf
- Header имя: X-CSRF-Token

### 7. Session Configuration

```env
SESSION_SECRET=your-session-secret      # По умолчанию использует JWT_SECRET
SESSION_MAX_AGE=86400000               # 24 часа
COOKIE_DOMAIN=.yourdomain.com          # Для поддоменов
```

**Cookie параметры:**

- В production используется префикс `__Host-` для имени сессии
- `secure`: true в production (только HTTPS)
- `httpOnly`: всегда true
- `sameSite`: 'strict' в production, 'lax' в development

## Расширенные настройки безопасности

### 1. IP Restrictions

```env
IP_RESTRICTIONS_ENABLED=true
IP_WHITELIST=192.168.1.0/24,10.0.0.0/8
IP_BLACKLIST=192.168.1.100,10.0.0.50
```

### 2. API Key Management

```env
API_KEY_ROTATION_ENABLED=true
API_KEY_ROTATION_INTERVAL=2592000000    # 30 дней
MAX_API_KEYS_PER_USER=5
API_KEY_PREFIX=est_
API_KEY_LENGTH=32
```

### 3. Brute Force Protection

```env
BRUTE_FORCE_PROTECTION_ENABLED=true
BRUTE_FORCE_FREE_RETRIES=3
BRUTE_FORCE_MIN_WAIT=5000              # 5 секунд
BRUTE_FORCE_MAX_WAIT=900000            # 15 минут
BRUTE_FORCE_LIFETIME=86400             # 24 часа
```

### 4. Two-Factor Authentication

```env
TWO_FACTOR_ENABLED=true
TWO_FACTOR_ISSUER=Estimate Service
TWO_FACTOR_WINDOW=1
TWO_FACTOR_BACKUP_CODES=10
```

### 5. Security Audit

```env
SECURITY_AUDIT_ENABLED=true
SECURITY_LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=90
```

### 6. XSS Protection

```env
XSS_PROTECTION_ENABLED=true
XSS_PROTECTION_MODE=sanitize          # или 'reject'
XSS_WHITELIST_TAGS=b,i,u,strong,em
```

### 7. Input Validation

```env
MAX_REQUEST_SIZE=10mb
MAX_URL_LENGTH=2048
MAX_PARAMETER_COUNT=1000
MAX_JSON_DEPTH=10
MAX_JSON_KEYS=1000
MAX_ARRAY_LENGTH=1000
```

### 8. File Upload Security

```env
MAX_FILE_SIZE=10485760                 # 10 MB
ALLOWED_MIME_TYPES=application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv
VIRUS_SCAN_ENABLED=true
```

### 9. Security Monitoring

```env
# Обнаружение аномалий
ANOMALY_DETECTION_ENABLED=true
ANOMALY_REQUESTS_THRESHOLD=1000        # запросов в минуту
ANOMALY_AUTH_THRESHOLD=20              # неудачных попыток в час
ANOMALY_IP_THRESHOLD=1000              # уникальных IP в час

# Алерты
SECURITY_ALERTS_ENABLED=true
ALERT_CHANNELS=email,slack
```

### 10. Password Policy

```env
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL=true
PASSWORD_HISTORY_COUNT=5
PASSWORD_EXPIRATION_DAYS=90
```

### 11. SSRF Protection

```env
SSRF_PROTECTION_ENABLED=true
SSRF_ALLOWED_HOSTS=api.trusted-service.com,cdn.trusted-service.com
```

### 12. Token Configuration

```env
# Refresh токены
REFRESH_TOKEN_LENGTH=64
REFRESH_TOKEN_REUSE=false
REFRESH_TOKEN_MAX_AGE=604800           # 7 дней

# Временные токены
TEMP_TOKEN_LENGTH=32
TEMP_TOKEN_MAX_AGE=300                 # 5 минут
```

### 13. WebSocket Security

```env
WEBSOCKET_ENABLED=true
WEBSOCKET_ORIGINS=https://estimate.yourdomain.com,https://admin.estimate.yourdomain.com
WS_MAX_MESSAGE_SIZE=65536              # 64 KB
WS_HEARTBEAT_INTERVAL=30000            # 30 секунд
```

### 14. Compliance

```env
# GDPR
GDPR_COMPLIANCE_ENABLED=true
GDPR_DATA_RETENTION=730                # 2 года

# PCI DSS
PCI_COMPLIANCE_ENABLED=true
```

## Рекомендации для Production

### 1. Обязательные настройки

- [ ] Сгенерировать криптографически стойкий `JWT_SECRET`
- [ ] Сгенерировать уникальный `MASTER_API_KEY`
- [ ] Сгенерировать `ENCRYPTION_KEY` для шифрования данных
- [ ] Настроить правильные CORS домены
- [ ] Включить все security headers
- [ ] Настроить CSP правила
- [ ] Включить CSRF защиту

### 2. Рекомендуемые настройки

- [ ] Включить rate limiting с адекватными лимитами
- [ ] Настроить session store в Redis
- [ ] Включить брутфорс защиту
- [ ] Настроить мониторинг безопасности
- [ ] Включить аудит логирование
- [ ] Настроить password policy
- [ ] Включить XSS защиту

### 3. Дополнительные меры

- [ ] Использовать HTTPS везде
- [ ] Настроить WAF (Web Application Firewall)
- [ ] Регулярно обновлять зависимости
- [ ] Проводить security аудиты
- [ ] Настроить backup стратегию
- [ ] Использовать secrets management систему

## Примеры использования в коде

### Использование базовой конфигурации

```typescript
import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from '@ez-eco/shared/config';

@Injectable()
export class SecurityService {
  private securityConfig: SecurityConfig;

  constructor(private configService: ConfigService) {
    this.securityConfig = this.configService.get<SecurityConfig>('security');
  }

  // Использование JWT настроек
  generateToken(payload: any) {
    return jwt.sign(payload, this.securityConfig.jwt.secret, {
      expiresIn: this.securityConfig.jwt.expiresIn,
      algorithm: this.securityConfig.jwt.algorithm,
    });
  }
}
```

### Использование расширенной конфигурации

```typescript
import { SecurityAdvancedConfig } from '@ez-eco/shared/config';

@Injectable()
export class AdvancedSecurityService {
  private advancedConfig: SecurityAdvancedConfig;

  constructor(private configService: ConfigService) {
    this.advancedConfig =
      this.configService.get<SecurityAdvancedConfig>('securityAdvanced');
  }

  // Проверка пароля по политике
  validatePassword(password: string): boolean {
    const policy = this.advancedConfig.passwordPolicy;

    if (password.length < policy.minLength) return false;
    if (policy.requireUppercase && !/[A-Z]/.test(password)) return false;
    if (policy.requireLowercase && !/[a-z]/.test(password)) return false;
    if (policy.requireNumbers && !/[0-9]/.test(password)) return false;
    if (policy.requireSpecialChars && !/[!@#$%^&*]/.test(password))
      return false;

    return true;
  }
}
```

## Мониторинг и отчетность

### Метрики безопасности

1. **Количество неудачных попыток входа**
2. **Количество заблокированных IP**
3. **Количество сработавших rate limit**
4. **Количество CSRF атак**
5. **Количество XSS попыток**

### Логирование

Все события безопасности логируются в следующем формате:

```json
{
  "timestamp": "2024-01-10T12:00:00.000Z",
  "level": "warn",
  "category": "security",
  "event": "failed_login_attempt",
  "userId": "123",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "details": {
    "attempts": 3,
    "reason": "invalid_password"
  }
}
```

## Контакты

При возникновении вопросов по безопасности обращайтесь:

- Email: security@estimate-service.com
- Telegram: @estimate_security
