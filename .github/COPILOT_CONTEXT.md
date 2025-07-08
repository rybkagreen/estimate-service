# GitHub Copilot Configuration for Estimate Service

## Общие принципы работы с Copilot в проекте

### Контекстуальная информация для Copilot
Этот проект является ИИ-ассистентом для составления сметной документации, совместимой с Гранд Смета и интегрированной с базой ФСБЦ-2022.

### Ключевые технологии:
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **AI**: DeepSeek R1 + Hugging Face + MCP (Model Context Protocol)
- **Infrastructure**: Docker + GitHub Actions + Codespaces

### Паттерны кодирования:
1. **Domain-Driven Design** - используем доменные сущности
2. **Clean Architecture** - разделение слоев
3. **CQRS** - разделение команд и запросов
4. **Event Sourcing** - для аудита изменений смет

### Структура именования:
- **Entities**: `EstimateEntity`, `RateEntity`, `MaterialEntity`
- **DTOs**: `CreateEstimateDto`, `UpdateEstimateDto`
- **Services**: `EstimateService`, `RateCalculatorService`
- **Controllers**: `EstimateController`, `ReportsController`

### Типичные задачи для Copilot:
1. **Создание CRUD операций** для сметных документов
2. **Интеграция с ФСБЦ-2022** API
3. **Валидация данных** по стандартам ценообразования
4. **Генерация отчетов** в формате Гранд Смета
5. **Тестирование** бизнес-логики

### Специфичная терминология:
- **Смета** - estimate document
- **Расценка** - rate/price item
- **ФСБЦ** - federal construction pricing database
- **Накладные расходы** - overhead costs
- **Сметная прибыль** - estimated profit
- **Локальная смета** - local estimate
- **Объектная смета** - object estimate

### Правила для комментариев:
```typescript
// TODO: Интеграция с API ФСБЦ-2022
// FIXME: Валидация формата расценок
// NOTE: Совместимость с Гранд Смета версии 2024
```

### Примеры типичного кода:

#### Сметная сущность:
```typescript
@Entity('estimates')
export class EstimateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalCost: number;

  @OneToMany(() => EstimateItemEntity, item => item.estimate)
  items: EstimateItemEntity[];
}
```

#### Сервис расчета:
```typescript
@Injectable()
export class EstimateCalculatorService {
  async calculateTotalCost(estimateId: string): Promise<number> {
    // Логика расчета общей стоимости сметы
  }

  async applyCoefficients(rate: RateEntity, region: RegionCode): Promise<number> {
    // Применение региональных коэффициентов
  }
}
```

### Полезные Copilot промпты:
- "Создай CRUD контроллер для управления сметами"
- "Добавь валидацию для расценок ФСБЦ"
- "Реализуй экспорт сметы в формат Excel"
- "Создай тесты для калькулятора накладных расходов"
- "Добавь middleware для аудита изменений"

### Стандарты качества:
- Покрытие тестами не менее 80%
- ESLint + Prettier обязательны
- Все public методы должны иметь JSDoc
- Использование TypeScript strict mode
- Валидация входных данных через class-validator

### Интеграции:
- **MCP Server** для общения с ИИ моделями
- **ФСБЦ-2022 API** для получения расценок
- **Гранд Смета** формат для экспорта
- **PostgreSQL** для хранения данных
- **Redis** для кэширования расценок
