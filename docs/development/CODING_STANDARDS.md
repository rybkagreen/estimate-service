# Стандарты кодирования

## Общие принципы

### 1. Принципы SOLID
- **Single Responsibility Principle (SRP)**: Каждый класс должен иметь одну причину для изменения
- **Open-Closed Principle (OCP)**: Классы открыты для расширения, закрыты для модификации
- **Liskov Substitution Principle (LSP)**: Объекты должны быть заменяемы экземплярами их подтипов
- **Interface Segregation Principle (ISP)**: Много специализированных интерфейсов лучше одного общего
- **Dependency Inversion Principle (DIP)**: Зависимость от абстракций, а не от конкретных реализаций

### 2. Clean Code принципы
- Код должен быть самодокументируемым
- Функции должны быть маленькими и делать одну вещь
- Избегайте дублирования кода (DRY)
- Используйте выразительные имена

## Соглашения по именованию

### TypeScript/JavaScript

#### Переменные и функции
```typescript
// ✅ Правильно
const userAge = 25;
const isAuthenticated = true;
const calculateTotalCost = (items: EstimateItem[]) => { };

// ❌ Неправильно
const ua = 25;
const auth = true;
const calc = (items: any[]) => { };
```

#### Классы и интерфейсы
```typescript
// ✅ Правильно
class EstimateService { }
interface UserRepository { }
type EstimateStatus = 'draft' | 'approved' | 'completed';

// ❌ Неправильно
class estimateService { }
interface userRepo { }
type status = string;
```

#### Константы
```typescript
// ✅ Правильно
const MAX_ESTIMATE_ITEMS = 1000;
const API_ENDPOINTS = {
  ESTIMATES: '/api/estimates',
  FSBTS: '/api/fsbts'
} as const;

// ❌ Неправильно
const maxItems = 1000;
const endpoints = {
  estimates: '/api/estimates'
};
```

#### Файлы и директории
```
// ✅ Правильно
estimate.service.ts
user-profile.component.tsx
estimate-creation.e2e.spec.ts
ai-assistant/

// ❌ Неправильно
EstimateService.ts
userProfile.tsx
estimateCreation.test.ts
AIAssistant/
```

## Структура файлов

### Backend (NestJS)

#### Сервисы
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstimateDto, UpdateEstimateDto } from './dto';
import { Estimate } from './entities/estimate.entity';

@Injectable()
export class EstimateService {
  private readonly logger = new Logger(EstimateService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEstimateDto): Promise<Estimate> {
    this.logger.log(`Creating estimate: ${dto.name}`);
    
    try {
      return await this.prisma.estimate.create({
        data: dto,
      });
    } catch (error) {
      this.logger.error(`Failed to create estimate: ${error.message}`);
      throw error;
    }
  }

  // Другие методы...
}
```

#### Контроллеры
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EstimateService } from './estimate.service';
import { CreateEstimateDto } from './dto/create-estimate.dto';

@ApiTags('estimates')
@Controller('estimates')
@UseGuards(JwtAuthGuard)
export class EstimateController {
  constructor(private readonly estimateService: EstimateService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую смету' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Смета создана' })
  async create(@Body() createEstimateDto: CreateEstimateDto) {
    return this.estimateService.create(createEstimateDto);
  }

  // Другие эндпоинты...
}
```

### Frontend (React)

#### Компоненты
```typescript
import React, { useState, useCallback } from 'react';
import { Button, Input, Card } from '@/components/ui';
import { useEstimate } from '@/hooks/useEstimate';
import { EstimateFormData } from '@/types/estimate';

interface EstimateFormProps {
  onSubmit: (data: EstimateFormData) => void;
  loading?: boolean;
}

export const EstimateForm: React.FC<EstimateFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<EstimateFormData>({
    name: '',
    description: '',
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        {/* Форма */}
      </form>
    </Card>
  );
};
```

## Комментарии и документация

### JSDoc для функций
```typescript
/**
 * Вычисляет общую стоимость сметы с учетом региональных коэффициентов
 * @param items - Массив позиций сметы
 * @param regionCode - Код региона для применения коэффициентов
 * @param includeVAT - Включать ли НДС в расчет
 * @returns Общая стоимость сметы
 * @throws {ValidationError} Если передан некорректный код региона
 * @example
 * ```typescript
 * const total = calculateEstimateTotal(items, 'MSK', true);
 * ```
 */
async function calculateEstimateTotal(
  items: EstimateItem[],
  regionCode: string,
  includeVAT: boolean = true
): Promise<number> {
  // Реализация...
}
```

