# 📊 Анализ смет с помощью ИИ

## Обзор

ИИ-ассистент предоставляет мощные возможности для анализа строительных смет, включая проверку корректности расценок, выявление аномалий, оптимизацию затрат и соответствие стандартам ФСБЦ-2022.

## 🎯 Возможности анализа

### 1. Базовый анализ сметы

```typescript
interface EstimateAnalysisRequest {
  estimateId?: string;           // ID существующей сметы
  estimateContent?: string;      // Или текстовое содержание
  analysisType: AnalysisType;    // Тип анализа
  options?: AnalysisOptions;     // Дополнительные параметры
}

enum AnalysisType {
  BASIC = 'basic',               // Базовая проверка
  DETAILED = 'detailed',         // Детальный анализ
  OPTIMIZATION = 'optimization',  // Поиск оптимизаций
  COMPLIANCE = 'compliance',      // Проверка соответствия
  COMPARATIVE = 'comparative'     // Сравнительный анализ
}
```

### 2. Результаты анализа

```typescript
interface EstimateAnalysisResult {
  summary: AnalysisSummary;
  issues: Issue[];
  recommendations: Recommendation[];
  metrics: AnalysisMetrics;
  confidence: ConfidenceScore;
}

interface AnalysisSummary {
  totalCost: number;
  itemsCount: number;
  issuesFound: number;
  potentialSavings: number;
  complianceScore: number;
  overallAssessment: string;
}
```

## 📋 Типы проверок

### 1. Проверка расценок

```typescript
// Сервис проверки расценок
export class RateValidationService {
  async validateRates(estimate: Estimate): Promise<RateValidationResult> {
    const results: RateIssue[] = [];
    
    for (const item of estimate.items) {
      // Проверка существования расценки в ФСБЦ
      const fsbcRate = await this.findFSBCRate(item.code);
      
      if (!fsbcRate) {
        results.push({
          type: 'RATE_NOT_FOUND',
          itemId: item.id,
          code: item.code,
          severity: 'high',
          message: `Расценка ${item.code} не найдена в базе ФСБЦ-2022`
        });
        continue;
      }
      
      // Проверка отклонения цены
      const priceDeviation = this.calculateDeviation(
        item.unitPrice, 
        fsbcRate.basePrice
      );
      
      if (Math.abs(priceDeviation) > 0.2) { // 20% отклонение
        results.push({
          type: 'PRICE_DEVIATION',
          itemId: item.id,
          code: item.code,
          severity: priceDeviation > 0 ? 'medium' : 'high',
          message: `Цена отклоняется на ${(priceDeviation * 100).toFixed(1)}%`,
          suggestedPrice: fsbcRate.basePrice
        });
      }
      
      // Проверка единиц измерения
      if (item.unit !== fsbcRate.unit) {
        results.push({
          type: 'UNIT_MISMATCH',
          itemId: item.id,
          code: item.code,
          severity: 'medium',
          message: `Неверная единица измерения: ${item.unit}, должно быть ${fsbcRate.unit}`
        });
      }
    }
    
    return { issues: results, validated: estimate.items.length };
  }
}
```

### 2. Выявление дублирований

```typescript
// Алгоритм поиска дублирований
async function findDuplicates(items: EstimateItem[]): Promise<DuplicationReport> {
  const duplicates: Map<string, EstimateItem[]> = new Map();
  const similar: SimilarItem[] = [];
  
  // Точные дубликаты по коду
  items.forEach(item => {
    const key = item.code;
    if (!duplicates.has(key)) {
      duplicates.set(key, []);
    }
    duplicates.get(key)!.push(item);
  });
  
  // Семантически похожие позиции
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const similarity = await calculateSemanticSimilarity(
        items[i].description,
        items[j].description
      );
      
      if (similarity > 0.85) { // 85% схожести
        similar.push({
          item1: items[i],
          item2: items[j],
          similarity,
          potentialDuplicate: true
        });
      }
    }
  }
  
  return {
    exactDuplicates: Array.from(duplicates.entries())
      .filter(([_, items]) => items.length > 1),
    similarItems: similar
  };
}
```

### 3. Анализ структуры сметы

