# Чек-лист для код-ревью

## Общие принципы

### Цели код-ревью
- ✅ Обеспечение качества кода
- ✅ Предотвращение багов
- ✅ Соблюдение стандартов
- ✅ Обмен знаниями в команде
- ✅ Ментoring junior разработчиков

### Правила проведения
- **Конструктивность:** Комментарии должны быть конструктивными и объяснять "почему"
- **Оперативность:** Ревью в течение 24 часов
- **Фокус на коде:** Критика кода, а не автора
- **Обучение:** Делитесь знаниями и альтернативными подходами

## Чек-лист проверки

### 📋 Общие требования

#### Описание PR
- [ ] Название PR следует Conventional Commits
- [ ] Описание объясняет что и зачем изменено
- [ ] Указаны связанные issues/tickets
- [ ] Добавлены скриншоты для UI изменений
- [ ] Указаны breaking changes (если есть)

#### Размер изменений
- [ ] PR содержит логически связанные изменения
- [ ] Размер PR не превышает 400 строк
- [ ] Большие рефакторинги разбиты на части
- [ ] Нет несвязанных изменений в одном PR

### 🏗 Архитектура и дизайн

#### Архитектурные решения
- [ ] Решение соответствует общей архитектуре системы
- [ ] Нет нарушений принципов SOLID
- [ ] Правильное разделение ответственности
- [ ] Отсутствие circular dependencies
- [ ] Следование паттернам проекта

#### API Design
- [ ] Консистентность с существующим API
- [ ] Правильное использование HTTP методов и статусов
- [ ] Версионирование API при breaking changes
- [ ] Документация OpenAPI обновлена
- [ ] Backward compatibility сохранена

### 💻 Качество кода

#### Читаемость и поддерживаемость
- [ ] Код самодокументируемый
- [ ] Осмысленные имена переменных и функций
- [ ] Функции выполняют одну задачу
- [ ] Отсутствие магических чисел и строк
- [ ] Комментарии объясняют "почему", а не "что"

#### TypeScript/JavaScript
- [ ] Строгая типизация (no `any`)
- [ ] Правильное использование generics
- [ ] Отсутствие `@ts-ignore` без обоснования
- [ ] Использование enum вместо строковых литералов
- [ ] Правильная обработка null/undefined

```typescript
// ❌ Плохо
function calc(a: any, b: any): any {
  return a + b;
}

// ✅ Хорошо
function calculateTotal(basePrice: number, tax: number): number {
  return basePrice + tax;
}
```

#### Обработка ошибок
- [ ] Все ошибки обрабатываются
- [ ] Используются типизированные исключения
- [ ] Логирование ошибок с контекстом
- [ ] Graceful degradation для внешних зависимостей
- [ ] Валидация входных данных

```typescript
// ❌ Плохо
async function getEstimate(id: string) {
  const estimate = await repository.findById(id);
  return estimate;
}

// ✅ Хорошо
async function getEstimate(id: string): Promise<Estimate> {
  try {
    const estimate = await repository.findById(id);
    if (!estimate) {
      throw new EstimateNotFoundError(id);
    }
    return estimate;
  } catch (error) {
    this.logger.error(`Failed to get estimate ${id}`, error);
    throw error;
  }
}
```

### 🛡 Безопасность

#### Валидация данных
- [ ] Валидация всех входных данных
- [ ] Санитизация пользовательского ввода
- [ ] Проверка авторизации и прав доступа
- [ ] Отсутствие SQL injection уязвимостей
- [ ] Проверка размеров загружаемых файлов

```typescript
// ✅ Хорошо
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ESTIMATOR)
async create(
  @Body() dto: CreateEstimateDto,
  @CurrentUser() user: User
): Promise<Estimate> {
  // Дополнительная проверка прав
  await this.authService.checkEstimateCreatePermission(user);
  return this.estimateService.create(dto, user.id);
}
```

#### Конфиденциальность
- [ ] Нет хардкод паролей/ключей
- [ ] Чувствительные данные в переменных окружения
- [ ] Логирование не содержит приватных данных
- [ ] Правильная настройка CORS
- [ ] Использование HTTPS

### 🗄 База данных

#### Запросы и производительность
- [ ] Эффективные SQL запросы
- [ ] Использование индексов
- [ ] Отсутствие N+1 проблем
- [ ] Пагинация для больших выборок
- [ ] Оптимизация JOIN запросов

