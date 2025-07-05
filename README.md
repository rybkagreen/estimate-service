# Estimate Service - Full Stack Application

🏗️ **Современная система управления сметами с ИИ-ассистентом на базе DeepSeek R1**

[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

## 📋 Описание

Estimate Service - это полнофункциональная система для автоматизации процесса составления строительных смет с современным web-интерфейсом и мощным ИИ-ассистентом на базе DeepSeek R1. Система включает в себя React frontend в стиле Replit и NestJS backend с полной совместимостью с "Гранд Смета".

### ✨ Основные возможности

#### 🖥️ Frontend (React + Replit UI)
- 🎨 **Современный интерфейс** в стиле Replit с темной/светлой темой
- ⚡ **Быстрые операции** с optimistic updates
- 📱 **Responsive дизайн** для всех устройств
- 🔍 **Мгновенный поиск** и фильтрация
- 📊 **Интерактивные дашборды** и аналитика
- 🎭 **Плавные анимации** с Framer Motion

#### 🤖 ИИ-ассистент (DeepSeek R1)
- 💬 **Чат-интерфейс** для общения с ИИ
- 📈 **Анализ смет** и рекомендации по оптимизации
- 🔮 **Автоматические предложения** материалов и работ
- 📊 **Интеллектуальная классификация** позиций
- 🎯 **Высокая точность** расчетов и анализа

#### 🏗️ Backend (NestJS)
- � **RBAC авторизация** с JWT токенами
- 📊 **RESTful API** с полной типизацией
- 🗄️ **PostgreSQL** с Prisma ORM
- 📈 **Метрики и мониторинг** производительности
- 🏥 **Health checks** для контроля состояния

### 🎨 UI/UX особенности
- **Дизайн-система** в стиле Replit
- **Темная/светлая тема** с автоматическим переключением
- **Keyboard shortcuts** для быстрой работы
- **Drag & drop** для файлов и элементов
- **Real-time updates** через WebSocket
- **Accessibility** поддержка (WCAG 2.1)

## 🚀 Быстрый старт

### Требования

- **Node.js 18+** (рекомендуется 20+)
- **PostgreSQL 13+** для базы данных
- **Docker** и Docker Compose (опционально)
- **Git** для клонирования репозитория

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/rybkagreen/estimate-service.git
cd estimate-service

# Установка зависимостей для всего проекта
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл с вашими настройками

# Генерация Prisma клиента
npm run prisma:generate

# Миграция базы данных
npm run prisma:migrate

# Заполнение начальными данными
npm run prisma:seed
```

### 🖥️ Запуск Frontend (Development)

```bash
# Запуск React приложения
cd apps/estimate-frontend
npm run dev

# Приложение будет доступно по адресу: http://localhost:3000
```

### 🔧 Запуск Backend (Development)

```bash
# Запуск NestJS сервера
npm run start:dev

# API будет доступно по адресу: http://localhost:3022
# Swagger документация: http://localhost:3022/api
```

### 🐳 Запуск с Docker

```bash
# Запуск полного стека (frontend + backend + database)
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Просмотр логов
docker-compose logs -f
```

### 🧪 Тестирование

```bash
# Запуск всех тестов
npm run test

# Запуск тестов с покрытием
npm run test:coverage

# Запуск E2E тестов
npm run test:e2e

# Запуск линтера
npm run lint

# Автоматическое исправление линтера
npm run lint:fix

# Форматирование кода
npm run format
```

## 🛠️ Технологический стек

### 🖥️ Frontend
- **React 18** - Современная библиотека для UI
- **TypeScript** - Типизированный JavaScript
- **Vite** - Быстрый сборщик и dev-сервер
- **Tailwind CSS** - Utility-first CSS фреймворк
- **Framer Motion** - Библиотека анимаций
- **TanStack Query** - Управление server state
- **React Router** - Клиентская маршрутизация
- **React Hook Form** - Управление формами
- **Headless UI** - Доступные UI компоненты
- **Heroicons** - SVG иконки от авторов Tailwind

### 🔧 Backend
- **NestJS** - Масштабируемый Node.js фреймворк
- **TypeScript** - Полная типизация
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Реляционная база данных
- **JWT** - JSON Web Tokens для авторизации
- **Swagger** - API документация
- **Jest** - Фреймворк для тестирования

### 🤖 ИИ и обработка данных
- **DeepSeek R1** - Продвинутая языковая модель
- **Axios** - HTTP клиент для API запросов
- **Natural Language Processing** - Обработка естественного языка
- **Machine Learning** - Алгоритмы классификации

### 🚀 DevOps и инфраструктура
- **Docker** - Контейнеризация приложений
- **Docker Compose** - Оркестрация многоконтейнерных приложений
- **Nx** - Monorepo инструменты
- **ESLint** - Статический анализ кода
- **Prettier** - Форматирование кода
- **Husky** - Git hooks

## 📁 Структура проекта

```
estimate-service/
├── apps/                        # Фронтенд приложения
│   └── estimate-frontend/       # React приложение
│       ├── src/
│       │   ├── components/      # React компоненты
│       │   ├── pages/          # Страницы приложения
│       │   ├── hooks/          # Кастомные хуки
│       │   ├── contexts/       # React контексты
│       │   ├── api/            # API интеграция
│       │   └── utils/          # Утилитарные функции
│       ├── index.html          # HTML шаблон
│       ├── vite.config.ts      # Конфигурация Vite
│       └── tailwind.config.js  # Конфигурация Tailwind
├── services/estimate-service/   # Backend сервис
│   ├── src/modules/            # Модули NestJS
│   │   ├── ai-assistant/       # ИИ-ассистент (DeepSeek R1)
│   │   ├── classification/     # Классификация работ
│   │   ├── estimate/          # Управление сметами
│   │   ├── auth/              # Аутентификация и авторизация
│   │   └── users/             # Управление пользователями
│   ├── prisma/                # Схема и миграции БД
│   └── test/                  # E2E тесты
├── libs/                       # Общие библиотеки
│   └── shared-contracts/       # Общие типы и контракты
├── docs/                       # Документация
│   ├── frontend/              # Документация фронтенда
│   ├── architecture/          # Архитектурная документация
│   └── guides/                # Руководства разработчика
├── mcp-server/                # MCP сервер для интеграции
├── docker-compose.yml         # Docker конфигурация
└── nx.json                    # Конфигурация Nx workspace
```
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
| `DEEPSEEK_API_KEY` | Ключ API DeepSeek R1 | - |
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

### Frontend документация

| Документ | Описание |
|----------|----------|
| [⚛️ Frontend Development Guide](docs/frontend/FRONTEND_DEVELOPMENT_GUIDE.md) | Полное руководство по frontend |
| [🎨 Replit UI Design System](docs/frontend/REPLIT_UI_DESIGN_SYSTEM.md) | Дизайн-система в стиле Replit ⭐ |
| [🧩 UI Components Guide](docs/frontend/UI_COMPONENTS_GUIDE.md) | Каталог UI компонентов |
| [📊 State Management](docs/frontend/STATE_MANAGEMENT.md) | Управление состоянием |
| [🔗 API Integration](docs/frontend/API_INTEGRATION.md) | Интеграция с backend API |
| [🧪 Testing Strategy](docs/frontend/TESTING_STRATEGY.md) | Стратегия тестирования frontend |
| [🚀 Production Deployment](docs/frontend/PRODUCTION_DEPLOYMENT.md) | Production развертывание |
| [⚡ Advanced Features](docs/frontend/ADVANCED_FEATURES.md) | Продвинутые возможности |

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
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| **State Management** | TanStack Query, React Context, React Hook Form |
| **UI/UX** | Headless UI, Heroicons, Replit Design System |
| **Backend** | NestJS, TypeScript, Node.js |
| **База данных** | PostgreSQL, Prisma ORM |
| **ИИ** | DeepSeek R1 |
| **Тестирование** | Jest, Playwright, React Testing Library |
| **Документация** | Swagger/OpenAPI, Storybook |
| **DevOps** | Docker, Docker Compose, Nx Workspace |
| **Качество кода** | ESLint, Prettier, Husky |
| **Мониторинг** | Prometheus, Winston, Lighthouse CI |

---

**Estimate Service** - современное решение для автоматизации сметного дела в строительстве 🏗️

*Разработано с ❤️ для эффективного управления строительными проектами*
