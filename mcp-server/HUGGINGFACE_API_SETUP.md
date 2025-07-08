# 🚀 Переход на реальную DeepSeek R1 через Hugging Face API

## 📋 Обзор

Настройка перехода с эмуляции локальной модели на реальную DeepSeek R1 через платную подписку Hugging Face.

## 🔧 Настройка API

### 1. Получение доступа к Hugging Face

1. **Регистрация и подписка:**
   - Перейдите на [Hugging Face](https://huggingface.co)
   - Зарегистрируйтесь или войдите в аккаунт
   - Активируйте платную подписку (Pro или Enterprise)
   - Перейдите в [Settings > Tokens](https://huggingface.co/settings/tokens)

2. **Создание API токена:**
   ```bash
   # Создайте новый токен с правами:
   # - Read access to inference API
   # - Write access (если нужно)
   # Название: "estimate-service-deepseek-r1"
   ```

### 2. Конфигурация проекта

1. **Установка токена:**
   ```bash
   # Метод 1: Environment переменная (рекомендуется)
   export HF_TOKEN="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

   # Метод 2: В .env.api файле
   echo "HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" >> mcp-server/.env.api

   # Метод 3: В системном .bashrc/.zshrc
   echo "export HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" >> ~/.bashrc
   ```

2. **Проверка конфигурации:**
   ```bash
   cd mcp-server

   # Проверьте настройки
   cat .env.api

   # Проверьте переменные окружения
   env | grep HF_TOKEN
   ```

### 3. Переключение режимов

1. **С эмуляции на API:**
   ```bash
   # В .env.api или environment
   HUGGINGFACE_MOCK_MODE=false
   HUGGINGFACE_USE_API=true
   HUGGINGFACE_USE_LOCAL=false
   HF_TOKEN=your_actual_token
   ```

2. **Проверка переключения:**
   ```bash
   # Тест подключения к API
   npm run test:api

   # Проверка логов
   npm run dev:api
   ```

## 🧪 Тестирование интеграции

### 1. Базовые тесты

```bash
# Перейдите в директорию MCP сервера
cd mcp-server

# Установите ваш токен
export HF_TOKEN="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Запустите тесты
npm run test:api
```

### 2. Интерактивное тестирование

```bash
# Запуск в режиме разработки
npm run dev:api

# В другом терминале - тест через HTTP
curl -X POST http://localhost:3333/health

# Тест через MCP клиент
# (автоматически через VS Code или используйте test-api.mjs)
```

### 3. Ожидаемые результаты

✅ **Успешное подключение:**
```
🤗 HuggingFace API Service initialized
✅ Service initialized successfully
🔗 HuggingFace API connection test successful
✅ MCP DeepSeek API Server started successfully
🤖 Using model: deepseek-ai/DeepSeek-R1
🔗 API Mode: Enabled
```

❌ **Ошибки подключения:**
```
❌ Failed to connect to HuggingFace API: authentication
💡 Tip: Make sure your HF_TOKEN is valid
```

## 🛠️ Настройка VS Code

### 1. Обновление settings.json

```json
{
  "mcp.servers": {
    "estimate-service-deepseek-r1": {
      "command": "node",
      "args": ["mcp-server/dist-api/index-api.js"],
      "env": {
        "NODE_ENV": "production",
        "HF_TOKEN": "${env:HF_TOKEN}",
        "HUGGINGFACE_MODEL_NAME": "deepseek-ai/DeepSeek-R1",
        "HUGGINGFACE_USE_API": "true",
        "HUGGINGFACE_USE_LOCAL": "false",
        "HUGGINGFACE_MOCK_MODE": "false",
        "HUGGINGFACE_MAX_TOKENS": "2048",
        "HUGGINGFACE_TEMPERATURE": "0.7",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### 2. Создание задач VS Code

```json
{
  "label": "🤖 Start DeepSeek R1 API",
  "type": "shell",
  "command": "npm",
  "args": ["run", "start:deepseek-api"],
  "group": "build",
  "isBackground": true,
  "options": {
    "cwd": "mcp-server"
  },
  "presentation": {
    "echo": true,
    "reveal": "always",
    "focus": false,
    "panel": "new"
  }
}
```

## 🔄 Управление режимами

### 1. Переключение между режимами

```bash
# Эмуляция (для разработки без API)
export HUGGINGFACE_MOCK_MODE=true
export HUGGINGFACE_USE_API=false

# Реальная API (продакшн)
export HUGGINGFACE_MOCK_MODE=false
export HUGGINGFACE_USE_API=true
export HF_TOKEN="your_token"

# Локальная модель (если настроена)
export HUGGINGFACE_USE_LOCAL=true
export HUGGINGFACE_USE_API=false
```

### 2. Скрипты для быстрого переключения

```bash
# Создайте алиасы в ~/.bashrc
alias mcp-mock="export HUGGINGFACE_MOCK_MODE=true && npm run dev:api"
alias mcp-api="export HUGGINGFACE_MOCK_MODE=false && npm run dev:api"
alias mcp-test="npm run test:api"
```

## 📊 Мониторинг и производительность

### 1. Логирование

```bash
# Детальные логи
export LOG_LEVEL=debug
export LOG_API_REQUESTS=true

# Метрики производительности
export LOG_PERFORMANCE_METRICS=true
```

### 2. Ограничения API

```javascript
// Настройки rate limiting
const API_LIMITS = {
  requestsPerMinute: 100,
  maxTokensPerRequest: 4096,
  maxConcurrentRequests: 10,
  timeoutMs: 60000
};
```

### 3. Кеширование

```bash
# Включение кеширования ответов
export ENABLE_CACHING=true
export CACHE_TTL=3600
```

## 🚨 Устранение неполадок

### 1. Проблемы с аутентификацией

```bash
# Проверьте токен
curl -H "Authorization: Bearer $HF_TOKEN" \
     https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1

# Обновите токен
# 1. Перейдите в HF settings
# 2. Создайте новый токен
# 3. Обновите переменную
```

### 2. Проблемы с квотами

```bash
# Проверьте лимиты аккаунта
curl -H "Authorization: Bearer $HF_TOKEN" \
     https://api-inference.huggingface.co/account

# Мониторинг использования
export ENABLE_QUOTA_MONITORING=true
```

### 3. Проблемы с сетью

```bash
# Проверьте подключение
ping api-inference.huggingface.co

# Настройте таймауты
export REQUEST_TIMEOUT=60000
export CONNECTION_TIMEOUT=30000
```

## 🔮 Следующие шаги

1. **Оптимизация производительности:**
   - Настройка кеширования
   - Batch обработка запросов
   - Асинхронные вызовы

2. **Расширение функциональности:**
   - Специализированные промпты для команд
   - Интеграция с другими API
   - Автоматическое переключение режимов

3. **Мониторинг и аналитика:**
   - Дашборд использования API
   - Метрики качества ответов
   - Автоматические отчеты

---

**Автор:** AI Team
**Дата:** $(date)
**Версия:** 1.0.0
