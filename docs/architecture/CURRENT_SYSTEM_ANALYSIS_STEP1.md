# Анализ текущей архитектуры системы и требований (Шаг 1)

## 1. Обзор текущей структуры codebase estimate-service

### 1.1 Общая архитектура
- **Монорепозиторий** на базе Nx 21.2.0
- **Frontend**: React 19.1.0 с TypeScript, Vite, Tailwind CSS
- **Backend**: NestJS с TypeScript, Prisma ORM
- **База данных**: PostgreSQL 15+
- **Кэш**: Redis 7+
- **AI интеграция**: DeepSeek R1, Hugging Face, Model Context Protocol (MCP)

### 1.2 Структура проекта
```
estimate-service/
├── apps/
│   └── estimate-frontend/       # React приложение
├── services/
│   ├── estimate-service/        # Основной backend сервис
│   ├── data-collector/          # Сервис сбора данных ФСБЦ-2022
│   ├── ai-assistant/            # AI сервис (частично интегрирован)
│   └── knowledge-base/          # База знаний
├── libs/
│   └── shared-contracts/        # Общие типы и контракты
├── mcp-server/                  # MCP сервер для AI интеграции
├── prisma/                      # База данных схема
└── docs/                        # Документация
```

### 1.3 Ключевые модули backend

#### Основной сервис (estimate-service)
- **AI Assistant Module** - интегрирован в основной сервис
- **Estimate Module** - управление сметами
- **FGIS-CS API Module** - интеграция с федеральной базой
- **Cache Module** - улучшенное кэширование
- **Priority Queue Module** - очередь задач
- **Validation Module** - валидация данных

#### Data Collector Service
- **GESN Module** - сбор данных ГЭСН
- **FER Module** - сбор данных ФЕР
- **TER Module** - сбор данных ТЕР
- **FSBC Module** - сбор данных ФСБЦ

## 2. Точки интеграции для новых AI функций

### 2.1 Существующая AI интеграция

#### AI Assistant Module (в estimate-service)
```typescript
// Расположение: services/estimate-service/src/modules/ai-assistant/
- AiAssistantService         # Основной сервис AI
- TaskPlannerService         # Планирование задач
- ResponseBuilderService     # Построение ответов
- ModelManagerService        # Управление моделями
- DeepSeekAiProvider        # Провайдер DeepSeek R1
- YandexAiProvider          # Альтернативный провайдер
```

#### MCP Server
```typescript
// Расположение: mcp-server/src/services/
- DeepSeekService           # Интеграция с DeepSeek API
- HuggingfaceService        # Интеграция с Hugging Face
- EstimateAIService         # AI для смет
```

### 2.2 Новые точки интеграции

#### 2.2.1 Расширение AI Assistant для строительных смет
- **Контекстный анализ смет** - понимание специфики строительства
- **Интеллектуальная классификация работ** - автоматическое определение кодов ФСБЦ
- **Рекомендации по оптимизации** - снижение затрат
- **Прогнозирование рисков** - анализ потенциальных проблем

#### 2.2.2 Интеграция с нормативными базами
- **Автоматический поиск расценок** - по описанию работ
- **Валидация соответствия нормам** - проверка правильности применения
- **Региональная адаптация** - учет местных особенностей

#### 2.2.3 Обработка документов
- **Анализ чертежей и спецификаций** - извлечение данных для смет
- **Импорт из Гранд Смета** - парсинг существующих смет
- **Генерация отчетов** - создание документации

## 3. Требуемые базы данных и источники данных

### 3.1 Существующие базы данных

#### PostgreSQL (основная БД)
```prisma
// Основные модели данных
model FSBTSItem {
  id           String
  code         String    // Код ФСБЦ
  name         String    // Наименование работы
  unit         String    // Единица измерения
  basePrice    Decimal   // Базовая цена
  laborCost    Decimal   // Стоимость труда
  machineCost  Decimal   // Стоимость машин
  materialCost Decimal   // Стоимость материалов
  category     String    // Категория работ
  regionCode   String    // Код региона
}

model RegionalCoefficient {
  id            String
  regionCode    String    // Код региона
  materialCoeff Decimal   // Коэффициент для материалов
  laborCoeff    Decimal   // Коэффициент для труда
  machineCoeff  Decimal   // Коэффициент для машин
}
```

