# Безопасность проекта Estimate Service

## Обзор

Этот документ описывает меры безопасности, реализованные в проекте Estimate
Service, и инструкции по их использованию.

## Криптографические ключи

Проект использует три основных криптографических ключа:

1. **JWT_SECRET** - для подписи и верификации JWT токенов
2. **MASTER_API_KEY** - для административных API операций
3. **ENCRYPTION_KEY** - для шифрования чувствительных данных

### Управление ключами

Для управления ключами используйте скрипт `scripts/manage-secrets.sh`:

```bash
# Проверить текущие ключи
./scripts/manage-secrets.sh check

# Сгенерировать новые ключи
./scripts/manage-secrets.sh generate-all

# Ротация ключей
./scripts/manage-secrets.sh rotate

# Экспорт для production
./scripts/manage-secrets.sh export
```

## Конфигурация безопасности

### Development среда

Ключи хранятся в файле `.env`:

- Файл должен быть в `.gitignore`
- Не коммитьте реальные ключи
- Используйте `.env.example` как шаблон

### Production среда

Рекомендации для production:

1. Используйте переменные окружения
2. Храните ключи в секретном менеджере (AWS Secrets Manager, HashiCorp Vault)
3. Настройте ротацию ключей
4. Используйте разные ключи для разных окружений

## Использование в коде

### JWT аутентификация

```typescript
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateToken(userId: string) {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('security.jwt.secret'),
      expiresIn: this.configService.get('security.jwt.expiresIn'),
    });
  }
}
```

### Шифрование данных

```typescript
import { EncryptionUtil } from '@ez-eco/shared/utils';

@Injectable()
export class SecureDataService {
  constructor(private encryption: EncryptionUtil) {}

  async saveSecureData(data: any) {
    const encrypted = this.encryption.encryptObject(data);
    // Сохранить encrypted в базу данных
  }

  async getSecureData(id: string) {
    // Получить encrypted из базы данных
    const decrypted = this.encryption.decryptObject(encrypted);
    return decrypted;
  }
}
```

### Проверка Master API Key

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard {
  constructor(private configService: ConfigService) {}

  validateApiKey(providedKey: string): boolean {
    const masterKey = this.configService.get('security.masterApiKey');
    return crypto.timingSafeEqual(
      Buffer.from(providedKey),
      Buffer.from(masterKey),
    );
  }
}
```

## Безопасность API

### Rate Limiting

Настроен лимит запросов для защиты от DDoS:

- 100 запросов в минуту по умолчанию
- Настраивается через `RATE_LIMIT_MAX` и `RATE_LIMIT_TTL`

### CORS

Настроен CORS для разрешенных доменов:

- Development: `http://localhost:3000`
- Production: настройте через `CORS_ORIGIN`

### Security Headers

В production включаются дополнительные заголовки безопасности:

- HSTS (HTTP Strict Transport Security)
- CSP (Content Security Policy)
- X-Frame-Options
- X-Content-Type-Options

## Чек-лист безопасности

### Перед деплоем

- [ ] Сгенерированы уникальные криптографические ключи
- [ ] Ключи сохранены в секретном менеджере
- [ ] Настроена ротация ключей
- [ ] Включены security headers (`HELMET_ENABLED=true`)
- [ ] Настроен HTTPS
- [ ] Обновлены CORS origins для production
- [ ] Отключена документация API (`SWAGGER_ENABLED=false`)
- [ ] Настроен мониторинг безопасности

### Регулярные проверки

- [ ] Аудит зависимостей (`npm audit`)
- [ ] Обновление зависимостей
- [ ] Проверка логов на подозрительную активность
- [ ] Тестирование восстановления после инцидентов
- [ ] Обновление документации по безопасности

## Инциденты безопасности

При обнаружении инцидента:

1. **Немедленные действия**:
   - Заблокировать скомпрометированные ключи
   - Сгенерировать новые ключи
   - Обновить все сервисы
   - Отозвать активные сессии

2. **Расследование**:
   - Проанализировать логи
   - Определить масштаб инцидента
   - Выявить уязвимость

3. **Восстановление**:
   - Применить патчи безопасности
   - Обновить процедуры
   - Провести повторный аудит

4. **Документирование**:
   - Создать отчет об инциденте
   - Обновить документацию
   - Провести разбор с командой

## Контакты

По вопросам безопасности:

- Email: security@yourdomain.com
- Для критических уязвимостей используйте PGP шифрование

## Дополнительные ресурсы

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NestJS Security](https://docs.nestjs.com/security/overview)
