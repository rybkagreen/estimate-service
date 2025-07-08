import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IAnalysisRequest,
  IAnalysisResult,
  IHistoricalPattern,
  ITypicalError,
  IAverageIndicator,
  IAnalysisRecommendation,
  IAnalysisSummary,
  PatternType,
  ErrorType,
  ErrorImpact,
  RecommendationType,
  RecommendationPriority
} from './analysis.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class HistoricalAnalysisService {
  private readonly logger = new Logger(HistoricalAnalysisService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Основной метод анализа исторических данных
   */
  async analyzeHistoricalData(request: IAnalysisRequest): Promise<IAnalysisResult> {
    this.logger.log('Начинаем анализ исторических данных', request);

    const analysisId = uuidv4();
    const startTime = Date.now();

    try {
      // Получаем данные для анализа
      const estimates = await this.fetchEstimatesForAnalysis(request);

      // Параллельно выполняем различные виды анализа
      const [patterns, errors, indicators] = await Promise.all([
        request.includePatterns !== false ? this.identifyPatterns(estimates) : [],
        request.includeErrors !== false ? this.detectTypicalErrors(estimates) : [],
        this.calculateAverageIndicators(estimates, request)
      ]);

      // Генерируем рекомендации на основе найденных паттернов и ошибок
      const recommendations = request.includeRecommendations !== false
        ? await this.generateRecommendations(patterns, errors, indicators)
        : [];

      // Формируем итоговую сводку
      const summary = this.createAnalysisSummary(estimates, patterns, errors, request);

      const result: IAnalysisResult = {
        id: analysisId,
        requestId: request.estimateId || 'batch-analysis',
        timestamp: new Date(),
        patterns,
        typicalErrors: errors,
        averageIndicators: indicators,
        recommendations,
        summary
      };

      this.logger.log(`Анализ завершен за ${Date.now() - startTime}ms`);
      return result;
    } catch (error) {
      this.logger.error('Ошибка при анализе исторических данных', error);
      throw error;
    }
  }

  /**
   * Выявление паттернов в исторических данных
   */
  private async identifyPatterns(estimates: any[]): Promise<IHistoricalPattern[]> {
    const patterns: IHistoricalPattern[] = [];

    // Анализ частых комбинаций работ
    const workCombinations = this.analyzeWorkCombinations(estimates);
    patterns.push(...workCombinations);

    // Анализ сезонных трендов
    const seasonalTrends = this.analyzeSeasonalTrends(estimates);
    patterns.push(...seasonalTrends);

    // Анализ региональных особенностей
    const regionalPatterns = this.analyzeRegionalPatterns(estimates);
    patterns.push(...regionalPatterns);

    // Анализ аномалий
    const anomalies = this.detectAnomalies(estimates);
    patterns.push(...anomalies);

    return patterns;
  }

  /**
   * Обнаружение типичных ошибок
   */
  private async detectTypicalErrors(estimates: any[]): Promise<ITypicalError[]> {
    const errors: ITypicalError[] = [];

    // Проверка отклонений цен
    const priceDeviations = this.checkPriceDeviations(estimates);
    errors.push(...priceDeviations);

    // Проверка ошибок в количествах
    const quantityErrors = this.checkQuantityErrors(estimates);
    errors.push(...quantityErrors);

    // Проверка дубликатов работ
    const duplicates = this.findDuplicateWorks(estimates);
    errors.push(...duplicates);

    // Проверка пропущенных обязательных работ
    const missingWorks = this.findMissingRequiredWorks(estimates);
    errors.push(...missingWorks);

    // Проверка коэффициентов
    const coefficientErrors = this.checkCoefficientErrors(estimates);
    errors.push(...coefficientErrors);

    return errors;
  }

  /**
   * Расчет средних показателей
   */
  private async calculateAverageIndicators(
    estimates: any[],
    request: IAnalysisRequest
  ): Promise<IAverageIndicator[]> {
    const indicators: IAverageIndicator[] = [];

    // Группируем данные по типам работ и регионам
    const groupedData = this.groupEstimatesByWorkTypeAndRegion(estimates);

    for (const [key, data] of Object.entries(groupedData)) {
      const [workType, region] = key.split('|');
      
      // Вычисляем статистические показатели
      const prices = data.map((d: any) => d.unitPrice);
      const stats = this.calculateStatistics(prices);

      // Вычисляем сезонные факторы
      const seasonalFactors = this.calculateSeasonalFactors(data);

      indicators.push({
        workType: data[0].workTypeName,
        workTypeCode: workType,
        region,
        averagePrice: stats.average,
        minPrice: stats.min,
        maxPrice: stats.max,
        standardDeviation: stats.stdDev,
        sampleSize: prices.length,
        lastUpdated: new Date(),
        unit: data[0].unit,
        seasonalFactors
      });
    }

    return indicators;
  }

  /**
   * Генерация рекомендаций
   */
  private async generateRecommendations(
    patterns: IHistoricalPattern[],
    errors: ITypicalError[],
    indicators: IAverageIndicator[]
  ): Promise<IAnalysisRecommendation[]> {
    const recommendations: IAnalysisRecommendation[] = [];

    // Рекомендации на основе ошибок
    for (const error of errors) {
      if (error.impact === ErrorImpact.HIGH || error.impact === ErrorImpact.CRITICAL) {
        recommendations.push({
          id: uuidv4(),
          type: RecommendationType.RISK_MITIGATION,
          priority: error.impact === ErrorImpact.CRITICAL 
            ? RecommendationPriority.URGENT 
            : RecommendationPriority.HIGH,
          title: `Устранить ${error.description}`,
          description: `Обнаружена критическая ошибка, влияющая на ${error.affectedItems.length} позиций`,
          impact: `Потенциальная экономия до ${this.estimateErrorImpact(error)}%`,
          suggestedActions: error.recommendations,
          confidence: 0.9
        });
      }
    }

    // Рекомендации по оптимизации затрат
    const costOptimizations = this.generateCostOptimizations(indicators, patterns);
    recommendations.push(...costOptimizations);

    // Рекомендации по best practices
    const bestPractices = patterns
      .filter(p => p.type === PatternType.BEST_PRACTICE)
      .map(p => ({
        id: uuidv4(),
        type: RecommendationType.QUALITY_IMPROVEMENT,
        priority: RecommendationPriority.MEDIUM,
        title: p.name,
        description: p.description,
        impact: 'Повышение качества сметной документации',
        suggestedActions: [`Применить паттерн: ${p.description}`],
        relatedPatterns: [p.id],
        confidence: p.confidence
      }));
    recommendations.push(...bestPractices);

    return recommendations;
  }

  /**
   * Вспомогательные методы
   */
  
  private async fetchEstimatesForAnalysis(request: IAnalysisRequest): Promise<any[]> {
    const where: any = {};

    if (request.estimateId) {
      where.id = request.estimateId;
    }

    if (request.regions && request.regions.length > 0) {
      where.project = {
        regionCode: { in: request.regions }
      };
    }

    if (request.dateRange) {
      where.createdAt = {
        gte: request.dateRange.from,
        lte: request.dateRange.to
      };
    }

    // Получаем сметы с их позициями и проектами
    const estimates = await this.prisma.estimate.findMany({
      where,
      include: {
        items: true,
        project: true,
        createdBy: true
      }
    });

    return estimates;
  }

  private groupEstimatesByWorkTypeAndRegion(estimates: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    for (const estimate of estimates) {
      const region = estimate.project?.regionCode || 'UNKNOWN';
      
      for (const item of estimate.items) {
        // Используем категорию и ФСБЦ код как идентификатор типа работы
        const workTypeCode = item.fsbtsCode || item.category || 'OTHER';
        const key = `${workTypeCode}|${region}`;
        
        if (!grouped[key]) {
          grouped[key] = [];
        }
        
        grouped[key].push({
          ...item,
          region,
          date: estimate.createdAt,
          workTypeName: item.name,
          estimateId: estimate.id,
          projectName: estimate.project?.name
        });
      }
    }

    return grouped;
  }

  private calculateStatistics(values: number[]): {
    average: number;
    min: number;
    max: number;
    stdDev: number;
  } {
    const n = values.length;
    const average = values.reduce((a, b) => a + b, 0) / n;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    return { average, min, max, stdDev };
  }

  private calculateSeasonalFactors(data: any[]): Array<{ month: number; factor: number }> {
    // Группируем по месяцам
    const monthlyData: Record<number, number[]> = {};
    
    for (const item of data) {
      const month = new Date(item.date).getMonth();
      if (!monthlyData[month]) {
        monthlyData[month] = [];
      }
      monthlyData[month].push(item.unitPrice);
    }

    // Вычисляем общее среднее
    const allPrices = data.map(d => d.unitPrice);
    const overallAverage = this.calculateStatistics(allPrices).average;

    // Вычисляем факторы для каждого месяца
    const factors = [];
    for (let month = 0; month < 12; month++) {
      if (monthlyData[month] && monthlyData[month].length > 0) {
        const monthAverage = this.calculateStatistics(monthlyData[month]).average;
        factors.push({
          month: month + 1,
          factor: monthAverage / overallAverage
        });
      }
    }

    return factors;
  }

  private analyzeWorkCombinations(estimates: any[]): IHistoricalPattern[] {
    const combinations: Record<string, number> = {};
    
    // Подсчитываем частоту комбинаций работ
    for (const estimate of estimates) {
      const workTypes = estimate.items.map((item: any) => item.workType.code).sort();
      const key = workTypes.join('-');
      combinations[key] = (combinations[key] || 0) + 1;
    }

    // Находим частые комбинации
    const patterns: IHistoricalPattern[] = [];
    const threshold = estimates.length * 0.1; // 10% порог

    for (const [combination, count] of Object.entries(combinations)) {
      if (count >= threshold) {
        patterns.push({
          id: uuidv4(),
          type: PatternType.TREND,
          name: `Частая комбинация работ`,
          description: `Работы ${combination} часто выполняются вместе`,
          frequency: count,
          confidence: count / estimates.length,
          examples: [] // TODO: добавить примеры
        });
      }
    }

    return patterns;
  }

  private analyzeSeasonalTrends(estimates: any[]): IHistoricalPattern[] {
    // Упрощенный анализ сезонности
    const patterns: IHistoricalPattern[] = [];
    
    // TODO: Реализовать детальный анализ сезонных трендов
    
    return patterns;
  }

  private analyzeRegionalPatterns(estimates: any[]): IHistoricalPattern[] {
    // Упрощенный анализ региональных паттернов
    const patterns: IHistoricalPattern[] = [];
    
    // TODO: Реализовать анализ региональных особенностей
    
    return patterns;
  }

  private detectAnomalies(estimates: any[]): IHistoricalPattern[] {
    const anomalies: IHistoricalPattern[] = [];
    
    // TODO: Реализовать обнаружение аномалий
    
    return anomalies;
  }

  private checkPriceDeviations(estimates: any[]): ITypicalError[] {
    const errors: ITypicalError[] = [];
    
    // TODO: Реализовать проверку отклонений цен
    
    return errors;
  }

  private checkQuantityErrors(estimates: any[]): ITypicalError[] {
    const errors: ITypicalError[] = [];
    
    // TODO: Реализовать проверку ошибок в количествах
    
    return errors;
  }

  private findDuplicateWorks(estimates: any[]): ITypicalError[] {
    const errors: ITypicalError[] = [];
    
    for (const estimate of estimates) {
      const workTypes: Record<string, number> = {};
      
      for (const item of estimate.items) {
        const code = item.workType.code;
        workTypes[code] = (workTypes[code] || 0) + 1;
      }
      
      for (const [code, count] of Object.entries(workTypes)) {
        if (count > 1) {
          errors.push({
            id: uuidv4(),
            errorType: ErrorType.DUPLICATE_WORK,
            description: `Дублирование работы ${code}`,
            frequency: 1,
            impact: ErrorImpact.MEDIUM,
            recommendations: [
              'Проверить необходимость дублирования',
              'Объединить одинаковые позиции'
            ],
            affectedItems: estimate.items
              .filter((item: any) => item.workType.code === code)
              .map((item: any) => item.id)
          });
        }
      }
    }
    
    return errors;
  }

  private findMissingRequiredWorks(estimates: any[]): ITypicalError[] {
    // TODO: Реализовать проверку отсутствующих обязательных работ
    return [];
  }

  private checkCoefficientErrors(estimates: any[]): ITypicalError[] {
    // TODO: Реализовать проверку ошибок в коэффициентах
    return [];
  }

  private estimateErrorImpact(error: ITypicalError): number {
    // Упрощенная оценка влияния ошибки
    switch (error.impact) {
      case ErrorImpact.CRITICAL:
        return 15;
      case ErrorImpact.HIGH:
        return 10;
      case ErrorImpact.MEDIUM:
        return 5;
      default:
        return 2;
    }
  }

  private generateCostOptimizations(
    indicators: IAverageIndicator[],
    patterns: IHistoricalPattern[]
  ): IAnalysisRecommendation[] {
    const recommendations: IAnalysisRecommendation[] = [];
    
    // Анализируем индикаторы с большим разбросом цен
    for (const indicator of indicators) {
      const coefficientOfVariation = indicator.standardDeviation / indicator.averagePrice;
      
      if (coefficientOfVariation > 0.3) { // 30% вариации
        recommendations.push({
          id: uuidv4(),
          type: RecommendationType.COST_OPTIMIZATION,
          priority: RecommendationPriority.HIGH,
          title: `Оптимизация затрат на ${indicator.workType}`,
          description: `Обнаружен большой разброс цен (${Math.round(coefficientOfVariation * 100)}%) для данного вида работ в регионе ${indicator.region}`,
          impact: `Потенциальная экономия до ${Math.round((indicator.maxPrice - indicator.averagePrice) / indicator.maxPrice * 100)}%`,
          suggestedActions: [
            'Провести анализ поставщиков',
            'Рассмотреть альтернативные материалы',
            'Оптимизировать логистику'
          ],
          confidence: 0.8
        });
      }
    }
    
    return recommendations;
  }

  private createAnalysisSummary(
    estimates: any[],
    patterns: IHistoricalPattern[],
    errors: ITypicalError[],
    request: IAnalysisRequest
  ): IAnalysisSummary {
    const regions = [...new Set(estimates.map(e => e.region))];
    const workTypes = new Set<string>();
    
    for (const estimate of estimates) {
      for (const item of estimate.items) {
        workTypes.add(item.workType.code);
      }
    }

    return {
      totalEstimatesAnalyzed: estimates.length,
      timeRange: request.dateRange || {
        from: new Date(Math.min(...estimates.map(e => e.createdAt.getTime()))),
        to: new Date(Math.max(...estimates.map(e => e.createdAt.getTime())))
      },
      regionsIncluded: regions,
      workTypesAnalyzed: workTypes.size,
      patternsIdentified: patterns.length,
      errorsFound: errors.length,
      potentialSavings: this.calculatePotentialSavings(errors),
      qualityScore: this.calculateQualityScore(estimates, errors)
    };
  }

  private calculatePotentialSavings(errors: ITypicalError[]): number {
    // Упрощенный расчет потенциальной экономии
    let savings = 0;
    for (const error of errors) {
      savings += this.estimateErrorImpact(error) * error.frequency;
    }
    return savings;
  }

  private calculateQualityScore(estimates: any[], errors: ITypicalError[]): number {
    // Упрощенный расчет оценки качества
    const errorRate = errors.length / (estimates.length || 1);
    const score = Math.max(0, 100 - errorRate * 10);
    return Math.round(score);
  }
}
