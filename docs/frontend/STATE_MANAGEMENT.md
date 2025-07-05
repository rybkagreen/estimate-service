# Состояние и управление данными

## Обзор

Управление состоянием в приложении организовано с использованием современных React паттернов и библиотек. Основные инструменты:

- **TanStack Query** - для server state
- **React Context** - для global client state
- **React Hook Form** - для форм
- **Zustand** - для complex client state (при необходимости)

## Server State (TanStack Query)

### Базовая настройка

```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
    mutations: {
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### Queries

#### Базовые запросы

```tsx
// hooks/useEstimates.ts
import { useQuery } from '@tanstack/react-query'
import { estimatesApi } from '../api/estimates'

export function useEstimates(filters?: EstimateFilters) {
  return useQuery({
    queryKey: ['estimates', filters],
    queryFn: () => estimatesApi.getAll(filters),
    enabled: true, // Запускать сразу
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useEstimate(id: string) {
  return useQuery({
    queryKey: ['estimate', id],
    queryFn: () => estimatesApi.getById(id),
    enabled: !!id, // Запускать только если есть ID
  })
}

// Использование в компоненте
function EstimatesList() {
  const { data: estimates, isLoading, error } = useEstimates()

  if (isLoading) return <Loading />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      {estimates?.map(estimate => (
        <EstimateCard key={estimate.id} estimate={estimate} />
      ))}
    </div>
  )
}
```

#### Зависимые запросы

```tsx
function EstimateDetails({ estimateId }: { estimateId: string }) {
  // Сначала получаем смету
  const { data: estimate } = useEstimate(estimateId)

  // Затем получаем связанные данные
  const { data: materials } = useQuery({
    queryKey: ['materials', estimateId],
    queryFn: () => materialsApi.getByEstimate(estimateId),
    enabled: !!estimate, // Запускать только после получения сметы
  })

  const { data: labor } = useQuery({
    queryKey: ['labor', estimateId],
    queryFn: () => laborApi.getByEstimate(estimateId),
    enabled: !!estimate,
  })

  return (
    <div>
      <EstimateHeader estimate={estimate} />
      <MaterialsList materials={materials} />
      <LaborList labor={labor} />
    </div>
  )
}
```

#### Параллельные запросы

```tsx
function Dashboard() {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['estimates', 'recent'],
        queryFn: () => estimatesApi.getRecent(),
      },
      {
        queryKey: ['projects', 'active'],
        queryFn: () => projectsApi.getActive(),
      },
      {
        queryKey: ['analytics', 'summary'],
        queryFn: () => analyticsApi.getSummary(),
      },
    ],
  })

  const [estimatesQuery, projectsQuery, analyticsQuery] = queries

  const isLoading = queries.some(query => query.isLoading)
  const hasError = queries.some(query => query.error)

  return (
    <div>
      <DashboardStats analytics={analyticsQuery.data} />
      <RecentEstimates estimates={estimatesQuery.data} />
      <ActiveProjects projects={projectsQuery.data} />
    </div>
  )
}
```

### Mutations

#### Базовые мутации

```tsx
// hooks/useEstimateMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { estimatesApi } from '../api/estimates'

export function useCreateEstimate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: estimatesApi.create,
    onSuccess: (newEstimate) => {
      // Обновляем список смет
      queryClient.invalidateQueries(['estimates'])

      // Добавляем новую смету в кэш
      queryClient.setQueryData(
        ['estimate', newEstimate.id],
        newEstimate
      )

      // Показываем уведомление
      toast.success('Смета создана успешно!')
    },
    onError: (error) => {
      toast.error('Ошибка при создании сметы')
      console.error('Create estimate error:', error)
    },
  })
}

export function useUpdateEstimate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EstimateUpdateData }) =>
      estimatesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Отменяем все исходящие запросы для этой сметы
      await queryClient.cancelQueries(['estimate', id])

      // Получаем текущие данные
      const previousEstimate = queryClient.getQueryData(['estimate', id])

      // Оптимистично обновляем
      queryClient.setQueryData(['estimate', id], (old: any) => ({
        ...old,
        ...data,
      }))

      return { previousEstimate }
    },
    onError: (error, variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousEstimate) {
        queryClient.setQueryData(
          ['estimate', variables.id],
          context.previousEstimate
        )
      }
      toast.error('Ошибка при обновлении сметы')
    },
    onSettled: (data, error, variables) => {
      // Всегда обновляем кэш в конце
      queryClient.invalidateQueries(['estimate', variables.id])
    },
  })
}

