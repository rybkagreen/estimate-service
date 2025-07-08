# Настройка команды для работы с GitHub Copilot в Estimate Service

## 🚀 Быстрый старт

### 1. Клонирование и настройка
```bash
# Клонирование репозитория
git clone https://github.com/your-org/estimate-service.git
cd estimate-service

# Автоматическая настройка среды
chmod +x .github/setup-codespaces.sh
./.github/setup-codespaces.sh

# Установка зависимостей
npm install
```

### 2. Настройка VS Code для Copilot
```bash
# Копирование рекомендуемых настроек
cp .vscode/copilot.json ~/.vscode/settings.json

# Установка рекомендуемых расширений
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat
code --install-extension GitHub.copilot-labs
```

## 🤖 Оптимизация работы с Copilot

### Контекстуальные файлы
Copilot автоматически использует следующие файлы для понимания проекта:
- `.github/copilot-workspace.yml` - описание архитектуры
- `.github/COPILOT_CONTEXT.md` - доменные знания
- `.github/copilot-prompts.json` - готовые промпты
- `.copilot-context` - краткий контекст проекта

### Рекомендуемые промпты для разработки

#### 🏗️ Создание новых сущностей
```
Создай полную доменную сущность для управления [материалами/работами/расценками] в строительной смете:
- Entity с валидацией
- DTO для CRUD операций
- Service с бизнес-логикой
- Controller с OpenAPI
- Unit тесты с покрытием 80%

Учти стандарты ФСБЦ-2022 и используй decimal.js для денежных расчетов.
```

#### 💰 Работа с расчетами
```
Реализуй калькулятор стоимости строительных работ:
- Базовые расценки из ФСБЦ-2022
- Региональные коэффициенты
- Накладные расходы (15-20%)
- Сметная прибыль (6-12%)
- Валидация корректности

Используй Decimal.js, NestJS patterns, добавь comprehensive тесты.
```

#### 📊 Интеграции и экспорт
```
Создай сервис экспорта сметы в формат [Excel/PDF/Гранд Смета]:
- Правильная структура документа
- Соблюдение стандартов оформления
- Включение всех обязательных разделов
- Корректные формулы для итогов

Используй библиотеку [exceljs/pdfkit/custom] и добавь error handling.
```

### Специфичные настройки Copilot

#### В файле `.vscode/settings.json`:
```jsonc
{
  "github.copilot.chat.systemMessage": "Ты эксперт по разработке систем управления строительными сметами. Знаешь ФСБЦ-2022, ГрандСмета, NestJS, Prisma. Используй Clean Architecture и DDD patterns.",

  "github.copilot.advanced": {
    "length": 500,
    "temperature": "0.1"
  }
}
```

#### Горячие клавиши:
- `Ctrl+I` - открыть Copilot Chat
- `Tab` - принять предложение
- `Ctrl+→` - принять частично
- `Alt+]` - следующее предложение
- `Alt+[` - предыдущее предложение

## 👥 Командная работа

### Роли и права доступа

#### Tech Lead / Senior Developer
- Доступ ко всем репозиториям
- Права на review и merge
- Настройка CI/CD и качества кода

#### Middle Developer
- Доступ к development ветке
- Создание feature branches
- Участие в code review

#### Junior Developer
- Доступ к собственным feature branches
- Обязательный code review перед merge
- Использование готовых промптов Copilot

### Процесс разработки

1. **Планирование задачи**
   - Изучение доменной области (ФСБЦ-2022)
   - Выбор архитектурного паттерна
   - Подготовка промптов для Copilot

2. **Разработка с Copilot**
   - Использование контекстуальных промптов
   - Следование стандартам проекта
   - Continuous testing

3. **Code Review**
   - Автоматическая проверка AI workflow
   - Human review с фокусом на бизнес-логику
   - Проверка соответствия доменным стандартам

4. **Деплой и мониторинг**
   - Автоматический деплой через GitHub Actions
   - Мониторинг производительности
   - Аналитика использования AI suggestions

## 🛠️ Полезные команды

### Разработка
```bash
# Запуск всех сервисов
npm run dev:all

# Запуск только backend
npm run dev:backend

# Запуск только frontend
npm run dev:frontend

# Запуск MCP сервера
npm run dev:mcp
```

### Тестирование
```bash
# Все тесты
npm run test:all

# Тесты с покрытием
npm run test:coverage

# E2E тесты
npm run test:e2e

# Тесты в watch режиме
npm run test:watch
```

### Качество кода
```bash
# Линтинг всего проекта
npm run lint:all

# Исправление lint ошибок
npm run lint:fix

# Форматирование кода
npm run format

# Проверка типов
npm run type-check
```

### Документация
```bash
# Проверка качества документации
npm run docs:check

# Исправление markdown
npm run docs:fix

# Метрики документации
npm run docs:metrics
```

## 🎯 KPI и метрики

### Эффективность Copilot
- % принятых suggestions
- Время разработки vs без Copilot
- Качество сгенерированного кода
- Количество ошибок в AI-коде

### Качество проекта
- Покрытие тестами (цель: 80%+)
- Количество критических bugs
- Время resolve issues
- Производительность API

### Командные метрики
- Скорость code review
- Количество merge conflicts
- Adherence to coding standards
- Knowledge sharing через Copilot

## 📞 Поддержка

- **Техническая поддержка**: #dev-support
- **Вопросы по домену**: #construction-domain
- **AI/Copilot помощь**: #ai-assistance
- **Документация**: `/docs` в репозитории

---

*Этот документ обновляется автоматически при изменениях в конфигурации проекта.*
