# 🚀 Параллельная разработка с MCP сервером и DeepSeek R1

## � Обзор

Настроена полная инфраструктура для параллельной командной разработки проекта Estimate Service с использованием MCP сервера и локальной модели DeepSeek R1.

## � Команды разработки

### 1. 🎨 Frontend команда
- **Сфера:** React/Vite приложение в `apps/estimate-frontend`
- **Порт:** 4200
- **MCP инструменты:** UI компоненты, дизайн-система, API интеграция

### 2. 🔧 Backend команда
- **Сфера:** NestJS сервис в `services/estimate-service`
- **Порт:** 3022
- **MCP инструменты:** API разработка, архитектура, база данных

### 3. 🏗️ Infrastructure команда
- **Сфера:** Docker, CI/CD, развертывание
- **MCP инструменты:** Контейнеризация, мониторинг, DevOps

### 4. 🤖 AI/MCP команда
- **Сфера:** MCP сервер, ИИ интеграция
- **Порт:** 9460 (HTTP), STDIO для MCP
- **MCP инструменты:** ИИ-ассистенты, анализ кода, генерация

## 🔧 Настройка рабочих сред

### 1. Shared MCP сервер
```bash
# Центральный MCP сервер для всех команд
cd mcp-server
npm run start:shared
```

### 2. Development режимы
```bash
# Frontend разработка
npm run dev:frontend

# Backend разработка
npm run dev:backend

# Full stack разработка
npm run dev:fullstack

# MCP development
npm run dev:mcp
```

## 📋 Настройка VS Code для команды

### 1. Workspace конфигурация (.vscode/settings.json)
```json
{
  "mcp.servers": {
    "estimate-service": {
      "command": "node",
      "args": ["mcp-server/dist-simple/index-local-simple.js"],
      "env": {
        "NODE_ENV": "development",
        "TEAM_MODE": "true"
      }
    }
  },
  "nx.preferences": {
    "useInferencePlugins": true,
    "enableTaskDistribution": true
  }
}
```

### 2. Extensions для команды
```json
{
  "recommendations": [
    "ms-vscode.vscode-json",
    "nrwl.angular-console",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

## 🎯 MCP инструменты по командам

### Frontend команда
- `generate_react_component` - Генерация React компонентов
- `create_ui_tests` - Создание UI тестов
- `analyze_bundle_size` - Анализ размера bundle
- `optimize_performance` - Оптимизация производительности

### Backend команда
- `generate_nestjs_module` - Генерация NestJS модулей
- `create_api_tests` - Создание API тестов
- `analyze_database_schema` - Анализ схемы БД
- `optimize_queries` - Оптимизация запросов

### Infrastructure команда
- `analyze_docker_config` - Анализ Docker конфигурации
- `optimize_ci_pipeline` - Оптимизация CI/CD
- `security_audit` - Аудит безопасности
- `monitor_performance` - Мониторинг производительности

## 🔄 Workflow параллельной разработки

### 1. Ежедневный workflow
```bash
# Утром - синхронизация
git pull origin main
npm run sync:deps

# Запуск среды разработки
npm run dev:team

# MCP сервер для команды
npm run mcp:team
```

### 2. Feature development
```bash
# Создание feature branch
git checkout -b feature/team-{team-name}/{feature-name}

# Разработка с MCP помощью
# Frontend: использование MCP для компонентов
# Backend: использование MCP для архитектуры
# Infrastructure: использование MCP для конфигураций

# Commit с MCP assistance
npm run commit:with-mcp
```

### 3. Integration testing
```bash
# Тестирование интеграции
npm run test:integration

# E2E тестирование с MCP
npm run test:e2e:mcp

# Performance testing
npm run test:performance
```

## 📊 Мониторинг команд

### 1. Nx Cloud Dashboard
- Distributed task execution
- Build analytics
- Performance monitoring

### 2. MCP Analytics
```typescript
// Трекинг использования MCP по командам
interface MCPUsageAnalytics {
  team: 'frontend' | 'backend' | 'infrastructure' | 'ai';
  tools_used: string[];
  productivity_metrics: {
    code_generated: number;
    tests_created: number;
    issues_resolved: number;
  };
  timestamp: Date;
}
```

## 🚀 Команды для параллельной разработки

### Общие команды
```bash
# Запуск всех сервисов для разработки
npm run dev:all