#### Redis (кэш)
- Кэширование цен ФСБЦ
- Кэширование региональных коэффициентов
- Сессии пользователей
- Очереди задач

### 3.2 Новые требуемые источники данных

#### 3.2.1 Нормативные базы данных
1. **ГЭСН** (Государственные элементные сметные нормы)
   - 47 глав по видам работ
   - Нормы затрат труда, машин, материалов
   
2. **ФЕР** (Федеральные единичные расценки)
   - Базовые расценки на работы
   - Стоимость труда, материалов, машин
   
3. **ТЕР** (Территориальные единичные расценки)
   - Региональные расценки
   - Местные коэффициенты
   
4. **ТСН** (Территориальные сметные нормативы)
   - Региональные нормативы
   - Специфические условия регионов
   
5. **ФССЦ** (Федеральный сборник сметных цен)
   - Цены на материалы
   - Цены на перевозки
   
6. **ТССЦ** (Территориальный сборник сметных цен)
   - Региональные цены на материалы
   - Местные поставщики

#### 3.2.2 Структура интеграции данных
```typescript
interface NormativeDatabase {
  type: 'GESN' | 'FER' | 'TER' | 'TSN' | 'FSSC' | 'TSSC';
  region?: string;
  version: string;
  lastUpdate: Date;
  dataSource: {
    url?: string;
    file?: string;
    api?: string;
  };
}
```

## 4. API endpoints для нормативных баз данных

### 4.1 Существующие API endpoints

#### Estimate Service API
```typescript
// Управление сметами
GET    /api/estimates              // Список смет
POST   /api/estimates              // Создание сметы
GET    /api/estimates/:id          // Получение сметы
PUT    /api/estimates/:id          // Обновление сметы
DELETE /api/estimates/:id          // Удаление сметы

// AI Assistant
POST   /api/ai/tasks/plan          // Планирование задач
POST   /api/ai/tasks/execute       // Выполнение задачи
POST   /api/ai/tasks/batch-execute // Пакетное выполнение
```

#### Data Collector API
```typescript
// Автоматизация сбора данных
POST   /api/automation/collect     // Запуск сбора данных
GET    /api/automation/status      // Статус системы
POST   /api/automation/schedule    // Настройка расписания
GET    /api/automation/logs        // Просмотр логов
```

### 4.2 Новые требуемые API endpoints

#### 4.2.1 API для ГЭСН
```typescript
GET    /api/normatives/gesn/chapters           // Список глав ГЭСН
GET    /api/normatives/gesn/search             // Поиск по ГЭСН
GET    /api/normatives/gesn/code/:code         // Получение по коду
POST   /api/normatives/gesn/calculate          // Расчет по нормам
```

#### 4.2.2 API для ФЕР/ТЕР
```typescript
GET    /api/normatives/fer/regions             // Список регионов
GET    /api/normatives/fer/:region/search      // Поиск ФЕР по региону
GET    /api/normatives/ter/:region/search      // Поиск ТЕР по региону
POST   /api/normatives/fer/apply-coefficients  // Применение коэффициентов
```

#### 4.2.3 API для ФССЦ/ТССЦ
```typescript
GET    /api/normatives/fssc/materials          // Каталог материалов
GET    /api/normatives/fssc/search             // Поиск материалов
GET    /api/normatives/tssc/:region/materials  // Региональные цены
POST   /api/normatives/fssc/calculate-transport // Расчет доставки
```

#### 4.2.4 Интегрированный API
```typescript
POST   /api/normatives/smart-search    // Умный поиск по всем базам
POST   /api/normatives/validate        // Валидация применения норм
POST   /api/normatives/optimize        // Оптимизация выбора расценок
GET    /api/normatives/updates         // Информация об обновлениях баз
```

## 5. Существующие возможности интеграции DeepSeek R1

### 5.1 Текущая реализация

#### DeepSeek AI Provider
```typescript
// Расположение: services/estimate-service/src/modules/ai-assistant/providers/deepseek-ai.provider.ts

class DeepSeekAiProvider implements AiProvider {
  // Основные методы
  async initialize(config: AiProviderConfig): Promise<void>
  async generateResponse(request: AiRequest): Promise<AiResponse>
  async isAvailable(): Promise<boolean>
  async getUsageStats(): Promise<UsageStats>
  
  // Конфигурация
  - API endpoint: https://api.deepseek.com
  - Модель: deepseek-reasoner
  - Поддержка русского языка
  - Определение уровня уверенности (ConfidenceLevel)
}
```

