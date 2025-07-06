# Локальная модель DeepSeek R1 для MCP сервера

## 🎯 Обзор

Настроен MCP сервер с поддержкой локальной модели DeepSeek R1. В данный момент работает в режиме эмуляции, который можно заменить на реальную локальную модель.

## ✅ Текущее состояние

### Что работает:
- ✅ MCP сервер с локальной моделью DeepSeek R1 (режим эмуляции)
- ✅ HTTP сервер на порту 9460 для тестирования
- ✅ Инструменты для чата и проверки статуса
- ✅ Автоматические тесты функциональности

### Доступные инструменты:
1. **local_deepseek_chat** - Общение с локальной моделью
2. **local_deepseek_health_check** - Проверка статуса модели

## 🚀 Запуск

### 1. MCP сервер (STDIO)
```bash
cd /workspaces/estimate-service/mcp-server
node dist-simple/index-local-simple.js
```

### 2. HTTP сервер (для тестирования)
```bash
cd /workspaces/estimate-service/mcp-server
node dist-simple/index-http.js
```
Откройте: http://localhost:9460

### 3. Тестирование
```bash
cd /workspaces/estimate-service/mcp-server
node test-local.mjs
```

## 🔧 Конфигурация

### Переменные среды (.env.local):
```env
HUGGINGFACE_MODEL_NAME=deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
HUGGINGFACE_MODEL_PATH=./models/deepseek-r1
HUGGINGFACE_MAX_TOKENS=512
HUGGINGFACE_TEMPERATURE=0.7
HUGGINGFACE_MOCK_MODE=true
HUGGINGFACE_USE_LOCAL=true
```

### MCP Client Config:
```json
{
  "mcpServers": {
    "estimate-service-local-deepseek": {
      "command": "node",
      "args": ["/workspaces/estimate-service/mcp-server/dist-simple/index-local-simple.js"],
      "env": {
        "HUGGINGFACE_MOCK_MODE": "true",
        "HUGGINGFACE_USE_LOCAL": "true"
      }
    }
  }
}
```

## 📁 Структура файлов

```
mcp-server/
├── src/
│   ├── index-local-simple.ts     # Простая локальная версия
│   ├── index-http.ts             # HTTP версия для тестирования
│   └── services/
│       └── huggingface-local.service.ts  # Сервис для Hugging Face
├── dist-simple/                 # Скомпилированные файлы
├── .env.local                    # Локальные переменные среды
├── mcp-client-config-local.json  # Конфигурация MCP клиента
└── test-local.mjs               # Тесты
```

## 🤖 Возможности эмулятора

Текущий эмулятор DeepSeek R1 поддерживает:

### Анализ кода:
- Запрос: *"Сделай анализ кода"*
- Ответ: Рекомендации по улучшению кода

### Генерация тестов:
- Запрос: *"Создай тесты"*
- Ответ: Примеры unit-тестов

### Общие запросы:
- Любые другие вопросы по разработке
- Контекстные ответы

## 🔄 Переход на реальную модель

Для использования реальной модели DeepSeek R1:

1. **Установите дополнительные зависимости:**
```bash
npm install @huggingface/transformers sharp
```

2. **Скачайте модель:**
```bash
# Создайте папку для моделей
mkdir -p models/deepseek-r1

# Модель будет скачана автоматически при первом запуске
```

3. **Измените настройки:**
```env
HUGGINGFACE_MOCK_MODE=false
```

4. **Перезапустите сервер**

## 🐛 Устранение проблем

### Сервер не запускается:
```bash
# Проверьте зависимости
npm install

# Пересоберите
npx tsc src/index-local-simple.ts --outDir dist-simple --moduleResolution node --module esnext --target es2020
```

### Порт занят:
```bash
# Найдите процесс
lsof -i :9460

# Убейте процесс
kill -9 <PID>
```

### Ошибки модели:
- Проверьте переменные среды
- Убедитесь что HUGGINGFACE_MOCK_MODE=true для эмуляции
- Проверьте логи в терминале

## 📊 Мониторинг

### Проверка статуса:
```bash
curl http://localhost:9460/health
```

### Логи:
- Сервер выводит подробные логи в консоль
- Уровень логирования: `LOG_LEVEL=info`

## 🎯 Следующие шаги

1. **Интеграция с VS Code** - Настройка MCP клиента
2. **Реальная модель** - Замена эмулятора на настоящую DeepSeek R1
3. **Дополнительные инструменты** - Добавление анализа, рефакторинга, документации
4. **Кэширование** - Сохранение результатов для ускорения
5. **API интерфейс** - REST API для внешних клиентов

## 🏷️ Версии

- **MCP SDK**: Последняя версия
- **DeepSeek R1**: Эмуляция (планируется deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- **Node.js**: ES2020 модули
- **TypeScript**: Компиляция в ES modules

---

**Статус**: ✅ Готово к использованию (режим эмуляции)
**Дата**: $(date)
**Автор**: AI Assistant
