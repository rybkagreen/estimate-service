# 👥 Team Development Guide

Руководство по параллельной разработке проекта Estimate Service с использованием MCP сервера.

## 🎯 Быстрый старт

### 1. Первоначальная настройка
```bash
# Клонирование проекта
git clone <repository-url>
cd estimate-service

# Настройка окружения
make setup

# Или вручную:
npm install
npm run team:sync
```

### 2. Выбор команды разработки

#### 💻 Frontend Team
```bash
make team-frontend
# Запускает: Frontend dev server + MCP server
# Доступно: http://localhost:4200
```

#### 🔧 Backend Team
```bash
make team-backend
# Запускает: Backend dev server + Database + MCP server
# Доступно: http://localhost:3333
```

#### 🏗️ Infrastructure Team
```bash
make team-infrastructure
# Запускает: Полную инфраструктуру в Docker
# Мониторинг: http://localhost:3000
```

#### 🤖 AI/MCP Team
```bash
make team-ai
# Запускает: MCP server + тесты
# Доступно: http://localhost:9460
```

## 🛠️ Основные команды

### Разработка
```bash
# Запуск всех сервисов
make dev-all
npm run dev:all

# Отдельные сервисы
make dev-frontend    # Frontend разработка
make dev-backend     # Backend разработка
make dev-mcp         # MCP сервер

# Docker окружение
make dev-docker      # Полная инфраструктура
```

### Тестирование
```bash
# Все тесты
make test-all
npm run test:all

# По командам
make test-frontend   # Frontend тесты
make test-backend    # Backend тесты
make test-mcp        # MCP тесты
make test-e2e        # End-to-end тесты
```

### Сборка
```bash
# Сборка всех проектов
make build-all
npm run build:all

# MCP сервер
make build-mcp
npm run mcp:build
```

## 🏗️ Архитектура команд

```
📁 estimate-service/
├── 💻 apps/estimate-frontend/     # Frontend Team
├── 🔧 services/                   # Backend Team
│   ├── estimate-service/
│   ├── analytics-service/
│   └── data-collector/
├── 🤖 mcp-server/                 # AI/MCP Team
├── 🏗️ infrastructure/             # Infrastructure Team
│   ├── docker/
│   ├── k8s/
│   └── monitoring/
└── 📚 libs/shared-contracts/      # Shared Code
```

## 🎯 Роли команд

### 💻 Frontend Team
- **Технологии**: React, TypeScript, Tailwind CSS, Vite
- **Ответственность**: UI/UX, компоненты, клиентская логика
- **MCP инструменты**: Генерация компонентов, UI тесты
- **Порты**: 4200 (dev), 9460 (MCP)

### 🔧 Backend Team
- **Технологии**: NestJS, Prisma, PostgreSQL, Redis
- **Ответственность**: API, бизнес-логика, база данных
- **MCP инструменты**: Архитектурные решения, API тесты
- **Порты**: 3333 (API), 5432 (DB), 6379 (Redis)

### 🏗️ Infrastructure Team
- **Технологии**: Docker, Kubernetes, Prometheus, Grafana
- **Ответственность**: DevOps, мониторинг, деплой
- **MCP инструменты**: Анализ конфигураций, оптимизация
- **Порты**: 3000 (Grafana), 9090 (Prometheus)

### 🤖 AI/MCP Team
- **Технологии**: DeepSeek R1, Hugging Face, MCP Protocol
- **Ответственность**: AI модели, MCP сервер, автоматизация
- **MCP инструменты**: Все доступные инструменты
- **Порты**: 9460 (MCP HTTP), stdio (MCP)

## 🔧 VS Code настройка

### Обязательные расширения
- Nx Console - управление workspace
- ESLint + Prettier - качество кода
- Docker - контейнеры
- GitLens - Git интеграция

### Настройки MCP
Файл `.vscode/settings.json` уже настроен для:
- Подключения к MCP серверу
- Распределенного выполнения задач
- Автоформатирования кода

### Задачи VS Code
- `🤖 Start MCP Server (Team)` - MCP для команды
- `💻 Frontend Team Development` - Frontend окружение
- `🔧 Backend Team Development` - Backend окружение
- `🧪 MCP Team Tests` - Тесты MCP

