# Knowledge Base Service

Микросервис для управления системой накопления знаний в строительной отрасли.

## Описание

Knowledge Base Service предоставляет функциональность для:
- Создания и управления записями знаний
- Сбора обратной связи от пользователей
- Экспертной валидации знаний
- Тегирования и категоризации контента
- Поиска и фильтрации знаний

## Архитектура

### Основные компоненты:
- **KnowledgeEntry** - основная модель записи знаний
- **UserFeedback** - обратная связь пользователей
- **ExpertValidation** - экспертная валидация записей

### API Endpoints:

#### Управление знаниями
- `POST /api/v1/knowledge` - создание новой записи
- `GET /api/v1/knowledge` - получение списка записей с фильтрацией
- `GET /api/v1/knowledge/:id` - получение записи по ID
- `PUT /api/v1/knowledge/:id` - обновление записи
- `DELETE /api/v1/knowledge/:id` - удаление (архивирование) записи
- `PUT /api/v1/knowledge/:id/publish` - публикация записи
- `PUT /api/v1/knowledge/:id/archive` - архивирование записи

#### Обратная связь
- `POST /api/v1/knowledge/:id/feedback` - добавление обратной связи
- `GET /api/v1/knowledge/:id/feedback` - получение обратной связи

#### Экспертная валидация
- `POST /api/v1/knowledge/:id/validation` - добавление валидации
- `GET /api/v1/knowledge/:id/validations` - получение валидаций

#### Статистика
- `GET /api/v1/knowledge/tags/popular` - популярные теги
- `GET /api/v1/knowledge/categories/statistics` - статистика по категориям

## Запуск

### Локальная разработка:
```bash
# Установка зависимостей
pnpm install

# Генерация Prisma клиента
pnpm exec prisma generate

# Запуск в режиме разработки
pnpm exec nx serve knowledge-base

# Или напрямую
cd services/knowledge-base
pnpm run dev
```

### Переменные окружения:
```env
PORT=3005
DATABASE_URL=postgresql://user:password@localhost:5432/knowledge_db
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Тестирование

```bash
# Запуск тестов
pnpm exec nx test knowledge-base

# Запуск тестов с покрытием
pnpm exec nx test knowledge-base --coverage
```

## Сборка

```bash
# Сборка для продакшена
pnpm exec nx build knowledge-base --configuration=production
```

## Документация API

После запуска сервиса документация Swagger доступна по адресу:
```
http://localhost:3005/api/docs
```

## Структура проекта

```
services/knowledge-base/
├── src/
│   ├── controllers/      # HTTP контроллеры
│   ├── services/        # Бизнес-логика
│   ├── dto/            # Data Transfer Objects
│   ├── entities/       # Сущности базы данных
│   ├── app.module.ts   # Главный модуль
│   └── main.ts         # Точка входа
├── project.json        # Конфигурация Nx
├── tsconfig.json       # Конфигурация TypeScript
└── README.md          # Документация
```

## Примеры использования

### Создание записи знаний:
```bash
curl -X POST http://localhost:3005/api/v1/knowledge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Технология устройства фундамента",
    "content": "Детальное описание процесса...",
    "category": "TECHNICAL",
    "tags": ["фундамент", "бетон", "технология"]
  }'
```

### Добавление обратной связи:
```bash
curl -X POST http://localhost:3005/api/v1/knowledge/{id}/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "feedback": "Очень полезная информация",
    "rating": 5,
    "feedbackType": "general"
  }'
```

### Экспертная валидация:
```bash
curl -X POST http://localhost:3005/api/v1/knowledge/{id}/validation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "isValid": true,
    "validationScore": 95,
    "comment": "Информация корректна и актуальна",
    "accuracyScore": 98,
    "completenessScore": 92
  }'
```

## Безопасность

- Все эндпоинты требуют аутентификации (кроме публичного чтения)
- Используется JWT для аутентификации
- Валидация входных данных на всех эндпоинтах
- Экспертная валидация ограничена одной записью на эксперта

## Поддержка

При возникновении проблем создайте issue в репозитории проекта.
