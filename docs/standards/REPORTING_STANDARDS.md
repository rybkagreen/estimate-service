# Стандарты отчетности Estimate Service

## Общие принципы

### Цели отчетности
- **Прозрачность**: Все данные должны быть понятными и доступными
- **Точность**: Информация должна быть достоверной и актуальной
- **Полнота**: Отчеты должны содержать всю необходимую информацию
- **Своевременность**: Данные должны предоставляться в срок
- **Сопоставимость**: Отчеты должны быть сравнимы во времени

### Принципы визуализации
- Используйте понятные графики и диаграммы
- Избегайте информационной перегрузки
- Выделяйте ключевые показатели
- Обеспечивайте интерактивность где это возможно
- Поддерживайте единый стиль оформления

## Типы отчетов

### 1. Операционные отчеты

#### Ежедневные отчеты
- **Активность пользователей**: количество активных пользователей, время работы
- **Создание смет**: количество созданных и обновленных смет
- **Использование ИИ**: количество запросов к ИИ-ассистенту
- **Производительность системы**: время отклика, ошибки

#### Еженедельные отчеты
- **Сводка по проектам**: статус проектов, выполнение планов
- **Качество данных**: точность смет, соответствие ФСБЦ-2022
- **Пользовательская активность**: топ пользователей, новые регистрации

#### Ежемесячные отчеты
- **Финансовые показатели**: общая стоимость смет, экономия от использования системы
- **Тренды и аналитика**: изменения в ценах, популярные виды работ
- **Эффективность**: время составления смет, использование шаблонов

### 2. Аналитические отчеты

#### Анализ трендов цен
```typescript
interface PriceTrendReport {
  period: {
    from: Date;
    to: Date;
  };
  category: string;
  region: string;
  trends: {
    workItemCode: string;
    workItemName: string;
    priceHistory: {
      date: Date;
      price: number;
      change: number; // в процентах
    }[];
    forecast: {
      nextMonth: number;
      nextQuarter: number;
      confidence: number; // от 0 до 1
    };
  }[];
  summary: {
    averageIncrease: number;
    mostVolatileItems: string[];
    stableItems: string[];
  };
}
```

#### Региональный анализ
```typescript
interface RegionalAnalysisReport {
  comparisonDate: Date;
  regions: {
    code: string;
    name: string;
    coefficient: number;
    averageCosts: {
      category: string;
      cost: number;
      rank: number; // место среди регионов
    }[];
  }[];
  insights: {
    cheapestRegion: string;
    mostExpensiveRegion: string;
    biggestDifferences: {
      category: string;
      difference: number; // в процентах
    }[];
  };
}
```

### 3. Финансовые отчеты

#### Сводный финансовый отчет
```typescript
interface FinancialSummaryReport {
  period: {
    from: Date;
    to: Date;
  };
  totalValue: {
    estimates: number;
    projects: number;
    averageEstimate: number;
  };
  breakdown: {
    byCategory: {
      category: string;
      amount: number;
      percentage: number;
    }[];
    byRegion: {
      region: string;
      amount: number;
      percentage: number;
    }[];
    byMonth: {
      month: string;
      amount: number;
      growth: number; // процентный рост
    }[];
  };
  kpis: {
    estimateAccuracy: number; // процент точности
    timeToComplete: number; // среднее время в часах
    costSavings: number; // экономия от использования ИИ
  };
}
```

### 4. Отчеты по качеству

#### Отчет по точности смет
```typescript
interface EstimateAccuracyReport {
  period: {
    from: Date;
    to: Date;
  };
  overall: {
    totalEstimates: number;
    completedProjects: number;
    averageAccuracy: number;
    medianAccuracy: number;
  };
  byCategory: {
    category: string;
    accuracy: number;
    sampleSize: number;
    commonIssues: string[];
  }[];
  improvements: {
    aiRecommendations: number; // количество принятых рекомендаций ИИ
    templateUsage: number; // процент использования шаблонов
    userTraining: number; // количество обученных пользователей
  };
}
```

## Форматы отчетов

### 1. Dashboard Reports

#### Реальное время
- **Метрики производительности**: текущая нагрузка, время отклика
- **Активные пользователи**: количество онлайн пользователей
- **Системные алерты**: критические уведомления

#### Ключевые показатели (KPI)
```typescript
interface KPIDashboard {
  systemHealth: {
    uptime: number; // процент доступности
    responseTime: number; // миллисекунды
    errorRate: number; // процент ошибок
    activeUsers: number;
  };
  business: {
    estimatesCreated: number;
    totalValue: number;
    aiInteractions: number;
    userSatisfaction: number; // от 1 до 5
  };
  trends: {
    userGrowth: number; // процент роста
    usageGrowth: number;
    revenueGrowth: number;
  };
}
```

### 2. PDF Reports

