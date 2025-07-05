# API Integration Guide

## Обзор

Интеграция с backend API организована с использованием Axios, TanStack Query и типизированных интерфейсов. Архитектура обеспечивает:

- **Type Safety** - полная типизация запросов и ответов
- **Error Handling** - централизованная обработка ошибок
- **Authentication** - автоматическое добавление токенов
- **Caching** - умное кэширование через TanStack Query
- **Optimistic Updates** - мгновенные UI обновления

## Базовая конфигурация API

### Axios Instance

```tsx
// api/client.ts
import axios, { AxiosError, AxiosResponse } from 'axios'
import { toast } from '../components/ui/Toast'

// Создаем базовый клиент
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - добавляем токен аутентификации
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - обрабатываем ошибки глобально
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Обработка различных типов ошибок
    if (error.response?.status === 401) {
      // Неавторизованный доступ
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 403) {
      // Недостаточно прав
      toast.error('Недостаточно прав для выполнения операции')
      return Promise.reject(error)
    }

    if (error.response?.status >= 500) {
      // Серверные ошибки
      toast.error('Внутренняя ошибка сервера. Попробуйте позже.')
      return Promise.reject(error)
    }

    if (error.code === 'ECONNABORTED') {
      // Таймаут
      toast.error('Превышено время ожидания ответа сервера')
      return Promise.reject(error)
    }

    if (!error.response) {
      // Нет соединения
      toast.error('Нет соединения с сервером')
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)
```

### Типизация API

```tsx
// types/api.ts
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, any>
}

// Estimate types
export interface Estimate {
  id: string
  name: string
  description?: string
  projectId: string
  status: 'draft' | 'review' | 'approved' | 'rejected'
  materials: EstimateMaterial[]
  labor: EstimateLabor[]
  totalCost: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface EstimateMaterial {
  id: string
  materialId: string
  material: Material
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface EstimateLabor {
  id: string
  laborId: string
  labor: Labor
  hours: number
  hourlyRate: number
  totalCost: number
}

export interface EstimateFilters {
  search?: string
  status?: Estimate['status'][]
  projectId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'name' | 'createdAt' | 'totalCost'
  sortOrder?: 'asc' | 'desc'
}

export interface EstimateCreateData {
  name: string
  description?: string
  projectId: string
  materials: EstimateMaterialCreateData[]
  labor: EstimateLaborCreateData[]
}

export interface EstimateUpdateData extends Partial<EstimateCreateData> {
  status?: Estimate['status']
}
```

## API Services

### Estimates API

```tsx
// api/estimates.ts
import { apiClient } from './client'
import type {
  Estimate,
  EstimateFilters,
  EstimateCreateData,
  EstimateUpdateData,
  PaginatedResponse,
  ApiResponse,
} from '../types/api'

class EstimatesApi {
  private readonly basePath = '/estimates'

  // Получение списка смет с фильтрацией
  async getAll(filters?: EstimateFilters): Promise<Estimate[]> {
    const params = new URLSearchParams()

    if (filters?.search) params.append('search', filters.search)
    if (filters?.status?.length) params.append('status', filters.status.join(','))
    if (filters?.projectId) params.append('projectId', filters.projectId)
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters?.dateTo) params.append('dateTo', filters.dateTo)
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await apiClient.get<ApiResponse<Estimate[]>>(
      `${this.basePath}?${params.toString()}`
    )
    return response.data.data
  }

  // Получение смет с пагинацией
  async getPage(options: {
    page?: number
    pageSize?: number
    filters?: EstimateFilters
  }): Promise<PaginatedResponse<Estimate>> {
    const { page = 1, pageSize = 20, filters } = options
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })

    if (filters?.search) params.append('search', filters.search)
    if (filters?.status?.length) params.append('status', filters.status.join(','))
    if (filters?.projectId) params.append('projectId', filters.projectId)

    const response = await apiClient.get<PaginatedResponse<Estimate>>(
      `${this.basePath}/page?${params.toString()}`
    )
    return response.data
  }

  // Получение сметы по ID
  async getById(id: string): Promise<Estimate> {
    const response = await apiClient.get<ApiResponse<Estimate>>(
      `${this.basePath}/${id}`
    )
    return response.data.data
  }

  // Создание новой сметы
  async create(data: EstimateCreateData): Promise<Estimate> {
    const response = await apiClient.post<ApiResponse<Estimate>>(
      this.basePath,
      data
    )
    return response.data.data
  }

  // Обновление сметы
  async update(id: string, data: EstimateUpdateData): Promise<Estimate> {
    const response = await apiClient.put<ApiResponse<Estimate>>(
      `${this.basePath}/${id}`,
      data
    )
    return response.data.data
  }

  // Удаление сметы
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }

  // Массовое удаление
  async batchDelete(ids: string[]): Promise<void> {
    await apiClient.delete(this.basePath, {
      data: { ids }
    })
  }

  // Дублирование сметы
  async duplicate(id: string): Promise<Estimate> {
    const response = await apiClient.post<ApiResponse<Estimate>>(
      `${this.basePath}/${id}/duplicate`
    )
    return response.data.data
  }

  // Экспорт сметы
  async export(id: string, format: 'pdf' | 'excel'): Promise<Blob> {
    const response = await apiClient.get(
      `${this.basePath}/${id}/export?format=${format}`,
      { responseType: 'blob' }
    )
    return response.data
  }

  // Получение истории изменений
  async getHistory(id: string): Promise<EstimateHistoryEntry[]> {
    const response = await apiClient.get<ApiResponse<EstimateHistoryEntry[]>>(
      `${this.basePath}/${id}/history`
    )
    return response.data.data
  }

  // Смена статуса
  async updateStatus(id: string, status: Estimate['status']): Promise<Estimate> {
    const response = await apiClient.patch<ApiResponse<Estimate>>(
      `${this.basePath}/${id}/status`,
      { status }
    )
    return response.data.data
  }
}

export const estimatesApi = new EstimatesApi()
```

