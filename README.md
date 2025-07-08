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
#### 🤖 ИИ-ассистент (DeepSeek R1)
- 💬 **Чат-интерфейс** для общения с ИИ
- 📈 **Анализ смет** и рекомендации по оптимизации
- 🔮 **Автоматические предложения** материалов и работ
- 📊 **Интеллектуальная классификация** позиций
- 🎯 **Высокая точность** расчетов и анализа

#### 📊 Система сбора данных ФСБЦ-2022 ⭐ НОВИНКА
- 🏗️ **Автоматизированный сбор** данных из официальных источников (Минстрой РФ, ФЕР, ТЕР, ГЭСН)
- ⚡ **ETL Pipeline** с автоматической обработкой и трансформацией данных
- 📅 **Планировщик задач** с автоматическим обновлением по расписанию
- 🔄 **Мультиисточниковая интеграция** с различными форматами данных
- 📁 **Система парсинга файлов** (Excel, PDF, XML, JSON)
- 🛡️ **Валидация и очистка данных** с обработкой ошибок
- 🌍 **Региональные коэффициенты** и локальные особенности
- 💰 **Интеграция рыночных цен** и нормативных документов
- 🔧 **REST API управления** сбором и мониторингом данных

#### 🏗️ Backend (NestJS)
- ⚡ **RBAC авторизация** с JWT токенами
- 📊 **RESTful API** с полной типизацией
- 🗄️ **PostgreSQL** с Prisma ORM
- 📈 **Метрики и мониторинг** производительности
- 🏥 **Health checks** для контроля состояния
- 🤖 **Data Collector Service** - автоматизированный сбор данных ФСБЦ-2022

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

### 🤖 Запуск системы сбора данных ФСБЦ-2022 ⭐ НОВИНКА

```bash
# Переход в директорию data-collector
cd services/data-collector

# Запуск сервиса сбора данных
npm run start:dev

# API endpoints для управления сбором данных:
# POST   /api/automation/collect       - Запуск сбора данных
# GET    /api/automation/status        - Статус системы
# POST   /api/automation/schedule      - Настройка расписания
# GET    /api/automation/logs          - Просмотр логов

# Автоматические задачи (Cron):
# - Ежедневный сбор обновлений: 0 2 * * *
# - Еженедельная полная синхронизация: 0 3 * * 0
# - Ежемесячная очистка старых данных: 0 4 1 * *
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

### � Система сбора данных ФСБЦ-2022 ⭐ НОВИНКА

- **MinstroyRF Parser** - Парсер официальных данных Минстроя РФ
- **ETL Pipeline** - Автоматизированная обработка и трансформация данных
- **Scheduler Service** - Планировщик задач с @Cron декораторами
- **File Processing** - Обработка Excel, PDF, XML, JSON файлов
- **Multi-source Integration** - ФЕР, ТЕР, ГЭСН источники данных
- **Data Validation** - Валидация и очистка данных
- **Regional Coefficients** - Поддержка региональных особенностей
- **Market Prices API** - Интеграция с рыночными ценами

### �🚀 DevOps и инфраструктура

- **Docker** - Контейнеризация приложений
- **Docker Compose** - Оркестрация многоконтейнерных приложений
- **Nx** - Monorepo инструменты
- **ESLint** - Статический анализ кода
- **Prettier** - Форматирование кода
- **Husky** - Git hooks

## 📁 Структура проекта

```bash
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
├── services/                   # Backend сервисы
│   ├── estimate-service/       # Основной backend сервис
│   │   ├── src/modules/        # Модули NestJS
│   │   │   ├── ai-assistant/   # ИИ-ассистент (DeepSeek R1)
│   │   │   ├── classification/ # Классификация работ
│   │   │   ├── estimate/       # Управление сметами
│   │   │   ├── auth/           # Аутентификация и авторизация
│   │   │   └── users/          # Управление пользователями
│   │   ├── prisma/             # Схема и миграции БД
│   │   └── test/               # E2E тесты
│   └── data-collector/ ⭐ NEW  # Система сбора данных ФСБЦ-2022
│       ├── src/
│       │   ├── sources/        # Источники данных
│       │   │   ├── minstroyrf-parser.service.ts      # Парсер Минстроя РФ
│       │   │   ├── fsbts-collector.service.ts        # Сборщик ФСБЦ-2022
│       │   │   ├── etl-pipeline.service.ts           # ETL pipeline
│       │   │   ├── regional-data.service.ts          # Региональные данные
│       │   │   ├── normatives-parser.service.ts      # Нормативы
│       │   │   ├── market-prices.service.ts          # Рыночные цены
│       │   │   └── sources.module.ts                 # Модуль источников
│       │   ├── services/       # Основные сервисы
│       │   │   ├── automation.service.ts             # Автоматизация
│       │   │   ├── scheduled-collector.service.ts    # Планировщик
│       │   │   ├── file-download.service.ts          # Скачивание файлов
│       │   │   └── file-parser.service.ts            # Парсинг файлов
│       │   ├── automation/     # API контроллеры
│       │   │   ├── automation.controller.ts          # REST API
│       │   │   └── automation.module.ts              # Модуль автоматизации
│       │   └── types/
│       │       └── common.types.ts                   # Общие типы
│       ├── AUTOMATION_COMPLETION_REPORT.md           # Отчет о реализации
│       └── README.md                                 # Документация сервиса
├── libs/                       # Общие библиотеки
│   └── shared-contracts/       # Общие типы и контракты
├── docs/                       # Документация
│   ├── frontend/               # Документация фронтенда
│   ├── architecture/           # Архитектурная документация
│   ├── ESTIMATE_SYSTEM_ROADMAP.txt  # Главный ROADMAP проекта
│   └── guides/                 # Руководства разработчика
├── mcp-server/                 # MCP сервер для интеграции
├── docker-compose.yml          # Docker конфигурация
└── nx.json                     # Конфигурация Nx workspace
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