```typescript
// Проверка полноты и структуры
class EstimateStructureAnalyzer {
  async analyzeStructure(estimate: Estimate): Promise<StructureAnalysis> {
    const issues: StructureIssue[] = [];
    const recommendations: string[] = [];
    
    // Проверка обязательных разделов
    const requiredSections = this.getRequiredSections(estimate.type);
    const missingSections = requiredSections.filter(
      section => !estimate.sections.some(s => s.type === section)
    );
    
    if (missingSections.length > 0) {
      issues.push({
        type: 'MISSING_SECTIONS',
        severity: 'high',
        sections: missingSections,
        message: `Отсутствуют обязательные разделы: ${missingSections.join(', ')}`
      });
    }
    
    // Проверка логической последовательности работ
    const sequenceIssues = await this.checkWorkSequence(estimate);
    issues.push(...sequenceIssues);
    
    // Анализ накладных расходов
    const overheadAnalysis = this.analyzeOverheads(estimate);
    if (overheadAnalysis.issues.length > 0) {
      issues.push(...overheadAnalysis.issues);
    }
    
    // Проверка коэффициентов
    const coefficientIssues = await this.validateCoefficients(estimate);
    issues.push(...coefficientIssues);
    
    return {
      issues,
      recommendations,
      completeness: this.calculateCompleteness(estimate),
      structureScore: this.calculateStructureScore(issues)
    };
  }
}
```

## 🤖 ИИ-анализ

### 1. Семантический анализ описаний

```typescript
// Использование DeepSeek для анализа
async function analyzeDescriptions(
  items: EstimateItem[]
): Promise<DescriptionAnalysis> {
  const prompt = `
    Проанализируй описания работ в смете:
    
    ${items.map(item => `- ${item.code}: ${item.description}`).join('\n')}
    
    Найди:
    1. Неточные или неполные описания
    2. Несоответствия кодам ФСБЦ
    3. Пропущенные важные детали
    4. Рекомендации по улучшению
  `;
  
  const analysis = await deepSeekService.analyze(prompt);
  
  return parseAnalysisResponse(analysis);
}
```

### 2. Контекстуальная оптимизация

```typescript
// ИИ-оптимизация на основе контекста проекта
interface OptimizationContext {
  projectType: string;
  region: string;
  season: 'summer' | 'winter';
  timeline: number; // дней
  budget: number;
  priorities: ('cost' | 'quality' | 'speed')[];
}

async function optimizeEstimate(
  estimate: Estimate,
  context: OptimizationContext
): Promise<OptimizationResult> {
  // Анализ через ИИ с учетом контекста
  const suggestions = await deepSeekService.generateOptimizations({
    estimate,
    context,
    targetSavings: 0.15, // 15% экономии
    preserveQuality: true
  });
  
  // Валидация предложений
  const validatedSuggestions = await validateOptimizations(
    suggestions,
    estimate
  );
  
  return {
    suggestions: validatedSuggestions,
    potentialSavings: calculateSavings(validatedSuggestions),
    impactAnalysis: analyzeImpact(validatedSuggestions, context)
  };
}
```

## 📊 Визуализация результатов

### 1. Дашборд анализа

```tsx
// components/analysis/AnalysisDashboard.tsx
const AnalysisDashboard: React.FC<{ analysis: EstimateAnalysis }> = ({ 
  analysis 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Общая статистика */}
      <StatCard
        title="Общая стоимость"
        value={formatCurrency(analysis.summary.totalCost)}
        trend={analysis.summary.costTrend}
        icon={<CurrencyIcon />}
      />
      
      {/* График проблем по категориям */}
      <IssuesChart
        data={groupIssuesByCategory(analysis.issues)}
        onCategoryClick={handleCategoryFilter}
      />
      
      {/* Потенциальная экономия */}
      <SavingsBreakdown
        total={analysis.summary.potentialSavings}
        categories={analysis.savingsByCategory}
        recommendations={analysis.topRecommendations}
      />
      
      {/* Соответствие стандартам */}
      <ComplianceScore
        score={analysis.summary.complianceScore}
        details={analysis.complianceDetails}
        requirements={analysis.missingRequirements}
      />
    </div>
  );
};
```

### 2. Детальный отчет