### AI Assistant API

```tsx
// api/aiAssistant.ts
import { apiClient } from './client'

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: {
    confidence?: number
    sources?: string[]
    type?: 'analysis' | 'recommendation' | 'calculation'
  }
}

export interface AIAnalysisRequest {
  type: 'estimate_analysis' | 'cost_optimization' | 'material_suggestion'
  data: Record<string, any>
  context?: string
}

export interface AIAnalysisResponse {
  analysis: string
  recommendations: string[]
  confidence: number
  metadata: {
    processingTime: number
    model: string
    tokensUsed: number
  }
}

class AIAssistantApi {
  private readonly basePath = '/ai-assistant'

  // Отправка сообщения в чат
  async sendMessage(message: string, context?: Record<string, any>): Promise<AIChatMessage> {
    const response = await apiClient.post<ApiResponse<AIChatMessage>>(
      `${this.basePath}/chat`,
      { message, context }
    )
    return response.data.data
  }

  // Получение истории чата
  async getChatHistory(): Promise<AIChatMessage[]> {
    const response = await apiClient.get<ApiResponse<AIChatMessage[]>>(
      `${this.basePath}/chat/history`
    )
    return response.data.data
  }

  // Очистка истории чата
  async clearChatHistory(): Promise<void> {
    await apiClient.delete(`${this.basePath}/chat/history`)
  }

  // Анализ сметы ИИ
  async analyzeEstimate(estimateId: string): Promise<AIAnalysisResponse> {
    const response = await apiClient.post<ApiResponse<AIAnalysisResponse>>(
      `${this.basePath}/analyze/estimate`,
      { estimateId }
    )
    return response.data.data
  }

  // Оптимизация стоимости
  async optimizeCosts(estimateId: string): Promise<AIAnalysisResponse> {
    const response = await apiClient.post<ApiResponse<AIAnalysisResponse>>(
      `${this.basePath}/optimize/costs`,
      { estimateId }
    )
    return response.data.data
  }

  // Предложения по материалам
  async suggestMaterials(description: string): Promise<Material[]> {
    const response = await apiClient.post<ApiResponse<Material[]>>(
      `${this.basePath}/suggest/materials`,
      { description }
    )
    return response.data.data
  }

  // Проверка доступности AI сервиса
  async checkStatus(): Promise<{ available: boolean; model: string }> {
    const response = await apiClient.get<ApiResponse<{ available: boolean; model: string }>>(
      `${this.basePath}/status`
    )
    return response.data.data
  }
}

export const aiAssistantApi = new AIAssistantApi()
```

### Projects API

