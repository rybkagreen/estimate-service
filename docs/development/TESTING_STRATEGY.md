# Стратегия тестирования

## Обзор

Стратегия тестирования определяет подходы и методы обеспечения качества системы составления сметной документации. Мы используем многоуровневый подход тестирования, покрывающий все аспекты системы от юнит-тестов до E2E тестирования.

## Пирамида тестирования

```
    /\
   /  \     E2E Tests (10%)
  /____\    
 /      \   Integration Tests (20%)
/________\  
           Unit Tests (70%)
```

### 1. Unit Tests (70% от всех тестов)
**Цель:** Тестирование отдельных компонентов в изоляции
**Инструменты:** Jest, Testing Library
**Покрытие:** ≥ 90%

#### Backend (NestJS)
```typescript
// estimate.service.spec.ts
describe('EstimateService', () => {
  let service: EstimateService;
  let repository: EstimateRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EstimateService,
        {
          provide: EstimateRepository,
          useValue: mockEstimateRepository,
        },
      ],
    }).compile();

    service = module.get<EstimateService>(EstimateService);
    repository = module.get<EstimateRepository>(EstimateRepository);
  });

  describe('create', () => {
    it('should create estimate with valid data', async () => {
      // Arrange
      const dto: CreateEstimateDto = {
        name: 'Test Estimate',
        projectType: ProjectType.RESIDENTIAL,
        regionCode: 'MSK',
      };
      const expectedEstimate: Estimate = {
        id: 'test-id',
        ...dto,
        totalCost: new Decimal(0),
        status: EstimateStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'create').mockResolvedValue(expectedEstimate);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(expectedEstimate);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });

    it('should throw error for invalid project type', async () => {
      // Arrange
      const dto = {
        name: 'Test',
        projectType: 'INVALID' as ProjectType,
        regionCode: 'MSK',
      };

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow('Invalid project type');
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost correctly with VAT', async () => {
      // Arrange
      const estimateId = 'test-id';
      const estimate = createMockEstimate({
        items: [
          { basePrice: 1000, quantity: 10 }, // 10,000
          { basePrice: 500, quantity: 5 },   // 2,500
        ],
      });
      
      jest.spyOn(repository, 'findById').mockResolvedValue(estimate);

      // Act
      const result = await service.calculateCost(estimateId, { includeVAT: true });

      // Assert
      expect(result.subtotal).toBe(12500);
      expect(result.vat).toBe(2500); // 20%
      expect(result.total).toBe(15000);
    });
  });
});
```

#### Frontend (React)
```typescript
// EstimateForm.test.tsx
describe('EstimateForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields correctly', () => {
    render(<EstimateForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/название сметы/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/тип проекта/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/регион/i)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<EstimateForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText(/название сметы/i), 'Test Estimate');
    await user.selectOptions(screen.getByLabelText(/тип проекта/i), 'RESIDENTIAL');
    await user.selectOptions(screen.getByLabelText(/регион/i), 'MSK');
    await user.click(screen.getByRole('button', { name: /создать/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Test Estimate',
      projectType: 'RESIDENTIAL',
      regionCode: 'MSK',
    });
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<EstimateForm onSubmit={mockOnSubmit} />);
    
    await user.click(screen.getByRole('button', { name: /создать/i }));

    expect(screen.getByText(/название обязательно/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
```

### 2. Integration Tests (20% от всех тестов)
**Цель:** Тестирование взаимодействия между компонентами
**Инструменты:** Jest, Supertest, Test Containers