#### Структура PDF отчета
```
1. Титульная страница
   - Название отчета
   - Период
   - Дата создания
   - Логотип компании

2. Исполнительное резюме (1 страница)
   - Ключевые выводы
   - Основные метрики
   - Рекомендации

3. Детальная аналитика (2-5 страниц)
   - Графики и диаграммы
   - Таблицы с данными
   - Комментарии и объяснения

4. Приложения
   - Методология расчетов
   - Источники данных
   - Глоссарий терминов
```

#### Шаблон PDF отчета
```typescript
interface PDFReportTemplate {
  header: {
    logo: string;
    title: string;
    subtitle: string;
    period: string;
    generatedAt: Date;
  };
  sections: {
    id: string;
    title: string;
    content: {
      type: 'text' | 'chart' | 'table' | 'image';
      data: any;
      formatting: {
        fontSize: number;
        color: string;
        alignment: 'left' | 'center' | 'right';
      };
    }[];
  }[];
  footer: {
    pageNumbers: boolean;
    confidential: boolean;
    generatedBy: string;
  };
}
```

### 3. Excel Reports

#### Структура Excel отчета
- **Лист "Сводка"**: основные показатели и выводы
- **Лист "Данные"**: детальные данные для анализа
- **Лист "Графики"**: визуализация данных
- **Лист "Методология"**: объяснение расчетов

#### Форматирование Excel
```typescript
interface ExcelReportFormat {
  headers: {
    backgroundColor: '#2E75B6';
    fontColor: '#FFFFFF';
    fontSize: 12;
    bold: true;
  };
  data: {
    alternatingRows: true;
    numberFormat: {
      currency: '#,##0.00₽';
      percentage: '0.00%';
      date: 'DD.MM.YYYY';
    };
  };
  charts: {
    type: 'column' | 'line' | 'pie' | 'scatter';
    colors: ['#2E75B6', '#70AD47', '#FFC000', '#E15759'];
    dataLabels: boolean;
  };
}
```

## Автоматизация отчетности

### 1. Планировщик отчетов

```typescript
// src/reports/report-scheduler.service.ts
@Injectable()
export class ReportSchedulerService {
  constructor(
    private readonly reportService: ReportService,
    private readonly emailService: EmailService,
  ) {}

  @Cron('0 9 * * 1-5') // Будни в 9:00
  async generateDailyReports() {
    const reports = await this.reportService.generateDailyOperationalReport();
    await this.distributeReports(reports, 'daily');
  }

  @Cron('0 10 * * 1') // Понедельник в 10:00
  async generateWeeklyReports() {
    const reports = await this.reportService.generateWeeklyAnalyticsReport();
    await this.distributeReports(reports, 'weekly');
  }

  @Cron('0 8 1 * *') // 1 число месяца в 8:00
  async generateMonthlyReports() {
    const reports = await this.reportService.generateMonthlyFinancialReport();
    await this.distributeReports(reports, 'monthly');
  }

  private async distributeReports(reports: any[], frequency: string) {
    const recipients = await this.getReportRecipients(frequency);

    for (const recipient of recipients) {
      await this.emailService.sendReportEmail({
        to: recipient.email,
        reports,
        frequency,
      });
    }
  }
}
```

### 2. Настройки уведомлений

```typescript
interface ReportSubscription {
  userId: number;
  reportTypes: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  format: 'email' | 'dashboard' | 'api';
  filters: {
    regions?: string[];
    categories?: string[];
    projects?: number[];
  };
  delivery: {
    email?: string;
    webhook?: string;
    slackChannel?: string;
  };
}
```

### 3. API для получения отчетов

```typescript
// src/reports/reports.controller.ts
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('financial/summary')
  @RequirePermissions(Permission.REPORTS_FINANCIAL)
  async getFinancialSummary(
    @Query() query: FinancialReportQuery,
  ): Promise<FinancialSummaryReport> {
    return this.reportsService.generateFinancialSummary(query);
  }

  @Get('analytics/trends')
  @RequirePermissions(Permission.REPORTS_ANALYTICS)
  async getPriceTrends(
    @Query() query: PriceTrendQuery,
  ): Promise<PriceTrendReport> {
    return this.reportsService.generatePriceTrendReport(query);
  }

  @Get('quality/accuracy')
  @RequirePermissions(Permission.REPORTS_QUALITY)
  async getAccuracyReport(
    @Query() query: AccuracyReportQuery,
  ): Promise<EstimateAccuracyReport> {
    return this.reportsService.generateAccuracyReport(query);
  }

  @Post('custom')
  @RequirePermissions(Permission.REPORTS_CUSTOM)
  async generateCustomReport(
    @Body() config: CustomReportConfig,
  ): Promise<{ reportId: string; downloadUrl: string }> {
    return this.reportsService.generateCustomReport(config);
  }
}
```

