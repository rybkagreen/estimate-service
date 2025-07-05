# Testing Strategy для Frontend

## Обзор

Этот документ описывает комплексную стратегию тестирования frontend приложения, включая unit тесты, integration тесты, E2E тесты и visual regression тесты.

## Пирамида тестирования

```
       /\
      /  \     E2E Tests (10%)
     /____\    - Критические user journeys
    /      \   - Cross-browser testing
   /________\  Integration Tests (20%)
  /          \ - Component interactions
 /____________\ - API integration
/              \ Unit Tests (70%)
\______________/ - Pure functions
                 - Component logic
                 - Utilities
```

## Unit Tests

### Конфигурация Jest

```typescript
// jest.config.ts
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
}

export default config
```

### Testing Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

afterEach(() => {
  cleanup()
})
```

### Testing Utilities

```typescript
// src/test/utils.tsx
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../contexts/ThemeContext'

// Создание тестового QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock data factories
export const createMockProject = (overrides = {}) => ({
  id: '1',
  title: 'Test Project',
  description: 'Test Description',
  status: 'active',
  createdAt: new Date().toISOString(),
  ...overrides,
})

export const createMockEstimate = (overrides = {}) => ({
  id: '1',
  projectId: '1',
  title: 'Test Estimate',
  totalCost: 100000,
  currency: 'RUB',
  items: [],
  ...overrides,
})

export * from '@testing-library/react'
export { customRender as render }
```

### Примеры Unit тестов

#### Тестирование компонентов
```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@/test/utils'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies correct variant classes', () => {
    render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-primary')
  })
})
```

#### Тестирование хуков
```typescript
// src/hooks/__tests__/useProjects.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProjects } from '../useProjects'
import { projectsService } from '@/services/projects'

// Mock сервиса
vi.mock('@/services/projects')
const mockProjectsService = vi.mocked(projectsService)

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches projects successfully', async () => {
    const mockProjects = [createMockProject()]
    mockProjectsService.getProjects.mockResolvedValue(mockProjects)

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockProjects)
  })

  it('handles error state', async () => {
    mockProjectsService.getProjects.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
```

#### Тестирование утилит
```typescript
// src/utils/__tests__/formatCurrency.test.ts
import { formatCurrency } from '../formatCurrency'

describe('formatCurrency', () => {
  it('formats RUB currency correctly', () => {
    expect(formatCurrency(100000, 'RUB')).toBe('100 000 ₽')
  })

  it('formats USD currency correctly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000')
  })

  it('handles zero values', () => {
    expect(formatCurrency(0, 'RUB')).toBe('0 ₽')
  })

  it('handles negative values', () => {
    expect(formatCurrency(-1000, 'RUB')).toBe('-1 000 ₽')
  })
})
```

## Integration Tests

### Тестирование взаимодействия компонентов

```typescript
// src/pages/__tests__/ProjectDetails.integration.test.tsx
import { render, screen, waitFor, fireEvent } from '@/test/utils'
import { ProjectDetails } from '../ProjectDetails'
import { projectsService } from '@/services/projects'
import { estimatesService } from '@/services/estimates'

vi.mock('@/services/projects')
vi.mock('@/services/estimates')

const mockProjectsService = vi.mocked(projectsService)
const mockEstimatesService = vi.mocked(estimatesService)

describe('ProjectDetails Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and displays project with estimates', async () => {
    const mockProject = createMockProject({ id: '1', title: 'Test Project' })
    const mockEstimates = [createMockEstimate({ projectId: '1' })]

    mockProjectsService.getProject.mockResolvedValue(mockProject)
    mockEstimatesService.getEstimatesByProject.mockResolvedValue(mockEstimates)

    render(<ProjectDetails projectId="1" />)

    // Проверяем загрузку проекта
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    // Проверяем загрузку смет
    await waitFor(() => {
      expect(screen.getByText('Test Estimate')).toBeInTheDocument()
    })
  })

  it('handles project creation workflow', async () => {
    mockProjectsService.createProject.mockResolvedValue(createMockProject())

    render(<ProjectDetails />)

    // Заполняем форму
    fireEvent.change(screen.getByLabelText('Project Title'), {
      target: { value: 'New Project' }
    })

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'New Description' }
    })

    // Отправляем форму
    fireEvent.click(screen.getByText('Create Project'))

    await waitFor(() => {
      expect(mockProjectsService.createProject).toHaveBeenCalledWith({
        title: 'New Project',
        description: 'New Description'
      })
    })
  })
})
```

### API Integration Tests

```typescript
// src/services/__tests__/api.integration.test.ts
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { projectsService } from '../projects'

const server = setupServer(
  rest.get('/api/projects', (req, res, ctx) => {
    return res(ctx.json([createMockProject()]))
  }),

  rest.post('/api/projects', (req, res, ctx) => {
    return res(ctx.json(createMockProject()))
  }),

  rest.get('/api/projects/:id', (req, res, ctx) => {
    return res(ctx.json(createMockProject({ id: req.params.id })))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Projects API Integration', () => {
  it('fetches projects from API', async () => {
    const projects = await projectsService.getProjects()
    expect(projects).toHaveLength(1)
  })

  it('creates project via API', async () => {
    const newProject = { title: 'New Project', description: 'Description' }
    const project = await projectsService.createProject(newProject)
    expect(project.title).toBe('New Project')
  })

  it('handles API errors', async () => {
    server.use(
      rest.get('/api/projects', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server Error' }))
      })
    )

    await expect(projectsService.getProjects()).rejects.toThrow()
  })
})
```

## E2E Tests (Playwright)

### Конфигурация

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Page Object Model

```typescript
// e2e/pages/ProjectPage.ts
import { Page, Locator } from '@playwright/test'