#### API Integration Tests
```typescript
// estimate.controller.integration.spec.ts
describe('EstimateController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(testPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.estimate.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /estimates', () => {
    it('should create estimate and return 201', async () => {
      // Arrange
      const user = await createTestUser();
      const token = generateTestToken(user);
      
      const createEstimateDto = {
        name: 'Integration Test Estimate',
        projectType: 'RESIDENTIAL',
        regionCode: 'MSK',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/estimates')
        .set('Authorization', `Bearer ${token}`)
        .send(createEstimateDto)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        name: createEstimateDto.name,
        projectType: createEstimateDto.projectType,
        regionCode: createEstimateDto.regionCode,
        status: 'DRAFT',
      });

      // Verify in database
      const estimate = await prisma.estimate.findUnique({
        where: { id: response.body.id },
      });
      expect(estimate).toBeTruthy();
    });

    it('should return 400 for invalid data', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user);

      const response = await request(app.getHttpServer())
        .post('/estimates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '', // Invalid: empty name
          projectType: 'INVALID_TYPE',
        })
        .expect(400);

      expect(response.body.message).toContain('validation failed');
    });
  });

  describe('Database Integration', () => {
    it('should handle concurrent estimate creation', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user);

      const requests = Array(10).fill(null).map((_, index) =>
        request(app.getHttpServer())
          .post('/estimates')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `Concurrent Estimate ${index}`,
            projectType: 'RESIDENTIAL',
            regionCode: 'MSK',
          })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      const estimatesCount = await prisma.estimate.count();
      expect(estimatesCount).toBe(10);
    });
  });
});
```

#### Database Integration Tests
```typescript
// fsbts.repository.integration.spec.ts
describe('FSBTSRepository Integration', () => {
  let repository: FSBTSRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = new PrismaService({
      datasources: { db: { url: process.env.TEST_DATABASE_URL } },
    });
    repository = new FSBTSRepository(prisma);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.fSBTSWorkItem.deleteMany();
    await seedFSBTSData();
  });

  describe('search', () => {
    it('should find items by partial name', async () => {
      const results = await repository.search('бетон');
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(item => {
        expect(item.name.toLowerCase()).toContain('бетон');
      });
    });

    it('should apply region filters correctly', async () => {
      const mskResults = await repository.search('', { regionCode: 'MSK' });
      const spbResults = await repository.search('', { regionCode: 'SPB' });
      
      expect(mskResults.length).toBeGreaterThan(0);
      expect(spbResults.length).toBeGreaterThan(0);
      expect(mskResults).not.toEqual(spbResults);
    });

    it('should handle large datasets efficiently', async () => {
      const startTime = Date.now();
      const results = await repository.search('');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // < 1 second
      expect(results.length).toBeLessThanOrEqual(100); // Pagination
    });
  });
});
```

### 3. E2E Tests (10% от всех тестов)
**Цель:** Тестирование полных пользовательских сценариев
**Инструменты:** Playwright, Cypress

#### Playwright E2E Tests
```typescript
// estimate-creation.e2e.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Estimate Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create estimate from scratch', async ({ page }) => {
    // Navigate to estimate creation
    await page.click('[data-testid=create-estimate-button]');
    await expect(page).toHaveURL('/estimates/new');

    // Fill basic information
    await page.fill('[data-testid=estimate-name]', 'E2E Test Estimate');
    await page.selectOption('[data-testid=project-type]', 'RESIDENTIAL');
    await page.selectOption('[data-testid=region-code]', 'MSK');
    await page.fill('[data-testid=description]', 'Test description');

    // Add estimate items
    await page.click('[data-testid=add-item-button]');
    await page.fill('[data-testid=fsbts-search]', 'бетон');
    await page.click('[data-testid=search-button]');
    
    // Wait for search results
    await expect(page.locator('[data-testid=search-results]')).toBeVisible();
    await page.click('[data-testid=search-result-0]');
    
    await page.fill('[data-testid=quantity]', '100');
    await page.click('[data-testid=add-to-estimate]');

    // Save estimate
    await page.click('[data-testid=save-estimate]');
    
    // Verify success
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    await expect(page.locator('[data-testid=estimate-total]')).toContainText('₽');
  });

  test('should use AI assistant for estimate creation', async ({ page }) => {
    await page.click('[data-testid=create-estimate-button]');
    
    // Open AI assistant
    await page.click('[data-testid=ai-assistant-button]');
    await expect(page.locator('[data-testid=ai-chat]')).toBeVisible();

    // Send requirements to AI
    await page.fill('[data-testid=ai-input]', 
      'Создай смету для строительства одноэтажного дома 100 кв.м в Москве'
    );
    await page.click('[data-testid=ai-send]');

    // Wait for AI response
    await expect(page.locator('[data-testid=ai-response]')).toBeVisible();
    
    // Apply AI suggestions
    await page.click('[data-testid=apply-ai-suggestions]');
    
    // Verify items were added
    await expect(page.locator('[data-testid=estimate-items]')).toContainText('фундамент');
    await expect(page.locator('[data-testid=estimate-items]')).toContainText('стены');
    await expect(page.locator('[data-testid=estimate-total]')).toContainText('₽');
  });

  test('should handle validation errors gracefully', async ({ page }) => {
    await page.click('[data-testid=create-estimate-button]');
    
    // Try to save without required fields
    await page.click('[data-testid=save-estimate]');
    
    // Check validation errors
    await expect(page.locator('[data-testid=name-error]')).toContainText('обязательно');
    await expect(page.locator('[data-testid=project-type-error]')).toContainText('обязательно');
    
    // Fill required fields
    await page.fill('[data-testid=estimate-name]', 'Test');
    await page.selectOption('[data-testid=project-type]', 'RESIDENTIAL');
    
    // Errors should disappear
    await expect(page.locator('[data-testid=name-error]')).not.toBeVisible();
    await expect(page.locator('[data-testid=project-type-error]')).not.toBeVisible();
  });
});
```