## Стандарты визуализации

### 1. Цветовая схема

#### Основные цвета
- **Синий** (#2E75B6): Основной цвет для графиков
- **Зеленый** (#70AD47): Положительные показатели, рост
- **Красный** (#E15759): Отрицательные показатели, снижение
- **Оранжевый** (#FFC000): Предупреждения, важные данные
- **Серый** (#6C757D): Вспомогательная информация

#### Применение цветов
```typescript
const chartColors = {
  primary: '#2E75B6',
  success: '#70AD47',
  danger: '#E15759',
  warning: '#FFC000',
  info: '#6F9CEB',
  light: '#F8F9FA',
  dark: '#343A40',
};

const gradients = {
  blue: ['#2E75B6', '#6F9CEB'],
  green: ['#70AD47', '#A4D070'],
  red: ['#E15759', '#F08A8C'],
};
```

### 2. Типы графиков

#### Временные ряды
```typescript
interface TimeSeriesChart {
  type: 'line';
  data: {
    labels: string[]; // даты
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension: 0.1; // сглаживание линии
    }[];
  };
  options: {
    responsive: true;
    scales: {
      x: { type: 'time' };
      y: { beginAtZero: true };
    };
  };
}
```

#### Сравнения
```typescript
interface ComparisonChart {
  type: 'bar' | 'column';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
    }[];
  };
  options: {
    indexAxis: 'x' | 'y';
    plugins: {
      legend: { display: boolean };
      datalabels: { display: boolean };
    };
  };
}
```

#### Доли и пропорции
```typescript
interface ProportionChart {
  type: 'pie' | 'doughnut';
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderWidth: number;
    }[];
  };
  options: {
    plugins: {
      legend: { position: 'right' };
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}%`;
        };
      };
    };
  };
}
```

### 3. Таблицы данных

#### Стандартное форматирование
```typescript
interface TableFormat {
  headers: {
    backgroundColor: string;
    color: string;
    fontWeight: 'bold';
    textAlign: 'center';
  };
  rows: {
    alternateBackground: boolean;
    hoverEffect: boolean;
    borderBottom: string;
  };
  cells: {
    padding: string;
    fontSize: string;
    textAlign: 'left' | 'center' | 'right';
  };
  numbers: {
    decimalPlaces: number;
    thousandsSeparator: string;
    currencySymbol: string;
  };
}
```

## Шаблоны отчетов

### 1. Шаблон ежемесячного отчета

```markdown
# Ежемесячный отчет по системе Estimate Service
## {месяц} {год}

### Исполнительное резюме
- Общее количество смет: {totalEstimates}
- Общая стоимость проектов: {totalValue} ₽
- Активных пользователей: {activeUsers}
- Средняя точность смет: {accuracy}%

### Ключевые показатели
| Показатель | Значение | Изменение |
|------------|----------|-----------|
| Новые сметы | {newEstimates} | {growth}% |
| Завершенные проекты | {completedProjects} | {completedGrowth}% |
| Использование ИИ | {aiUsage} | {aiGrowth}% |

### Тренды и аналитика
[График изменения цен по категориям]
[Региональное сравнение стоимости]

### Рекомендации
1. {recommendation1}
2. {recommendation2}
3. {recommendation3}
```

### 2. Шаблон аналитического отчета

```typescript
interface AnalyticsReportTemplate {
  title: string;
  period: { from: Date; to: Date };
  sections: {
    overview: {
      kpis: KPISection[];
      summary: string;
    };
    analysis: {
      charts: ChartSection[];
      insights: string[];
    };
    recommendations: {
      priority: 'high' | 'medium' | 'low';
      action: string;
      impact: string;
      timeline: string;
    }[];
    appendix: {
      methodology: string;
      dataSources: string[];
      assumptions: string[];
    };
  };
}
```

## Качество данных в отчетах

### 1. Валидация данных

```typescript
// src/reports/data-validator.service.ts
@Injectable()
export class DataValidatorService {
  validateReportData(data: any[], reportType: string): ValidationResult {
    const validations = [
      this.checkCompleteness(data),
      this.checkConsistency(data),
      this.checkAccuracy(data, reportType),
      this.checkTimeliness(data),
    ];

    return {
      isValid: validations.every(v => v.isValid),
      errors: validations.filter(v => !v.isValid),
      warnings: this.generateWarnings(data, reportType),
    };
  }

  private checkCompleteness(data: any[]): ValidationResult {
    const requiredFields = ['id', 'createdAt', 'updatedAt'];
    const missingFields = data.filter(item =>
      requiredFields.some(field => !item[field])
    );

    return {
      isValid: missingFields.length === 0,
      message: missingFields.length > 0
        ? `Missing required fields in ${missingFields.length} records`
        : 'All required fields present',
    };
  }