// Использование в компоненте
function EstimateForm({ estimate }: { estimate?: Estimate }) {
  const createMutation = useCreateEstimate()
  const updateMutation = useUpdateEstimate()

  const handleSubmit = (data: EstimateFormData) => {
    if (estimate?.id) {
      updateMutation.mutate({ id: estimate.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isLoading || updateMutation.isLoading

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button loading={isLoading} type="submit">
        {estimate ? 'Обновить' : 'Создать'}
      </Button>
    </form>
  )
}
```

#### Batch операции

```tsx
export function useBatchDeleteEstimates() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => estimatesApi.batchDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries(['estimates'])
      toast.success('Сметы удалены успешно')
    },
    onError: () => {
      toast.error('Ошибка при удалении смет')
    },
  })
}

// Использование с множественным выбором
function EstimatesTable() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const batchDeleteMutation = useBatchDeleteEstimates()

  const handleBatchDelete = () => {
    if (selectedIds.length > 0) {
      batchDeleteMutation.mutate(selectedIds)
      setSelectedIds([])
    }
  }

  return (
    <div>
      <Button
        onClick={handleBatchDelete}
        disabled={selectedIds.length === 0}
        loading={batchDeleteMutation.isLoading}
      >
        Удалить выбранные ({selectedIds.length})
      </Button>

      <Table
        data={estimates}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  )
}
```

### Infinite Queries

```tsx
export function useInfiniteEstimates(filters?: EstimateFilters) {
  return useInfiniteQuery({
    queryKey: ['estimates', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      estimatesApi.getPage({ page: pageParam, ...filters }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined
    },
  })
}

// Использование с бесконечной прокруткой
function InfiniteEstimatesList() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteEstimates()

  const estimates = data?.pages.flatMap(page => page.items) ?? []

  return (
    <div>
      {estimates.map(estimate => (
        <EstimateCard key={estimate.id} estimate={estimate} />
      ))}

      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          loading={isFetchingNextPage}
        >
          Загрузить еще
        </Button>
      )}
    </div>
  )
}
```

## Client State (React Context)

### Theme Context

```tsx
// contexts/ThemeContext.tsx
interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (dark: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

### Auth Context

```tsx
// contexts/AuthContext.tsx
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'viewer'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      setUser(response.user)
      localStorage.setItem('token', response.token)
    } catch (error) {
      throw new Error('Неверные учетные данные')
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('token')
  }, [])

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false
    return checkUserPermission(user, permission)
  }, [user])

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const user = await authApi.getMe()
          setUser(user)
        } catch {
          localStorage.removeItem('token')
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### App State Context

```tsx
// contexts/AppContext.tsx
interface AppState {
  sidebarOpen: boolean
  activeProject: string | null
  notifications: Notification[]
}

interface AppContextType {
  state: AppState
  setSidebarOpen: (open: boolean) => void
  setActiveProject: (projectId: string | null) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    sidebarOpen: true,
    activeProject: null,
    notifications: [],
  })

  const setSidebarOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, sidebarOpen: open }))
    localStorage.setItem('sidebarOpen', String(open))
  }, [])

  const setActiveProject = useCallback((projectId: string | null) => {
    setState(prev => ({ ...prev, activeProject: projectId }))
    if (projectId) {
      localStorage.setItem('activeProject', projectId)
    } else {
      localStorage.removeItem('activeProject')
    }
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36)
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, { ...notification, id }]
    }))
  }, [])

  const removeNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }))
  }, [])

  return (
    <AppContext.Provider value={{
      state,
      setSidebarOpen,
      setActiveProject,
      addNotification,
      removeNotification
    }}>
      {children}
    </AppContext.Provider>
  )
}
```

## Form State (React Hook Form)

### Базовое использование

```tsx
// components/EstimateForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const estimateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Выберите проект'),
  materials: z.array(z.object({
    id: z.string(),
    quantity: z.number().min(0),
    unitPrice: z.number().min(0),
  })),
})

type EstimateFormData = z.infer<typeof estimateSchema>