```typescript
// Генерация PDF отчета
export class AnalysisReportGenerator {
  async generateReport(
    analysis: EstimateAnalysis,
    format: 'pdf' | 'excel' | 'docx'
  ): Promise<Buffer> {
    const template = await this.loadTemplate(format);
    
    const reportData = {
      generatedAt: new Date(),
      estimate: analysis.estimate,
      summary: this.formatSummary(analysis.summary),
      issues: this.formatIssues(analysis.issues),
      recommendations: this.formatRecommendations(
        analysis.recommendations
      ),
      charts: await this.generateCharts(analysis),
      appendix: this.generateAppendix(analysis)
    };
    
    return this.renderReport(template, reportData, format);
  }
  
  private formatIssues(issues: Issue[]): FormattedIssue[] {
    return issues
      .sort((a, b) => this.getSeverityWeight(b.severity) - 
                      this.getSeverityWeight(a.severity))
      .map(issue => ({
        ...issue,
        icon: this.getIssueIcon(issue.type),
        color: this.getSeverityColor(issue.severity),
        actionItems: this.generateActionItems(issue)
      }));
  }
}
```

## 🔄 Интеграция с рабочим процессом

### 1. Автоматический анализ при загрузке

```typescript
// Middleware для автоанализа
export const autoAnalysisMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.path === '/api/estimates/upload' && req.file) {
    try {
      // Парсинг загруженной сметы
      const estimate = await parseEstimateFile(req.file);
      
      // Запуск фонового анализа
      const analysisJob = await analysisQueue.add('analyze-estimate', {
        estimateId: estimate.id,
        userId: req.user.id,
        analysisType: 'basic',
        notifyOnComplete: true
      });
      
      // Добавляем ID задачи в ответ
      res.locals.analysisJobId = analysisJob.id;
    } catch (error) {
      logger.error('Auto-analysis failed:', error);
    }
  }
  
  next();
};
```

### 2. Подписка на обновления анализа

```typescript
// WebSocket для real-time обновлений
io.on('connection', (socket) => {
  socket.on('subscribe-analysis', async (data) => {
    const { estimateId, userId } = data;
    
    // Проверка прав доступа
    if (!await hasAccess(userId, estimateId)) {
      socket.emit('error', { message: 'Access denied' });
      return;
    }
    
    // Подписка на обновления
    socket.join(`analysis:${estimateId}`);
    
    // Отправка текущего статуса
    const currentStatus = await getAnalysisStatus(estimateId);
    socket.emit('analysis-status', currentStatus);
  });
});

// Отправка обновлений при прогрессе анализа
analysisQueue.on('progress', (job, progress) => {
  io.to(`analysis:${job.data.estimateId}`).emit('analysis-progress', {
    jobId: job.id,
    progress,
    stage: job.data.currentStage
  });
});
```

## 🛡️ Безопасность и конфиденциальность

### Защита данных при анализе

```typescript
// Анонимизация данных перед отправкой в ИИ
function anonymizeEstimateData(estimate: Estimate): AnonymizedEstimate {
  return {
    ...estimate,
    clientName: 'REDACTED',
    projectAddress: generalizeAddress(estimate.projectAddress),
    contactInfo: null,
    items: estimate.items.map(item => ({
      ...item,
      // Сохраняем только необходимые для анализа данные
      supplierInfo: null,
      internalNotes: null
    }))
  };
}

// Шифрование результатов анализа
async function encryptAnalysisResults(
  results: AnalysisResults,
  userId: string
): Promise<EncryptedData> {
  const userKey = await getUserEncryptionKey(userId);
  return encrypt(JSON.stringify(results), userKey);
}
```

## 📈 Метрики и мониторинг

```typescript
// Отслеживание эффективности анализа
interface AnalysisMetrics {
  analysisTime: number;              // Время анализа в мс
  issuesFound: number;               // Количество найденных проблем
  accuracyScore: number;             // Точность рекомендаций
  userSatisfaction: number;          // Оценка пользователя
  savingsRealized: number;           // Реализованная экономия
  falsePositiveRate: number;         // Процент ложных срабатываний
}

// Сбор метрик
export const collectAnalysisMetrics = async (
  analysisId: string,
  metrics: Partial<AnalysisMetrics>
) => {
  await metricsService.record('estimate_analysis', {
    ...metrics,
    analysisId,
    timestamp: new Date()
  });
};
```

## 🔗 API endpoints

Подробное описание API для анализа смет см. в [API документации](./api-endpoints.md#analysis).

---

**Версия**: 1.0  
**Обновлено**: 15.07.2025