  private checkConsistency(data: any[]): ValidationResult {
    // Проверка на логические противоречия
    const inconsistencies = data.filter(item =>
      item.totalCost < 0 ||
      item.createdAt > item.updatedAt ||
      item.quantity < 0
    );

    return {
      isValid: inconsistencies.length === 0,
      message: inconsistencies.length > 0
        ? `Found ${inconsistencies.length} inconsistent records`
        : 'Data is consistent',
    };
  }
}
```

### 2. Метаданные отчетов

```typescript
interface ReportMetadata {
  id: string;
  name: string;
  version: string;
  generatedAt: Date;
  generatedBy: string;
  dataSource: {
    database: string;
    lastUpdated: Date;
    recordCount: number;
  };
  filters: {
    period: { from: Date; to: Date };
    regions: string[];
    categories: string[];
  };
  processing: {
    duration: number; // миллисекунды
    cacheUsed: boolean;
    dataQuality: {
      completeness: number; // процент
      accuracy: number;
      timeliness: number;
    };
  };
  distribution: {
    format: string[];
    recipients: string[];
    deliveredAt: Date[];
  };
}
```

## Безопасность отчетов

### 1. Контроль доступа

```typescript
// src/reports/report-security.service.ts
@Injectable()
export class ReportSecurityService {
  async checkReportAccess(
    userId: number,
    reportType: string,
    filters: any
  ): Promise<boolean> {
    const user = await this.userService.findById(userId);
    const permissions = await this.rbacService.getUserPermissions(userId);

    // Проверка базовых разрешений
    if (!permissions.includes(`reports:${reportType}:read`)) {
      return false;
    }

    // Проверка доступа к данным
    if (filters.regions && !this.checkRegionAccess(user, filters.regions)) {
      return false;
    }

    if (filters.projects && !this.checkProjectAccess(user, filters.projects)) {
      return false;
    }

    return true;
  }

  private anonymizeFinancialData(data: any[], userRole: string): any[] {
    if (userRole === 'viewer') {
      return data.map(item => ({
        ...item,
        totalCost: this.maskAmount(item.totalCost),
        detailedCosts: undefined,
      }));
    }
    return data;
  }

  private maskAmount(amount: number): string {
    return amount > 1000000 ? '> 1M ₽' : '< 1M ₽';
  }
}
```

### 2. Аудит доступа к отчетам

```typescript
interface ReportAccessLog {
  userId: number;
  reportType: string;
  reportId: string;
  action: 'view' | 'download' | 'share';
  timestamp: Date;
  ip: string;
  userAgent: string;
  filters: any;
  success: boolean;
  errorMessage?: string;
}
```

## Интеграция с внешними системами

### 1. Экспорт в BI системы

```typescript
// src/reports/bi-export.service.ts
@Injectable()
export class BIExportService {
  async exportToTableau(reportData: any[], config: TableauConfig): Promise<string> {
    const tableauData = this.transformForTableau(reportData);
    return this.tableauClient.publish(tableauData, config);
  }

  async exportToPowerBI(reportData: any[], config: PowerBIConfig): Promise<string> {
    const powerBIData = this.transformForPowerBI(reportData);
    return this.powerBIClient.publish(powerBIData, config);
  }

  private transformForTableau(data: any[]): any {
    return {
      schema: this.generateTableauSchema(data),
      data: data.map(item => this.flattenObject(item)),
    };
  }
}
```

### 2. API для внешних потребителей

```typescript
@Controller('api/v1/reports')
@UseGuards(ApiKeyGuard)
export class ExternalReportsController {
  @Get('financial/summary')
  @ApiOperation({ summary: 'Get financial summary for external systems' })
  async getFinancialSummaryAPI(
    @Query() query: ExternalReportQuery,
    @Headers('x-api-key') apiKey: string,
  ): Promise<StandardAPIResponse<FinancialSummaryReport>> {
    const client = await this.apiKeyService.validateKey(apiKey);
    const data = await this.reportsService.generateFinancialSummary(query);

    return {
      success: true,
      data: this.filterDataByClientPermissions(data, client),
      metadata: {
        generatedAt: new Date(),
        version: '1.0',
        dataVersion: await this.getDataVersion(),
      },
    };
  }
}
```

## Checklist качества отчетов

### Перед публикацией
- [ ] Данные проверены на полноту и актуальность
- [ ] Выполнена валидация всех расчетов
- [ ] Графики и диаграммы читаемы и информативны
- [ ] Соблюден корпоративный стиль
- [ ] Проверены права доступа
- [ ] Добавлены метаданные и источники

### Регулярное обслуживание
- [ ] Еженедельный аудит качества данных
- [ ] Ежемесячная проверка актуальности шаблонов
- [ ] Квартальный обзор эффективности отчетов
- [ ] Полугодовая оптимизация процессов
- [ ] Годовой аудит соответствия стандартам
