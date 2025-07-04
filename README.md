# Estimate Service - Standalone

🏗️ **ИИ-ассистент для составления сметной документации совместимой с Гранд Смета**

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

## 📋 Описание

Estimate Service - это автономный микросервис для автоматизации процесса составления строительных смет с использованием искусственного интеллекта. Сервис обеспечивает полную совместимость с системой "Гранд Смета" и предоставляет современный RESTful API для интеграции.

### ✨ Основные возможности

- 🤖 **ИИ-ассистент** для автоматического составления смет
- 📊 **Классификация работ** и материалов
- 📝 **Шаблоны смет** для типовых проектов
- 🔍 **Валидация данных** и проверка корректности
- 📈 **Метрики и мониторинг** производительности
- 🏥 **Health checks** для контроля состояния системы

## 🚀 Быстрый старт

### Требования

- Node.js 18+
- PostgreSQL 13+
- Docker (опционально)

### Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd estimate-service

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env

# Генерация Prisma клиента
npm run prisma:generate

# Миграция базы данных
npm run prisma:migrate

# Заполнение начальными данными
npm run prisma:seed
```

### Запуск для разработки

```bash
# Запуск в режиме разработки
npm run start:dev

# Запуск тестов
npm run test

# Запуск линтера
npm run lint

# Форматирование кода
npm run format
```

### Запуск с Docker

```bash
# Запуск всех сервисов
docker-compose up -d

# Только для разработки
docker-compose -f docker-compose.dev.yml up -d
```

## 📁 Структура проекта

```
estimate-service/
├── services/estimate-service/    # Основной код сервиса
│   ├── src/modules/             # Модули приложения
│   │   ├── ai-assistant/        # ИИ-ассистент
│   │   ├── classification/      # Классификация работ
│   │   ├── estimate/           # Управление сметами
│   │   ├── grand-smeta/        # Интеграция с Гранд Смета
│   │   └── templates/          # Шаблоны смет
│   └── src/shared/             # Общие компоненты
├── libs/shared-contracts/       # Общие типы и контракты
├── prisma/                     # Схемы и миграции БД
└── docs/                       # Документация проекта
```

Подробная структура проекта: [📖 docs/development/PROJECT_STRUCTURE.md](docs/development/PROJECT_STRUCTURE.md)

## 🌐 API

Сервис запускается на порту `3022` и предоставляет:

- **Swagger UI**: http://localhost:3022/api/docs
- **Health Check**: http://localhost:3022/health
- **Metrics**: http://localhost:3022/metrics

Полная документация API: [📖 docs/api/API_REFERENCE.md](docs/api/API_REFERENCE.md)

## ⚙️ Конфигурация

Основные переменные окружения:

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт сервиса | `3022` |
| `DATABASE_URL` | Строка подключения к БД | - |
| `YANDEX_API_KEY` | Ключ API Yandex Cloud | - |
| `NODE_ENV` | Окружение | `development` |

Полная конфигурация: [📖 docs/guides/DEPLOYMENT_GUIDE.md](docs/guides/DEPLOYMENT_GUIDE.md)

## 🛠️ Разработка

### Стандарты кодирования

Проект следует строгим стандартам кодирования:

- **TypeScript** с строгой типизацией
- **ESLint** для статического анализа кода
- **Prettier** для автоматического форматирования
- **Conventional Commits** для сообщений коммитов

Подробнее: [📖 docs/development/CODING_STANDARDS.md](docs/development/CODING_STANDARDS.md)

### Настройка среды разработки

Рекомендуемые расширения VS Code автоматически предлагаются при открытии проекта.

Доступные задачи VS Code:
- `Build Service` - сборка сервиса
- `Start Development` - запуск в режиме разработки
- `Run Tests` - запуск тестов
- `Format Code` - форматирование кода
- `Lint Code` - проверка линтером

Подробнее: [📖 .vscode/tasks.md](.vscode/tasks.md)

## 🧪 Тестирование

```bash
# Запуск всех тестов
npm run test

# Тесты в режиме наблюдения
npm run test:watch

# E2E тесты
npm run test:e2e

# Покрытие кода
npm run test:cov
```

Стратегия тестирования: [📖 docs/development/TESTING_STRATEGY.md](docs/development/TESTING_STRATEGY.md)

## 📚 Документация

### Структура документации

```
docs/
├── api/                    # API документация
├── architecture/           # Архитектура системы
├── development/           # Руководства для разработчиков
├── guides/               # Практические руководства
├── standards/            # Стандарты и требования
└── user-guides/         # Руководства для пользователей
```

### Основные документы

| Документ | Описание |
|----------|----------|
| [📖 API Reference](docs/api/API_REFERENCE.md) | Полная документация API |
| [🏗️ System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md) | Архитектура системы |
| [👩‍💻 Coding Standards](docs/development/CODING_STANDARDS.md) | Стандарты кодирования |
| [🔧 Project Structure](docs/development/PROJECT_STRUCTURE.md) | Структура проекта |
| [🚀 Deployment Guide](docs/guides/DEPLOYMENT_GUIDE.md) | Руководство по развертыванию |
| [⚡ Performance Guide](docs/guides/PERFORMANCE_GUIDE.md) | Оптимизация производительности |
| [🔒 Security Guidelines](docs/standards/SECURITY_GUIDELINES.md) | Руководство по безопасности |
| [📋 Code Review Checklist](docs/standards/CODE_REVIEW_CHECKLIST.md) | Чеклист code review |

Полный индекс: [📖 docs/README.md](docs/README.md)

## 🔒 Безопасность

- Валидация всех входных данных
- Rate limiting для API endpoints
- CORS настройки
- Аудит безопасности зависимостей

Подробнее: [📖 docs/standards/SECURITY_GUIDELINES.md](docs/standards/SECURITY_GUIDELINES.md)

## 📊 Мониторинг и метрики

- Health checks на `/health`
- Метрики Prometheus на `/metrics`
- Логирование запросов и ошибок
- Performance monitoring

Подробнее: [📖 docs/guides/PERFORMANCE_GUIDE.md](docs/guides/PERFORMANCE_GUIDE.md)

## 🤝 Вклад в проект

1. Ознакомьтесь с [📖 стандартами кодирования](docs/development/CODING_STANDARDS.md)
2. Создайте issue для обсуждения изменений
3. Форкните репозиторий и создайте feature branch
4. Следуйте [📋 чеклисту code review](docs/standards/CODE_REVIEW_CHECKLIST.md)
5. Создайте Pull Request с описанием изменений

### Шаблоны

- [🐛 Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- [✨ Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)
- [🔀 Pull Request Template](.github/pull_request_template.md)

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл [LICENSE](LICENSE) для подробностей.

## 🆘 Поддержка

- 📖 [Документация](docs/)
- 🐛 [Issues](https://github.com/your-org/estimate-service/issues)
- 💬 [Discussions](https://github.com/your-org/estimate-service/discussions)

## 🏗️ Технологии

| Категория | Технологии |
|-----------|------------|
| **Backend** | NestJS, TypeScript, Node.js |
| **База данных** | PostgreSQL, Prisma ORM |
| **ИИ** | Yandex Cloud AI |
| **Тестирование** | Jest, Supertest |
| **Документация** | Swagger/OpenAPI |
| **DevOps** | Docker, Docker Compose |
| **Качество кода** | ESLint, Prettier, Husky |
| **Мониторинг** | Prometheus, Winston |

---

**Estimate Service** - современное решение для автоматизации сметного дела в строительстве 🏗️

*Разработано с ❤️ для эффективного управления строительными проектами*