# Сборка всех проектов
npm run build:all

# Тестирование всех проектов
npm run test:all

# Линтинг всех проектов
npm run lint:all
```

### По командам
```bash
# Frontend команда
npm run dev:frontend
npm run test:frontend
npm run build:frontend

# Backend команда
npm run dev:backend
npm run test:backend
npm run build:backend

# MCP команда
npm run dev:mcp
npm run test:mcp
npm run build:mcp
```

## 🔒 Безопасность и доступы

### 1. Environment переменные по командам
```env
# Frontend команда
REACT_APP_API_URL=http://localhost:3333
REACT_APP_MCP_ENDPOINT=http://localhost:9460

# Backend команда
DATABASE_URL=postgresql://localhost:5432/estimate_dev
REDIS_URL=redis://localhost:6379

# Infrastructure команда
DOCKER_REGISTRY=localhost:5000
K8S_NAMESPACE=estimate-dev

# AI команда
HUGGINGFACE_MODEL_PATH=./models/shared
DEEPSEEK_SHARED_MODE=true
```

### 2. Права доступа
- **Frontend**: Только frontend код и shared libs
- **Backend**: Только backend сервисы и shared libs
- **Infrastructure**: Полный доступ к конфигурациям
- **AI**: Только MCP сервер и AI модели

## 📈 Метрики продуктивности

### 1. Nx задачи
```json
{
  "build": "maxParallel: 12",
  "test": "maxParallel: 8",
  "lint": "maxParallel: 6",
  "e2e": "maxParallel: 2"
}
```

### 2. MCP метрики
- Количество сгенерированного кода
- Время на решение задач
- Качество кода (ESLint, тесты)
- Покрытие тестами

## 🎯 Следующие шаги

1. **Настройка команд** - Распределение ролей и ответственности
2. **MCP инструменты** - Создание специализированных инструментов для каждой команды
3. **CI/CD pipeline** - Настройка параллельной сборки и тестирования
4. **Мониторинг** - Дашборды для отслеживания прогресса
5. **Документация** - Детальные гайды для каждой команды

---

**Автор**: AI Assistant
**Дата**: $(date)
**Версия**: 1.0.0

## ⚡ DeepSeek R1 через Hugging Face API

### Настройка платной подписки

1. **Получение API ключа:**
   ```bash
   # Зайдите на https://huggingface.co/settings/tokens
   # Создайте новый токен с правами Inference API
   # Скопируйте токен
   ```

2. **Настройка окружения:**
   ```bash
   # Скопируйте конфигурацию для API
   cp mcp-server/.env.api mcp-server/.env.production

   # Установите ваш токен
   export HF_TOKEN="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

   # Или в .env.api файле
   echo "HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" > mcp-server/.env.api
   ```

3. **Запуск с API:**
   ```bash
   # Разработка с API
   npm run dev:deepseek-api

   # Продакшн запуск
   npm run start:deepseek-api

   # Тестирование API
   npm run test:api
   ```

### Команды для работы с API

```bash
# Сборка API сервера
npm run build:api

# Запуск в режиме разработки
cd mcp-server
npm run dev:api

# Тестирование подключения
npm run test:api

# Проверка здоровья API
curl -X POST http://localhost:3333/health
```

### Конфигурация VS Code для API

```json
{
  "mcp.servers": {
    "estimate-service-api": {
      "command": "node",
      "args": ["mcp-server/dist-api/index-api.js"],
      "env": {
        "HF_TOKEN": "${env:HF_TOKEN}",
        "HUGGINGFACE_MODEL_NAME": "deepseek-ai/DeepSeek-R1",
        "HUGGINGFACE_USE_API": "true",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```