```typescript
// ❌ Плохо - N+1 проблема
async function getEstimatesWithItems(): Promise<Estimate[]> {
  const estimates = await this.repository.findAll();
  for (const estimate of estimates) {
    estimate.items = await this.itemRepository.findByEstimateId(estimate.id);
  }
  return estimates;
}

// ✅ Хорошо
async function getEstimatesWithItems(): Promise<Estimate[]> {
  return this.repository.findAll({
    include: { items: true }
  });
}
```

#### Миграции
- [ ] Миграции безопасны для продакшн
- [ ] Rollback стратегия продумана
- [ ] Индексы создаются concurrently
- [ ] Большие изменения разбиты на этапы
- [ ] Тестирование на копии продакшн данных

### 🧪 Тестирование

#### Покрытие тестами
- [ ] Unit тесты для новой логики
- [ ] Integration тесты для API endpoints
- [ ] E2E тесты для критических путей
- [ ] Тесты покрывают edge cases
- [ ] Мокирование внешних зависимостей

#### Качество тестов
- [ ] Тесты независимы друг от друга
- [ ] Четкий arrange-act-assert паттерн
- [ ] Осмысленные имена тестов
- [ ] Тестовые данные изолированы
- [ ] Отсутствие флакирующих тестов

```typescript
// ✅ Хорошо структурированный тест
describe('EstimateService.calculateCost', () => {
  it('should include VAT when flag is true', async () => {
    // Arrange
    const estimate = new EstimateBuilder()
      .withItems([{ basePrice: 1000, quantity: 1 }])
      .build();
    
    jest.spyOn(repository, 'findById').mockResolvedValue(estimate);
    
    // Act
    const result = await service.calculateCost(estimate.id, { includeVAT: true });
    
    // Assert
    expect(result.subtotal).toBe(1000);
    expect(result.vat).toBe(200);
    expect(result.total).toBe(1200);
  });
});
```

### ⚡ Производительность

#### Оптимизация кода
- [ ] Отсутствие unnecessary re-renders (React)
- [ ] Кэширование дорогих операций
- [ ] Lazy loading для больших компонентов
- [ ] Debouncing для частых операций
- [ ] Оптимизация bundle size

#### Мониторинг
- [ ] Добавлены метрики для новых эндпоинтов
- [ ] Логирование производительности
- [ ] Алерты на критические операции
- [ ] Профилирование ресурсоемких функций

### 📱 Frontend специфика

#### React компоненты
- [ ] Использование хуков правильно
- [ ] Мемоизация дорогих вычислений
- [ ] Правильная обработка состояния
- [ ] Accessibility соблюдена
- [ ] Responsive дизайн

```typescript
// ✅ Хорошо оптимизированный компонент
const EstimateList = memo(({ estimates }: EstimateListProps) => {
  const [filteredEstimates, setFilteredEstimates] = useState<Estimate[]>([]);
  
  const expensiveCalculation = useMemo(
    () => estimates.map(e => calculateComplexMetric(e)),
    [estimates]
  );
  
  const debouncedFilter = useCallback(
    debounce((query: string) => {
      setFilteredEstimates(estimates.filter(e => e.name.includes(query)));
    }, 300),
    [estimates]
  );
  
  return (
    <div>
      <SearchInput onChange={debouncedFilter} />
      {filteredEstimates.map(estimate => (
        <EstimateCard key={estimate.id} estimate={estimate} />
      ))}
    </div>
  );
});
```

#### State management
- [ ] Минимальное состояние в компонентах
- [ ] Правильное разделение локального и глобального состояния
- [ ] Нормализация данных в store
- [ ] Отсутствие избыточных re-renders

### 🚀 DevOps и развертывание

#### Docker и инфраструктура
- [ ] Оптимизированные Docker образы
- [ ] Multi-stage builds
- [ ] Правильные health checks
- [ ] Ресурсные лимиты указаны
- [ ] Secrets в переменных окружения

#### CI/CD
- [ ] Pipeline проходит все этапы
- [ ] Тесты запускаются автоматически
- [ ] Code coverage не снижается
- [ ] Security scanning пройден
- [ ] Deployment strategy продумана

### 📝 Документация

#### Код документация
- [ ] JSDoc для публичных API
- [ ] README обновлен при необходимости
- [ ] CHANGELOG.md обновлен
- [ ] API документация актуальна
- [ ] Architectural Decision Records (ADR) созданы

#### Примеры использования
- [ ] Примеры в комментариях актуальны
- [ ] Документация развертывания обновлена
- [ ] Troubleshooting guide дополнен
- [ ] User guide обновлен