## Тестовые данные и моки

### 1. Test Data Builders
```typescript
// test-data-builders.ts
export class EstimateBuilder {
  private estimate: Partial<Estimate> = {
    name: 'Test Estimate',
    projectType: ProjectType.RESIDENTIAL,
    regionCode: 'MSK',
    status: EstimateStatus.DRAFT,
    totalCost: new Decimal(0),
  };

  withName(name: string): EstimateBuilder {
    this.estimate.name = name;
    return this;
  }

  withProjectType(type: ProjectType): EstimateBuilder {
    this.estimate.projectType = type;
    return this;
  }

  withItems(items: EstimateItem[]): EstimateBuilder {
    this.estimate.items = items;
    return this;
  }

  withTotalCost(cost: number): EstimateBuilder {
    this.estimate.totalCost = new Decimal(cost);
    return this;
  }

  build(): Estimate {
    return {
      id: 'test-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'test-user-id',
      ...this.estimate,
    } as Estimate;
  }
}

// Usage
const estimate = new EstimateBuilder()
  .withName('Complex Estimate')
  .withProjectType(ProjectType.COMMERCIAL)
  .withTotalCost(5000000)
  .build();
```

### 2. Mock Services
```typescript
// mocks/estimate.service.mock.ts
export const mockEstimateService = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  calculateCost: jest.fn(),
};

// Mock implementations
mockEstimateService.create.mockImplementation(async (dto: CreateEstimateDto) => {
  return new EstimateBuilder()
    .withName(dto.name)
    .withProjectType(dto.projectType)
    .build();
});

mockEstimateService.calculateCost.mockImplementation(async (id: string) => {
  return {
    subtotal: 100000,
    vat: 20000,
    total: 120000,
    items: [],
  };
});
```

### 3. Database Seeding
```typescript
// test-helpers/seed-data.ts
export async function seedTestDatabase(prisma: PrismaService): Promise<void> {
  // Clean existing data
  await prisma.estimateItem.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.fSBTSWorkItem.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.ESTIMATOR,
    },
  });

  // Create FSBTS items
  await prisma.fSBTSWorkItem.createMany({
    data: [
      {
        code: '01.01.001',
        name: 'Разработка грунта экскаватором',
        unit: 'м³',
        basePrice: new Decimal(500),
        category: FSBTSCategory.EARTHWORKS,
        regionCode: 'MSK',
      },
      {
        code: '02.01.001', 
        name: 'Устройство монолитного фундамента',
        unit: 'м³',
        basePrice: new Decimal(8000),
        category: FSBTSCategory.FOUNDATION,
        regionCode: 'MSK',
      },
    ],
  });

  // Create test estimates
  await prisma.estimate.create({
    data: {
      name: 'Test Estimate 1',
      projectType: ProjectType.RESIDENTIAL,
      regionCode: 'MSK',
      userId: testUser.id,
      items: {
        create: [
          {
            fsbtsCode: '01.01.001',
            quantity: new Decimal(100),
            unitPrice: new Decimal(500),
            totalPrice: new Decimal(50000),
          },
        ],
      },
    },
  });
}
```

## Performance Testing

### 1. Load Testing с Artillery
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
  defaults:
    headers:
      Authorization: 'Bearer {{ token }}'