```tsx
// api/projects.ts
import { apiClient } from './client'

export interface Project {
  id: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  startDate: string
  endDate?: string
  budget: number
  client: {
    id: string
    name: string
    contact: string
  }
  estimates: Estimate[]
  createdAt: string
  updatedAt: string
}

class ProjectsApi {
  private readonly basePath = '/projects'

  async getAll(): Promise<Project[]> {
    const response = await apiClient.get<ApiResponse<Project[]>>(this.basePath)
    return response.data.data
  }

  async getById(id: string): Promise<Project> {
    const response = await apiClient.get<ApiResponse<Project>>(`${this.basePath}/${id}`)
    return response.data.data
  }

  async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>(this.basePath, data)
    return response.data.data
  }

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const response = await apiClient.put<ApiResponse<Project>>(`${this.basePath}/${id}`, data)
    return response.data.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }

  // Получение активных проектов
  async getActive(): Promise<Project[]> {
    const response = await apiClient.get<ApiResponse<Project[]>>(`${this.basePath}/active`)
    return response.data.data
  }

  // Получение проектов с сметами
  async getWithEstimates(): Promise<Project[]> {
    const response = await apiClient.get<ApiResponse<Project[]>>(`${this.basePath}?include=estimates`)
    return response.data.data
  }
}

export const projectsApi = new ProjectsApi()
```

## React Query Hooks

### Estimates Hooks

```tsx
// hooks/api/useEstimates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { estimatesApi } from '../../api/estimates'
import { toast } from '../../components/ui/Toast'

// Получение всех смет
export function useEstimates(filters?: EstimateFilters) {
  return useQuery({
    queryKey: ['estimates', filters],
    queryFn: () => estimatesApi.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Получение сметы по ID
export function useEstimate(id: string) {
  return useQuery({
    queryKey: ['estimate', id],
    queryFn: () => estimatesApi.getById(id),
    enabled: !!id,
  })
}

// Создание сметы
export function useCreateEstimate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: estimatesApi.create,
    onSuccess: (newEstimate) => {
      // Обновляем список смет
      queryClient.invalidateQueries(['estimates'])

      // Добавляем новую смету в кэш
      queryClient.setQueryData(['estimate', newEstimate.id], newEstimate)

      toast.success('Смета создана успешно!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при создании сметы')
    },
  })
}

// Обновление сметы
export function useUpdateEstimate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EstimateUpdateData }) =>
      estimatesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries(['estimate', id])

      // Сохраняем предыдущие данные
      const previousEstimate = queryClient.getQueryData(['estimate', id])

      // Оптимистично обновляем
      queryClient.setQueryData(['estimate', id], (old: any) => ({
        ...old,
        ...data,
        updatedAt: new Date().toISOString(),
      }))

      return { previousEstimate, id }
    },
    onError: (error, variables, context) => {
      // Откатываем изменения
      if (context?.previousEstimate) {
        queryClient.setQueryData(['estimate', context.id], context.previousEstimate)
      }
      toast.error('Ошибка при обновлении сметы')
    },
    onSuccess: () => {
      toast.success('Смета обновлена успешно!')
    },
    onSettled: (data, error, variables) => {
      // Обновляем кэш
      queryClient.invalidateQueries(['estimate', variables.id])
      queryClient.invalidateQueries(['estimates'])
    },
  })
}

// Удаление сметы
export function useDeleteEstimate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: estimatesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['estimates'])
      toast.success('Смета удалена')
    },
    onError: () => {
      toast.error('Ошибка при удалении сметы')
    },
  })
}

// Дублирование сметы
export function useDuplicateEstimate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: estimatesApi.duplicate,
    onSuccess: (duplicatedEstimate) => {
      queryClient.invalidateQueries(['estimates'])
      queryClient.setQueryData(['estimate', duplicatedEstimate.id], duplicatedEstimate)
      toast.success('Смета продублирована')
    },
    onError: () => {
      toast.error('Ошибка при дублировании сметы')
    },
  })
}

// Экспорт сметы
export function useExportEstimate() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'pdf' | 'excel' }) =>
      estimatesApi.export(id, format),
    onSuccess: (blob, variables) => {
      // Создаем ссылку для скачивания
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `estimate.${variables.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Файл загружен')
    },
    onError: () => {
      toast.error('Ошибка при экспорте')
    },
  })
}
```

### AI Assistant Hooks

```tsx
// hooks/api/useAIAssistant.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiAssistantApi } from '../../api/aiAssistant'

