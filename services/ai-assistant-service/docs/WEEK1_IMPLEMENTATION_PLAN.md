# План реализации Недели 1: Интеграция с DeepSeek R1 и базовая архитектура

## Обзор
Цель первой недели - создать базовую архитектуру ИИ-ассистента для работы со сметной документацией ФСБЦ-2022.

## Структура компонентов

### 1. MCP Server - DeepSeek R1 интеграция
- Расширение существующего DeepSeekService
- Добавление специализированных методов для работы со сметами
- Настройка промптов для ФСБЦ-2022

### 2. Векторная база данных
- Выбор: Pinecone (облачное решение) или Weaviate (self-hosted)
- Хранение:
  - Нормативная база ФСБЦ-2022
  - Исторические сметы
  - Региональные коэффициенты

### 3. AI Assistant Service (NestJS)
- Основные модули:
  - ChatModule - обработка запросов пользователей
  - VectorStoreModule - работа с векторной БД
  - EstimateAnalysisModule - анализ смет
  - QueueModule - асинхронная обработка

### 4. API Endpoints
```typescript
// Основные эндпоинты
POST   /api/v1/ai/chat              // Отправка сообщения в чат
GET    /api/v1/ai/chat/:sessionId   // Получение истории чата
POST   /api/v1/ai/analyze-estimate  // Анализ сметы
POST   /api/v1/ai/generate-estimate // Генерация сметы
GET    /api/v1/ai/suggestions       // Получение рекомендаций
```

### 5. Очереди задач (Bull/Redis)
- Очереди:
  - estimate-generation - генерация смет
  - document-processing - обработка документов
  - vector-indexing - индексация в векторной БД
  - model-training - дообучение модели

## Задачи по дням

### День 1-2: MCP Server Enhancement
- [ ] Создать специализированный EstimateAIService в MCP
- [ ] Настроить промпты для ФСБЦ-2022
- [ ] Добавить методы для работы со сметами
- [ ] Настроить кэширование ответов

### День 3-4: Векторная БД
- [ ] Настроить Weaviate (локальная установка)
- [ ] Создать схему для хранения ФСБЦ-2022
- [ ] Импортировать базовые данные
- [ ] Настроить поиск по схожести

### День 5-6: NestJS Service
- [ ] Создать структуру сервиса
- [ ] Реализовать основные модули
- [ ] Настроить интеграцию с MCP Server
- [ ] Создать API endpoints

### День 7: Очереди и интеграция
- [ ] Настроить Redis
- [ ] Создать Bull очереди
- [ ] Интегрировать все компоненты
- [ ] Базовое тестирование

## Технические детали

### Переменные окружения
```env
# DeepSeek R1
DEEPSEEK_API_KEY=your-api-key
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Vector Database
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=your-weaviate-key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Service
AI_ASSISTANT_PORT=3003
```

### Docker Compose дополнения
```yaml
services:
  weaviate:
    image: semitechnologies/weaviate:latest
    ports:
      - "8080:8080"
    environment:
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: './data'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-transformers'
      ENABLE_MODULES: 'text2vec-transformers'
      TRANSFORMERS_INFERENCE_API: 'http://t2v-transformers:8080'
    volumes:
      - weaviate_data:/var/lib/weaviate

  t2v-transformers:
    image: semitechnologies/transformers-inference:sentence-transformers-multi-qa-MiniLM-L6-cos-v1
    environment:
      ENABLE_CUDA: 0
```

## Ожидаемые результаты
- Работающий MCP Server с поддержкой ФСБЦ-2022
- Настроенная векторная БД с базовыми данными
- NestJS сервис с API для работы с ИИ
- Интеграция всех компонентов через очереди задач