scenarios:
  - name: 'Create and retrieve estimate'
    flow:
      - post:
          url: '/api/estimates'
          json:
            name: 'Load Test Estimate {{ $randomString() }}'
            projectType: 'RESIDENTIAL'
            regionCode: 'MSK'
          capture:
            json: '$.id'
            as: 'estimateId'
      - get:
          url: '/api/estimates/{{ estimateId }}'
      - post:
          url: '/api/estimates/{{ estimateId }}/calculate'
```

### 2. Stress Testing
```typescript
// stress-test.spec.ts
describe('Stress Tests', () => {
  test('should handle 1000 concurrent estimate calculations', async () => {
    const estimateId = await createTestEstimate();
    
    const promises = Array(1000).fill(null).map(() => 
      request(app.getHttpServer())
        .post(`/api/estimates/${estimateId}/calculate`)
        .set('Authorization', `Bearer ${token}`)
    );

    const startTime = Date.now();
    const responses = await Promise.allSettled(promises);
    const endTime = Date.now();

    const successful = responses.filter(r => r.status === 'fulfilled').length;
    const failed = responses.filter(r => r.status === 'rejected').length;

    expect(successful).toBeGreaterThan(950); // 95% success rate
    expect(endTime - startTime).toBeLessThan(30000); // < 30 seconds
  });
});
```

## Test Environment Setup

### 1. Docker Test Environment
```yaml
# docker-compose.test.yml
version: '3.8'
services:
  test-db:
    image: postgres:15
    environment:
      POSTGRES_DB: estimate_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_pass
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data

  test-redis:
    image: redis:7-alpine
    ports:
      - "6380:6379"

  test-app:
    build: .
    environment:
      NODE_ENV: test
      DATABASE_URL: postgresql://test_user:test_pass@test-db:5432/estimate_test
      REDIS_URL: redis://test-redis:6379
    depends_on:
      - test-db
      - test-redis
```

### 2. GitHub Actions CI
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Качественные метрики

### 1. Coverage Goals
- **Unit Tests:** ≥ 90% line coverage
- **Integration Tests:** ≥ 80% API endpoints coverage
- **E2E Tests:** ≥ 90% critical user journeys coverage

### 2. Performance Benchmarks
- **Unit Tests:** < 10ms per test
- **Integration Tests:** < 1000ms per test
- **E2E Tests:** < 30s per scenario

### 3. Quality Gates
```typescript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90,
    },
    './src/modules/estimate/': {
      branches: 90,
      functions: 90,
      lines: 95,
      statements: 95,
    },
  },
  testTimeout: 10000,
  maxWorkers: '50%',
};
```

## Debugging и Troubleshooting

### 1. Test Debugging
```typescript
// Debugging configuration for VS Code
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache", "--no-coverage"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  "env": {
    "NODE_ENV": "test"
  }
}
```

### 2. Test Data Cleanup
```typescript
// test-cleanup.ts
export class TestCleanup {
  static async cleanupDatabase(prisma: PrismaService): Promise<void> {
    const tables = [
      'estimate_items',
      'estimates', 
      'fsbts_work_items',
      'users'
    ];

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  }

  static async cleanupFiles(): Promise<void> {
    const testFiles = glob.sync('./test-uploads/**/*');
    await Promise.all(testFiles.map(file => fs.unlink(file)));
  }
}
```

## Continuous Testing

### 1. Test Automation Pipeline
```mermaid
graph LR
    A[Code Commit] --> B[Unit Tests]
    B --> C[Integration Tests]
    C --> D[E2E Tests]
    D --> E[Performance Tests]
    E --> F[Deploy to Staging]
    F --> G[Smoke Tests]
    G --> H[Deploy to Production]
```

### 2. Test Reports
```typescript
// Custom test reporter
class SlackReporter {
  onRunComplete(contexts, results) {
    const { numFailedTests, numPassedTests, testResults } = results;
    
    if (numFailedTests > 0) {
      this.sendSlackNotification({
        color: 'danger',
        title: `❌ Tests Failed: ${numFailedTests}`,
        text: `Passed: ${numPassedTests}, Failed: ${numFailedTests}`,
        fields: testResults
          .filter(test => test.numFailingTests > 0)
          .map(test => ({
            title: test.testFilePath,
            value: test.failureMessage,
            short: false
          }))
      });
    }
  }
}
```