## 📊 Мониторинг разработки

### Nx Cloud Dashboard
- Distributed execution
- Build analytics
- Performance metrics
- Доступ: https://cloud.nx.app

### Local Monitoring
```bash
# Статус сервисов
make status

# Логи
docker-compose -f docker-compose.teams.yml logs -f

# Метрики
open http://localhost:3000  # Grafana
```

## 🚀 Workflow команды

### 1. Ежедневная работа
```bash
# Утром
git pull origin main
make team-sync

# Выбор команды
make team-frontend  # или team-backend, etc.

# Разработка с MCP помощью
# Frontend: генерация компонентов
# Backend: архитектурные решения
# Infrastructure: оптимизация конфигураций
# AI: развитие MCP инструментов
```

### 2. Feature development
```bash
# Создание ветки
git checkout -b feature/team-{name}/{feature}

# Разработка с MCP
# Использование соответствующих MCP инструментов

# Тестирование
make test-all

# Commit
git add .
git commit -m "feat: description"
git push origin feature/team-{name}/{feature}
```

### 3. Integration
```bash
# Pull Request review
# Integration testing
make test-e2e

# Deploy to staging
make deploy-staging
```

## 🐛 Решение проблем

### Порты заняты
```bash
# Проверка портов
lsof -i :4200 -i :3333 -i :9460

# Остановка сервисов
make stop

# Очистка
make clean
```

### MCP сервер не работает
```bash
# Пересборка MCP
make build-mcp

# Проверка
curl http://localhost:9460/health

# Тесты
make test-mcp
```

### База данных
```bash
# Сброс базы
make db-reset

# Новая настройка
make db-setup

# Prisma Studio
make db-studio
```

### Зависимости
```bash
# Синхронизация
make team-sync

# Полная переустановка
rm -rf node_modules
npm install
```

## 📚 Ресурсы

- [MCP Documentation](./mcp-server/LOCAL_DEEPSEEK_SETUP.md)
- [Frontend Guide](./docs/frontend/FRONTEND_DEVELOPMENT_GUIDE.md)
- [Backend Guide](./docs/api/API_REFERENCE.md)
- [Infrastructure Guide](./docs/guides/DEPLOYMENT_GUIDE.md)

## 🎯 Следующие шаги

1. **Выберите свою команду** - Frontend, Backend, Infrastructure или AI/MCP
2. **Запустите окружение** - `make team-{название}`
3. **Изучите MCP инструменты** - специфичные для вашей команды
4. **Начните разработку** - используйте MCP для повышения продуктивности

---

**Удачной разработки! 🚀**

Если возникают вопросы, обращайтесь к команде AI/MCP или создавайте issues в репозитории.

## 🤖 AI/MCP Team - DeepSeek R1 Integration

### Настройка реальной AI модели

1. **Hugging Face API (рекомендуется):**
   ```bash
   # Получите API ключ на https://huggingface.co/settings/tokens
   export HF_TOKEN="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

   # Запустите с API
   npm run dev:deepseek-api
   ```

2. **Локальная эмуляция (для разработки):**
   ```bash
   # Режим эмуляции
   npm run dev:simple
   ```

### AI инструменты для команд

#### Frontend команда
- `generate_react_component` - Генерация React компонентов
- `analyze_ui_performance` - Анализ производительности UI
- `create_ui_tests` - Создание UI тестов

#### Backend команда
- `generate_nestjs_module` - Генерация NestJS модулей
- `analyze_api_endpoints` - Анализ API endpoints
- `optimize_database_queries` - Оптимизация запросов БД

#### Infrastructure команда
- `analyze_docker_config` - Анализ Docker конфигурации
- `generate_ci_pipeline` - Генерация CI/CD pipeline
- `security_audit` - Аудит безопасности

### Переключение режимов AI

```bash
# Эмуляция (без API ключа)
export HUGGINGFACE_MOCK_MODE=true

# Реальная API (требует HF_TOKEN)
export HUGGINGFACE_MOCK_MODE=false
export HF_TOKEN="your_token"

# Проверка статуса
npm run test:api
```