export function useChatHistory() {
  return useQuery({
    queryKey: ['ai-chat-history'],
    queryFn: aiAssistantApi.getChatHistory,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ message, context }: { message: string; context?: any }) =>
      aiAssistantApi.sendMessage(message, context),
    onMutate: async ({ message }) => {
      // Оптимистично добавляем сообщение пользователя
      const optimisticMessage: AIChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      }

      queryClient.setQueryData(['ai-chat-history'], (old: AIChatMessage[] = []) => [
        ...old,
        optimisticMessage,
      ])

      return { optimisticMessage }
    },
    onSuccess: (response) => {
      // Добавляем ответ ассистента
      queryClient.setQueryData(['ai-chat-history'], (old: AIChatMessage[] = []) => [
        ...old,
        response,
      ])
    },
    onError: (error, variables, context) => {
      // Удаляем оптимистичное сообщение при ошибке
      if (context?.optimisticMessage) {
        queryClient.setQueryData(['ai-chat-history'], (old: AIChatMessage[] = []) =>
          old.filter(msg => msg.id !== context.optimisticMessage.id)
        )
      }
      toast.error('Ошибка отправки сообщения')
    },
  })
}

export function useAnalyzeEstimate() {
  return useMutation({
    mutationFn: aiAssistantApi.analyzeEstimate,
    onSuccess: (analysis) => {
      toast.success('Анализ сметы завершен')
    },
    onError: () => {
      toast.error('Ошибка при анализе сметы')
    },
  })
}

export function useAIStatus() {
  return useQuery({
    queryKey: ['ai-status'],
    queryFn: aiAssistantApi.checkStatus,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
```

## Error Handling

### Типизированные ошибки

```tsx
// types/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends Error {
  constructor(message = 'Ошибка сети') {
    super(message)
    this.name = 'NetworkError'
  }
}
```

### Error Boundary

```tsx
// components/ErrorBoundary.tsx
import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Отправка ошибки в Sentry или другой сервис
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback
      return <Fallback error={this.state.error!} retry={this.retry} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Что-то пошло не так</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button onClick={retry}>Попробовать снова</Button>
    </div>
  )
}
```

## Тестирование API

### Mock Service Worker (MSW)

```tsx
// mocks/handlers.ts
import { rest } from 'msw'
import { mockEstimates } from './data'

export const handlers = [
  // Получение смет
  rest.get('/api/estimates', (req, res, ctx) => {
    const search = req.url.searchParams.get('search')
    const status = req.url.searchParams.get('status')

    let filteredEstimates = mockEstimates

    if (search) {
      filteredEstimates = filteredEstimates.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status) {
      filteredEstimates = filteredEstimates.filter(e => e.status === status)
    }

    return res(
      ctx.status(200),
      ctx.json({
        data: filteredEstimates,
        success: true,
      })
    )
  }),

  // Создание сметы
  rest.post('/api/estimates', async (req, res, ctx) => {
    const data = await req.json()
    const newEstimate = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return res(
      ctx.status(201),
      ctx.json({
        data: newEstimate,
        success: true,
        message: 'Смета создана успешно',
      })
    )
  }),

  // Ошибка сервера (для тестирования)
  rest.get('/api/estimates/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        code: 'INTERNAL_ERROR',
      })
    )
  }),
]
```

### Тесты хуков

```tsx
// hooks/__tests__/useEstimates.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEstimates } from '../api/useEstimates'
import { server } from '../../mocks/server'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useEstimates', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  test('должен загружать сметы успешно', async () => {
    const { result } = renderHook(() => useEstimates(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toHaveLength(3)
    expect(result.current.data?.[0]).toHaveProperty('name')
  })

  test('должен фильтровать сметы по статусу', async () => {
    const { result } = renderHook(
      () => useEstimates({ status: ['approved'] }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.every(e => e.status === 'approved')).toBe(true)
  })
})
```

Данная архитектура API интеграции обеспечивает:

- **Type Safety** - полная типизация всех запросов
- **Error Handling** - централизованная обработка ошибок
- **Performance** - кэширование и оптимизация запросов
- **Developer Experience** - удобные хуки и автокомплит
- **Testability** - легкое тестирование с моками
- **Reliability** - автоматические retry и fallback состояния