## ⭐ Новые возможности - Система сбора данных ФСБЦ-2022

### 🚀 Автоматизированная система сбора данных

Реализована полноценная система автоматизированного сбора, обработки и интеграции данных ФСБЦ-2022 из официальных источников:

#### 📋 Основные компоненты

- **MinstroyRF Parser** - Парсер официальных данных Минстроя РФ
- **FSBTS Collector** - Основной сборщик данных ФСБЦ-2022
- **ETL Pipeline** - Автоматизированная обработка и трансформация данных
- **Regional Data Service** - Обработка региональных коэффициентов
- **Normatives Parser** - Парсер нормативных документов
- **Market Prices Service** - Интеграция с рыночными ценами

#### 🔧 REST API для управления

```bash
# Запуск сбора данных
POST /api/automation/collect

# Статус системы
GET /api/automation/status

# Настройка расписания
POST /api/automation/schedule

# Просмотр логов
GET /api/automation/logs
```

#### ⏰ Автоматические задачи

- **Ежедневное обновление**: `0 2 * * *` (02:00 каждый день)
- **Еженедельная синхронизация**: `0 3 * * 0` (03:00 каждое воскресенье)
- **Ежемесячная очистка**: `0 4 1 * *` (04:00 1-го числа каждого месяца)

#### 📁 Поддерживаемые форматы

- Excel файлы (XLS, XLSX)
- PDF документы
- XML данные
- JSON API responses

#### 🌍 Источники данных

- **Минстрой РФ** - Официальный сайт и API
- **ФЕР** - Федеральные единичные расценки
- **ТЕР** - Территориальные единичные расценки
- **ГЭСН** - Государственные элементные сметные нормы

### 📊 Статистика реализации

```text
✅ 21 файл создан/изменен
✅ 13,279+ строк кода
✅ 12 сервисов реализовано
✅ 5 REST API endpoints
✅ 3 автоматические Cron задачи
✅ 4 типа парсеров файлов
✅ 100% покрытие TypeScript типами
```

### 📖 Документация системы сбора данных

- [📋 Полный отчет о реализации](services/data-collector/AUTOMATION_COMPLETION_REPORT.md)
- [🔧 Руководство по настройке](services/data-collector/README.md)
- [🗺️ Обновленный ROADMAP](docs/ESTIMATE_SYSTEM_ROADMAP.txt)

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
