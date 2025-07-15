# Production Environment Configuration Guide

## Важные инструкции по безопасности

Этот документ содержит инструкции по настройке файла `.env.production` для
развертывания в production окружении.

## Переменные, требующие замены

### 1. Секреты и ключи (ОБЯЗАТЕЛЬНО заменить!)

#### JWT_SECRET_PROD

```bash
# Генерация криптографически стойкого ключа
openssl rand -base64 64
```

Минимальная длина: 64 символа

#### MASTER_API_KEY_PROD

```bash
# Генерация API ключа
openssl rand -hex 32
```

#### DB_PASSWORD

- Используйте сложный пароль минимум 20 символов
- Включите буквы разного регистра, цифры и спецсимволы
- Избегайте словарных слов

#### REDIS_PASSWORD

- Аналогичные требования как для DB_PASSWORD

#### DEEPSEEK_API_KEY_PROD

- Получите на https://platform.deepseek.com/
- Храните в безопасном месте

#### GRAND_SMETA_API_KEY_PROD

- Получите у поставщика сервиса Гранд Смета

### 2. Инфраструктурные настройки

#### Домены

Замените в `CORS_ORIGIN`:

- `https://estimate.yourdomain.com` → Ваш реальный домен
- `https://admin.estimate.yourdomain.com` → Ваш админ домен

#### База данных

В `DATABASE_URL` замените:

- `production-db-host` → Адрес вашего PostgreSQL сервера
- `estimate_production` → Имя production базы данных

#### Redis

В `REDIS_URL` замените:

- `production-redis` → Адрес вашего Redis сервера

### 3. Мониторинг

#### Sentry

- Зарегистрируйтесь на https://sentry.io
- Создайте проект
- Получите DSN и установите в `SENTRY_DSN_PROD`

### 4. Резервное копирование (если используете S3)

- `BACKUP_S3_BUCKET` → Имя вашего S3 bucket
- `BACKUP_S3_REGION` → Регион AWS (например, eu-west-1)

## Проверочный чеклист перед деплоем

- [ ] Все переменные с `${...}` заменены на реальные значения
- [ ] JWT_SECRET сгенерирован криптографически стойким методом
- [ ] Пароли соответствуют требованиям безопасности
- [ ] Домены в CORS_ORIGIN соответствуют вашим реальным доменам
- [ ] Подключение к БД использует SSL (sslmode=require)
- [ ] Redis настроен с паролем и TLS
- [ ] Sentry DSN настроен для мониторинга ошибок
- [ ] Резервное копирование настроено
- [ ] API документация отключена (SWAGGER_ENABLED=false)
- [ ] Логи настроены на уровень info или выше

## Безопасное хранение секретов

### Вариант 1: Системные переменные окружения

```bash
export JWT_SECRET_PROD="your-generated-secret"
export DB_PASSWORD="your-secure-password"
# и т.д.
```

### Вариант 2: Использование secrets manager

- AWS Secrets Manager
- HashiCorp Vault
- Kubernetes Secrets

### Вариант 3: CI/CD переменные

- GitHub Secrets
- GitLab CI Variables
- Jenkins Credentials

## Дополнительные рекомендации

1. **Никогда не коммитьте** файл с реальными секретами
2. **Используйте разные секреты** для разных окружений
3. **Регулярно обновляйте** секреты (каждые 90 дней)
4. **Мониторьте** использование API ключей
5. **Настройте алерты** на подозрительную активность

## Команды для проверки конфигурации

```bash
# Проверка синтаксиса файла
npm run config:validate

# Проверка подключения к БД
npm run db:test-connection

# Проверка Redis
npm run redis:ping

# Полная проверка здоровья сервиса
npm run health:check
```

## Контакты для экстренных ситуаций

- DevOps команда: devops@yourdomain.com
- Security team: security@yourdomain.com
- Дежурный инженер: +7 (XXX) XXX-XX-XX

---

**Последнее обновление**: Январь 2025