#### MCP Server DeepSeek Service
```typescript
// Расположение: mcp-server/src/services/deepseek.service.ts

class DeepSeekService {
  // Специализированные методы
  async analyzeCode(code: string, context: string): Promise<string>
  async generateDocumentation(code: string, type: string): Promise<string>
  async generateTests(code: string, framework: string): Promise<string>
  async refactorCode(code: string, goals: string[]): Promise<string>
  async architectureAdvice(description: string): Promise<string>
  
  // Поддержка mock-режима для тестирования
  // Health check для мониторинга доступности
}
```

### 5.2 Возможности расширения

#### 5.2.1 Специализация для строительных смет
```typescript
interface ConstructionEstimateAI {
  // Анализ описания работ
  analyzeWorkDescription(description: string): Promise<{
    suggestedCodes: string[];
    category: string;
    confidence: number;
  }>;
  
  // Оптимизация сметы
  optimizeEstimate(estimate: Estimate): Promise<{
    suggestions: OptimizationSuggestion[];
    potentialSavings: number;
  }>;
  
  // Риск-анализ
  analyzeRisks(estimate: Estimate): Promise<{
    risks: Risk[];
    mitigation: MitigationStrategy[];
  }>;
}
```

#### 5.2.2 Интеграция с базами знаний
- Обучение на исторических сметах
- Понимание региональной специфики
- Адаптация к типам объектов строительства

#### 5.2.3 Мультимодальные возможности
- Анализ чертежей и схем
- Обработка фотографий объектов
- Извлечение данных из PDF документов

### 5.3 Текущие ограничения и пути решения

#### Ограничения
1. **Контекстное окно** - ограничение на размер запроса
2. **Специализация** - необходима адаптация для строительной отрасли
3. **Скорость ответа** - задержки при сложных запросах

#### Решения
1. **Стратегия разбиения** - декомпозиция больших смет на части
2. **Fine-tuning** - дообучение на строительных данных
3. **Кэширование** - сохранение частых запросов
4. **Асинхронная обработка** - фоновые задачи для сложных операций

## 6. Рекомендации по дальнейшей интеграции

### 6.1 Приоритетные направления

1. **Расширение AI Assistant Module**
   - Добавление специализированных сервисов для строительства
   - Интеграция с нормативными базами данных
   - Улучшение контекстного понимания

2. **Создание Knowledge Base**
   - Индексация нормативных документов
   - Векторная база данных для семантического поиска
   - Обучение на исторических данных

3. **API Gateway для нормативов**
   - Унифицированный доступ ко всем базам
   - Кэширование и оптимизация запросов
   - Версионирование и обновления

### 6.2 Архитектурные улучшения

1. **Микросервисная архитектура**
   - Выделение AI Assistant в отдельный сервис
   - Создание Normatives Service
   - Event-driven коммуникация

2. **Масштабируемость**
   - Horizontal scaling для AI сервисов
   - Load balancing для API
   - Оптимизация базы данных

3. **Мониторинг и аналитика**
   - Метрики использования AI
   - Анализ точности предсказаний
   - Отслеживание производительности

## 7. Заключение

Текущая архитектура estimate-service предоставляет хорошую основу для интеграции AI-ассистента для строительных смет. Основные компоненты уже реализованы:

- ✅ Базовая интеграция с DeepSeek R1
- ✅ Модульная архитектура с AI Assistant Module
- ✅ Система сбора данных из нормативных источников
- ✅ API endpoints для основных операций
- ✅ Кэширование и оптимизация производительности

Требуется доработка:
- 🔄 Специализация AI для строительной отрасли
- 🔄 Полная интеграция всех нормативных баз (ГЭСН, ФЕР, ТЕР, ТСН, ФССЦ, ТССЦ)
- 🔄 Расширение API для работы с нормативами
- 🔄 Создание векторной базы знаний
- 🔄 Улучшение контекстного понимания строительной терминологии

Следующие шаги должны быть направлены на создание специализированных компонентов для работы со строительными сметами и глубокую интеграцию с нормативными базами данных.