export class ProjectPage {
  readonly page: Page
  readonly createButton: Locator
  readonly titleInput: Locator
  readonly descriptionInput: Locator
  readonly saveButton: Locator
  readonly projectList: Locator

  constructor(page: Page) {
    this.page = page
    this.createButton = page.getByTestId('create-project-btn')
    this.titleInput = page.getByLabel('Project Title')
    this.descriptionInput = page.getByLabel('Description')
    this.saveButton = page.getByTestId('save-project-btn')
    this.projectList = page.getByTestId('projects-list')
  }

  async goto() {
    await this.page.goto('/projects')
  }

  async createProject(title: string, description: string) {
    await this.createButton.click()
    await this.titleInput.fill(title)
    await this.descriptionInput.fill(description)
    await this.saveButton.click()
  }

  async getProjectByTitle(title: string) {
    return this.projectList.getByText(title)
  }
}
```

### E2E Test Examples

```typescript
// e2e/project-management.spec.ts
import { test, expect } from '@playwright/test'
import { ProjectPage } from './pages/ProjectPage'

test.describe('Project Management', () => {
  test('should create a new project', async ({ page }) => {
    const projectPage = new ProjectPage(page)

    await projectPage.goto()
    await projectPage.createProject('Test Project', 'Test Description')

    // Проверяем, что проект появился в списке
    const project = await projectPage.getProjectByTitle('Test Project')
    await expect(project).toBeVisible()
  })

  test('should navigate to project details', async ({ page }) => {
    const projectPage = new ProjectPage(page)

    await projectPage.goto()

    // Кликаем на проект
    const project = await projectPage.getProjectByTitle('Test Project')
    await project.click()

    // Проверяем переход на страницу деталей
    await expect(page).toHaveURL(/\/projects\/\w+/)
    await expect(page.getByText('Test Project')).toBeVisible()
  })

  test('should create estimate for project', async ({ page }) => {
    await page.goto('/projects/1')

    // Создаем смету
    await page.getByTestId('create-estimate-btn').click()
    await page.getByLabel('Estimate Title').fill('Test Estimate')
    await page.getByTestId('save-estimate-btn').click()

    // Проверяем создание сметы
    await expect(page.getByText('Test Estimate')).toBeVisible()
  })
})
```

### Visual Regression Tests

```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Visual Regression', () => {
  test('dashboard page screenshot', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Делаем скриншот всей страницы
    await expect(page).toHaveScreenshot('dashboard.png')
  })

  test('project card component', async ({ page }) => {
    await page.goto('/projects')

    const projectCard = page.getByTestId('project-card').first()
    await expect(projectCard).toHaveScreenshot('project-card.png')
  })

  test('mobile dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')

    await expect(page).toHaveScreenshot('dashboard-mobile.png')
  })
})
```

## Accessibility Tests

### Automated A11Y Testing

```typescript
// src/test/a11y.test.tsx
import { render } from '@/test/utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import { App } from '../App'

expect.extend(toHaveNoViolations)

describe('Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Manual A11Y Testing

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard')

    // Проверяем навигацию по Tab
    await page.keyboard.press('Tab')
    await expect(page.getByRole('navigation')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByRole('main')).toBeFocused()
  })

  test('screen reader support', async ({ page }) => {
    await page.goto('/projects')

    // Проверяем наличие ARIA labels
    const createButton = page.getByTestId('create-project-btn')
    await expect(createButton).toHaveAttribute('aria-label', 'Create new project')
  })

  test('color contrast', async ({ page }) => {
    await page.goto('/dashboard')

    // Проверяем контрастность через CSS
    const textElement = page.getByText('Dashboard')
    const color = await textElement.evaluate(el =>
      getComputedStyle(el).color
    )
    const backgroundColor = await textElement.evaluate(el =>
      getComputedStyle(el).backgroundColor
    )

    // Здесь можно добавить проверку контрастности
    expect(color).toBeTruthy()
    expect(backgroundColor).toBeTruthy()
  })
})
```

## Performance Tests

### Bundle Size Testing

```typescript
// scripts/bundle-size.test.js
import { readFileSync, statSync } from 'fs'
import { gzipSync } from 'zlib'

const MAX_BUNDLE_SIZE = 500 * 1024 // 500KB
const MAX_GZIP_SIZE = 150 * 1024   // 150KB

describe('Bundle Size', () => {
  it('should not exceed maximum bundle size', () => {
    const bundlePath = 'dist/assets/index.js'
    const bundleSize = statSync(bundlePath).size

    expect(bundleSize).toBeLessThan(MAX_BUNDLE_SIZE)
  })

  it('should not exceed maximum gzip size', () => {
    const bundlePath = 'dist/assets/index.js'
    const bundleContent = readFileSync(bundlePath)
    const gzipSize = gzipSync(bundleContent).length

    expect(gzipSize).toBeLessThan(MAX_GZIP_SIZE)
  })
})
```

### Lighthouse CI

```yaml
# .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

## Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:a11y": "jest --testPathPattern=a11y",
    "test:visual": "playwright test --grep=visual",
    "test:ci": "npm run test:coverage && npm run test:e2e",
    "lighthouse": "lhci autorun"
  }
}
```

## Continuous Integration

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
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lighthouse
```

Эта стратегия тестирования обеспечивает высокое качество frontend приложения на всех уровнях - от unit тестов до E2E и performance тестирования.
