# Estimate Service - Standalone

ИИ-ассистент для составления сметной документации совместимой с Гранд Смета.

## Описание

Этот сервис был извлечен из монорепозитория AI Construction Ecosystem и подготовлен для автономной работы.

## Установка

```bash
# Установка зависимостей
npm install

# Генерация Prisma клиента
npm run prisma:generate

# Миграция базы данных
npm run prisma:migrate
```

## Запуск

```bash
# Разработка
npm run start:dev

# Продакшн
npm run build
npm start
```

## Структура

- `services/estimate-service/` - основной код сервиса
- `libs/shared-contracts/` - общие типы и контракты
- `prisma/` - схемы базы данных

## API

Сервис запускается на порту 3022 и предоставляет:
- Swagger документацию: http://localhost:3022/api/docs
- Health check: http://localhost:3022/health

## Конфигурация

Основные переменные окружения:
- `PORT` - порт сервиса (по умолчанию 3022)
- `DATABASE_URL` - строка подключения к БД
- `YANDEX_API_KEY` - ключ API Yandex Cloud для ИИ

## Технологии

- NestJS
- Prisma ORM
- PostgreSQL
- TypeScript
- Jest
- Swagger/OpenAPI