export function EstimateForm({ estimate, onSubmit }: {
  estimate?: Estimate
  onSubmit: (data: EstimateFormData) => void
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm<EstimateFormData>({
    resolver: zodResolver(estimateSchema),
    defaultValues: estimate || {
      name: '',
      description: '',
      projectId: '',
      materials: [],
    },
  })

  const materials = watch('materials')
  const totalCost = materials.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Название" error={errors.name?.message} required>
        <Input {...register('name')} placeholder="Введите название сметы" />
      </FormField>

      <FormField label="Описание" error={errors.description?.message}>
        <Textarea {...register('description')} rows={3} />
      </FormField>

      <FormField label="Проект" error={errors.projectId?.message} required>
        <Controller
          name="projectId"
          control={control}
          render={({ field }) => (
            <ProjectSelect
              value={field.value}
              onChange={field.onChange}
              error={!!errors.projectId}
            />
          )}
        />
      </FormField>

      <MaterialsFieldArray control={control} />

      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold">
          Общая стоимость: {formatCurrency(totalCost)}
        </p>

        <Button type="submit" loading={isSubmitting}>
          Сохранить смету
        </Button>
      </div>
    </form>
  )
}
```

### Field Arrays

```tsx
// components/MaterialsFieldArray.tsx
import { useFieldArray } from 'react-hook-form'

export function MaterialsFieldArray({ control }: { control: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'materials',
  })

  const addMaterial = () => {
    append({
      id: '',
      quantity: 1,
      unitPrice: 0,
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Материалы</h3>
        <Button type="button" onClick={addMaterial} variant="secondary">
          Добавить материал
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-4 gap-4 mb-4">
          <Controller
            name={`materials.${index}.id`}
            control={control}
            render={({ field }) => (
              <MaterialSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Выберите материал"
              />
            )}
          />

          <Controller
            name={`materials.${index}.quantity`}
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="Количество"
              />
            )}
          />

          <Controller
            name={`materials.${index}.unitPrice`}
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="Цена за единицу"
              />
            )}
          />

          <Button
            type="button"
            variant="error"
            size="sm"
            onClick={() => remove(index)}
          >
            Удалить
          </Button>
        </div>
      ))}
    </div>
  )
}
```

## Custom Hooks

### Локальное состояние

```tsx
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}

// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// hooks/useToggle.ts
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse, setValue }
}
```

### Бизнес-логика

```tsx
// hooks/useEstimateCalculations.ts
export function useEstimateCalculations(estimate: Estimate) {
  return useMemo(() => {
    const materialsCost = estimate.materials.reduce(
      (sum, material) => sum + (material.quantity * material.unitPrice),
      0
    )

    const laborCost = estimate.labor.reduce(
      (sum, labor) => sum + (labor.hours * labor.hourlyRate),
      0
    )

    const subtotal = materialsCost + laborCost
    const tax = subtotal * 0.2 // 20% НДС
    const total = subtotal + tax

    const profitMargin = estimate.profitMargin || 0
    const finalTotal = total * (1 + profitMargin / 100)

    return {
      materialsCost,
      laborCost,
      subtotal,
      tax,
      total,
      profitMargin,
      finalTotal,
    }
  }, [estimate])
}

// hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useAuth()

  return useMemo(() => ({
    canCreateEstimate: user?.role === 'admin' || user?.role === 'user',
    canEditEstimate: user?.role === 'admin' || user?.role === 'user',
    canDeleteEstimate: user?.role === 'admin',
    canExportEstimate: true,
    canManageUsers: user?.role === 'admin',
  }), [user])
}
```

## Оптимизация производительности

### Мемоизация

```tsx
// Мемоизация вычислений
const expensiveCalculation = useMemo(() => {
  return calculateComplexMetrics(data)
}, [data])

// Мемоизация коллбэков
const handleSubmit = useCallback((formData: FormData) => {
  onSubmit(formData)
}, [onSubmit])

// Мемоизация компонентов
const MemoizedEstimateCard = memo(EstimateCard)
```

### Ленивая загрузка

```tsx
// Lazy loading компонентов
const EstimateDetails = lazy(() => import('./EstimateDetails'))
const ProjectSettings = lazy(() => import('./ProjectSettings'))

// Использование с Suspense
<Suspense fallback={<Loading />}>
  <EstimateDetails id={estimateId} />
</Suspense>
```

### Оптимизация re-renders

```tsx
// Разделение состояния для уменьшения re-renders
function EstimateForm() {
  // Отдельное состояние для формы
  const [formData, setFormData] = useState(initialData)

  // Отдельное состояние для UI
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Мемоизированные обработчики
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  return (
    <Form data={formData} onChange={handleFieldChange} />
  )
}
```

Эта архитектура состояния обеспечивает:
- **Производительность** через оптимизацию запросов и кэширование
- **Типизацию** всех данных и операций
- **Переиспользование** логики через кастомные хуки
- **Отзывчивость** UI через оптимистичные обновления
- **Надежность** через обработку ошибок и fallback состояния