### Комментарии к коду
```typescript
// TODO: Добавить кэширование для частых запросов
// FIXME: Исправить проблему с округлением цен
// NOTE: Этот метод используется только для тестовых данных
// HACK: Временное решение до реализации proper API

/**
 * Временное решение для парсинга ФСБЦ-2022
 * TODO: Заменить на официальный API когда будет доступен
 */
const parseFSBTSData = (rawData: string) => {
  // ...
};
```

## Обработка ошибок

### Backend
```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

// Кастомные исключения
export class EstimateNotFoundError extends HttpException {
  constructor(id: string) {
    super(`Смета с ID ${id} не найдена`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidFSBTSCodeError extends HttpException {
  constructor(code: string) {
    super(`Некорректный код ФСБЦ: ${code}`, HttpStatus.BAD_REQUEST);
  }
}

// Использование
async findEstimate(id: string): Promise<Estimate> {
  const estimate = await this.prisma.estimate.findUnique({
    where: { id },
  });

  if (!estimate) {
    throw new EstimateNotFoundError(id);
  }

  return estimate;
}
```

### Frontend
```typescript
// Типизированные ошибки
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Обработка в компонентах
const { data, error, isLoading } = useQuery({
  queryKey: ['estimate', id],
  queryFn: () => estimateApi.getById(id),
  onError: (error: APIError) => {
    if (error.status === 404) {
      toast.error('Смета не найдена');
    } else {
      toast.error('Произошла ошибка при загрузке сметы');
    }
  },
});
```

## Тестирование

### Unit тесты
```typescript
describe('EstimateService', () => {
  let service: EstimateService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EstimateService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EstimateService>(EstimateService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create estimate with valid data', async () => {
      // Arrange
      const dto: CreateEstimateDto = {
        name: 'Test Estimate',
        description: 'Test Description',
      };
      const expected = { id: '1', ...dto };
      
      jest.spyOn(prisma.estimate, 'create').mockResolvedValue(expected);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(expected);
      expect(prisma.estimate.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });
});
```

### E2E тесты
```typescript
describe('EstimateController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/estimates (POST)', () => {
    return request(app.getHttpServer())
      .post('/estimates')
      .send({
        name: 'Test Estimate',
        description: 'Test Description',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('Test Estimate');
      });
  });
});
```

## Безопасность

### Валидация входных данных
```typescript
import { IsString, IsNumber, IsPositive, IsOptional, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEstimateDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  description?: string;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  budget: number;
}
```

### Санитизация данных
```typescript
import { sanitizeHtml } from '@/utils/sanitize';

export class EstimateService {
  async create(dto: CreateEstimateDto): Promise<Estimate> {
    // Санитизация HTML-контента
    const sanitizedDto = {
      ...dto,
      description: dto.description ? sanitizeHtml(dto.description) : undefined,
    };

    return this.prisma.estimate.create({
      data: sanitizedDto,
    });
  }
}
```

## Производительность

### Кэширование
```typescript
import { Cache } from 'cache-manager';
import { CACHE_MANAGER, Inject } from '@nestjs/common';

@Injectable()
export class FSBTSService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async searchItems(query: string): Promise<FSBTSItem[]> {
    const cacheKey = `fsbts:search:${query}`;
    
    // Проверяем кэш
    const cached = await this.cacheManager.get<FSBTSItem[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Выполняем поиск
    const items = await this.performSearch(query);
    
    // Кэшируем результат на 1 час
    await this.cacheManager.set(cacheKey, items, 3600);
    
    return items;
  }
}
```

### Пагинация
```typescript
export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  limit: number = 20;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

// Использование
async findAll(pagination: PaginationDto) {
  const [items, total] = await Promise.all([
    this.prisma.estimate.findMany({
      skip: pagination.skip,
      take: pagination.limit,
    }),
    this.prisma.estimate.count(),
  ]);

  return {
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  };
}
```

## Git и коммиты

### Формат коммитов (Conventional Commits)
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Типы коммитов:
- `feat`: новая функциональность
- `fix`: исправление ошибки
- `docs`: изменения в документации
- `style`: форматирование, отсутствующие точки с запятой и т.д.
- `refactor`: рефакторинг кода
- `test`: добавление тестов
- `chore`: обновление задач сборки, конфигураций и т.д.

#### Примеры:
```
feat(estimate): add auto-calculation for FSBTS items
fix(ai): resolve issue with context management
docs(api): update estimate endpoints documentation
test(estimate): add unit tests for calculation service
```