## Процесс код-ревью

### 1. Автор PR

#### Подготовка к ревью
```markdown
## Что изменено
Краткое описание изменений

## Зачем изменено  
Обоснование необходимости изменений

## Как тестировать
Шаги для проверки функциональности

## Скриншоты (для UI)
[Приложить скриншоты до/после]

## Checklist
- [ ] Тесты добавлены/обновлены
- [ ] Документация обновлена
- [ ] Breaking changes отсутствуют
- [ ] Performance impact оценен
```

#### Реагирование на комментарии
- [ ] Отвечать на все комментарии
- [ ] Исправлять или обосновывать решения
- [ ] Помечать resolved комментарии
- [ ] Благодарить за фидбэк

### 2. Ревьюер

#### Подход к ревью
- [ ] Понимание контекста изменений
- [ ] Проверка по чек-листу
- [ ] Тестирование локально (при необходимости)
- [ ] Конструктивные комментарии
- [ ] Предложение альтернатив

#### Типы комментариев
```markdown
<!-- Блокирующий комментарий -->
🛑 **MUST FIX**: Эта уязвимость может привести к утечке данных

<!-- Важное замечание -->
⚠️ **SHOULD FIX**: Этот код может вызвать performance проблемы

<!-- Предложение -->
💡 **SUGGESTION**: Рассмотрите использование мемоизации здесь

<!-- Вопрос -->
❓ **QUESTION**: Почему выбран именно этот подход?

<!-- Положительный фидбэк -->
✅ **GOOD**: Отличное решение проблемы!
```

### 3. Автоматизация

#### GitHub Actions для PR
```yaml
name: PR Validation

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Проверка размера PR
      - name: Check PR size
        uses: actions/github-script@v6
        with:
          script: |
            const { data: pr } = await github.rest.pulls.get({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number
            });
            
            if (pr.additions + pr.deletions > 800) {
              core.setFailed('PR too large. Consider splitting into smaller PRs.');
            }
      
      # Проверка наличия описания
      - name: Check PR description
        uses: actions/github-script@v6
        with:
          script: |
            const { data: pr } = await github.rest.pulls.get({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number
            });
            
            if (!pr.body || pr.body.length < 10) {
              core.setFailed('PR description is required');
            }
      
      # Запуск тестов
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check
```

#### SonarQube интеграция
```yaml
      - name: SonarQube analysis
        uses: SonarSource/sonarcloud-github-action@master
        with:
          args: >
            -Dsonar.pullrequest.key=${{ github.event.number }}
            -Dsonar.pullrequest.branch=${{ github.head_ref }}
            -Dsonar.pullrequest.base=${{ github.base_ref }}
```

## Специфические проверки для домена

### ФСБЦ-2022 интеграция
- [ ] Валидация кодов ФСБЦ
- [ ] Правильность региональных коэффициентов
- [ ] Обработка устаревших позиций
- [ ] Кэширование справочных данных

### ИИ-компоненты
- [ ] Проверка качества промптов
- [ ] Валидация ответов ИИ
- [ ] Fallback для недоступности ИИ
- [ ] Rate limiting для API вызовов
- [ ] Логирование взаимодействий для обучения

### Расчеты смет
- [ ] Точность математических операций
- [ ] Обработка округлений
- [ ] Валидация итоговых сумм
- [ ] Проверка формул расчета

## Метрики качества ревью

### Отслеживаемые показатели
- **Time to Review:** Среднее время от создания PR до первого ревью
- **Review Thoroughness:** Количество найденных проблем
- **Defect Escape Rate:** Процент багов, пропущенных ревью
- **Review Coverage:** Процент PR с ревью
- **Reviewer Distribution:** Равномерность нагрузки на ревьюеров

### Цели команды
- Time to Review: < 24 часа
- Review Coverage: 100%
- Defect Escape Rate: < 5%
- Review Thoroughness: ≥ 3 комментария на PR

## Инструменты

### VS Code расширения
- **GitLens** - История изменений
- **Code Review** - Удобное ревью в IDE
- **SonarLint** - Анализ качества кода
- **Prettier** - Автоформатирование
- **ESLint** - Проверка стиля кода

### Онлайн инструменты
- **GitHub PR Reviews** - Основная платформа
- **SonarQube** - Анализ качества
- **CodeClimate** - Метрики качества
- **Codecov** - Покрытие тестами
