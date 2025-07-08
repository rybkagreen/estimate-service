# AI Assistant Migration Guide

## Обзор миграции

Модуль AI Assistant был успешно мигрирован из отдельной директории `/src/modules/ai-assistant` в состав Estimate Service по пути `/services/estimate-service/src/modules/ai-assistant`.

## Выполненные изменения

### 1. Структурные изменения

**Старое расположение:**
```
src/
└── modules/
    └── ai-assistant/
```

**Новое расположение:**
```
services/
└── estimate-service/
    └── src/
        └── modules/
            └── ai-assistant/
```

### 2. Обновленные импорты

Все импорты были обновлены для соответствия новой структуре:

```typescript
// Старый импорт
import { EstimateCalculatorService } from '../../estimate-calculator/estimate-calculator.service';

// Новый импорт (удален, так как модуль не существует)
// Сервис теперь работает автономно
```

### 3. Интеграция с существующими модулями

AI Assistant модуль теперь интегрирован с:
- **Cache Module** - для кэширования результатов
- **Estimate Module** - для работы со сметами
- **Classification Module** - для классификации данных
- **Validation Module** - для валидации результатов

### 4. Обновленная конфигурация модуля

```typescript
@Module({
  imports: [
    ConfigModule,
    CacheModule,
  ],
  controllers: [
    AiAssistantController,
    TaskPlannerController,
  ],
  providers: [
    AiAssistantService,
    TaskPlannerService,
    ResponseBuilderService,
    HistoricalEstimateService,
    ClaudeValidatorService,
    FallbackHandlerService,
    ModelManagerService,
    // ... другие сервисы
  ],
  exports: [
    // ... экспортируемые сервисы
  ],
})
export class AiAssistantModule {}
```

## Новые возможности после миграции

### 1. Улучшенная интеграция
- Прямой доступ к функциям Estimate Service
- Общее кэширование с другими модулями
- Единая система логирования

### 2. Оптимизация производительности
- Уменьшение накладных расходов на межсервисную коммуникацию
- Общий пул соединений с базой данных
- Более эффективное использование памяти

### 3. Упрощенное развертывание
- Один сервис вместо двух
- Упрощенная конфигурация Docker
- Меньше точек отказа

## Руководство по использованию

### API Endpoints

Все API endpoints остались без изменений:

```typescript
// Task Planning
POST /api/ai/tasks/plan
POST /api/ai/tasks/execute
POST /api/ai/tasks/batch-execute
GET  /api/ai/tasks/examples
```

### Конфигурация

Переменные окружения остались прежними:

```env
DEEPSEEK_API_KEY=your-key
YANDEX_API_KEY=your-key
CLAUDE_API_KEY=your-key
```

## Возможные проблемы и решения

### Проблема: Отсутствующие зависимости

**Симптом:** Ошибки компиляции о несуществующих модулях

**Решение:** Убедитесь, что все импорты обновлены и не ссылаются на старые пути

### Проблема: Конфликты типов

**Симптом:** TypeScript ошибки о несовместимых типах

**Решение:** Используйте типы из `@ez-eco/shared-contracts`

### Проблема: Проблемы с кэшем

**Симптом:** Устаревшие данные или ошибки Redis

**Решение:** Очистите кэш и перезапустите Redis

## Откат изменений

В случае необходимости отката:

1. Восстановите код из резервной копии
2. Обновите импорты обратно
3. Перезапустите сервисы

## Контрольный список после миграции

- [ ] Все тесты проходят успешно
- [ ] API endpoints работают корректно
- [ ] Логирование функционирует
- [ ] Кэширование работает
- [ ] Документация обновлена
- [ ] CI/CD pipeline обновлен

## Поддержка

При возникновении вопросов обращайтесь:
- Техническая поддержка: tech-support@estimate-service.com
- Документация: [AI Assistant Module](../architecture/AI_ASSISTANT_MODULE.md)
