import { Injectable, Logger } from '@nestjs/common';
import { DeepSeekService } from '../deepseek/deepseek.service';
import { DeepSeekMessage } from '../deepseek/deepseek.types';
import { Estimate, EstimateStatus } from '@estimate-service/shared-contracts';

export interface EstimateAdvice {
  estimateId: string;
  recommendations: EstimateRecommendation[];
  optimizationPotential: OptimizationPotential;
  rateVerification: RateVerification;
  risks: EstimateRisk[];
  generatedAt: Date;
}

export interface EstimateRecommendation {
  type: 'cost_reduction' | 'quality_improvement' | 'time_saving' | 'resource_optimization';
  title: string;
  description: string;
  potentialSavings?: number;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
}

export interface OptimizationPotential {
  totalPotentialSavings: number;
  percentageReduction: number;
  optimizationAreas: OptimizationArea[];
}

export interface OptimizationArea {
  name: string;
  currentCost: number;
  optimizedCost: number;
  savingsAmount: number;
  savingsPercentage: number;
  suggestions: string[];
}

export interface RateVerification {
  status: 'verified' | 'discrepancies_found' | 'unable_to_verify';
  discrepancies: RateDiscrepancy[];
  verifiedAgainst: string; // e.g., "ФСБЦ-2022"
  lastUpdated: Date;
}

export interface RateDiscrepancy {
  itemId: string;
  itemName: string;
  currentRate: number;
  expectedRate: number;
  deviation: number;
  deviationPercentage: number;
  reason?: string;
}

export interface EstimateRisk {
  type: 'budget_overrun' | 'timeline_delay' | 'quality_issue' | 'compliance_violation' | 'resource_shortage';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  mitigationStrategies: string[];
  probability: number; // 0-100%
  impact: number; // 0-100%
}

export interface EstimateAnalysisOptions {
  deepAnalysis?: boolean;
  compareWithMarketRates?: boolean;
  includeRegionalFactors?: boolean;
  optimizationLevel?: 'aggressive' | 'moderate' | 'conservative';
  language?: 'ru' | 'en';
}

@Injectable()
export class EstimateAdvisorService {
  private readonly logger = new Logger(EstimateAdvisorService.name);
  
  constructor(
    private readonly deepSeekService: DeepSeekService,
  ) {}

  /**
   * Analyze estimate and provide comprehensive advice
   */
  async analyzeEstimate(
    estimate: Estimate,
    estimateItems: any[],
    options: EstimateAnalysisOptions = {}
  ): Promise<EstimateAdvice> {
    this.logger.log(`Analyzing estimate ${estimate.id} with ${estimateItems.length} items`);

    const context = this.prepareEstimateContext(estimate, estimateItems, options);
    
    // Run parallel analyses for better performance
    const [recommendations, optimization, verification, risks] = await Promise.all([
      this.generateRecommendations(context, options),
      this.analyzeOptimizationPotential(context, options),
      this.verifyRates(estimateItems, options),
      this.assessRisks(context, options),
    ]);

    const advice: EstimateAdvice = {
      estimateId: estimate.id,
      recommendations,
      optimizationPotential: optimization,
      rateVerification: verification,
      risks,
      generatedAt: new Date(),
    };

    this.logger.log(`Completed analysis for estimate ${estimate.id}`);
    return advice;
  }

  /**
   * Generate optimization recommendations
   */
  private async generateRecommendations(
    context: string,
    options: EstimateAnalysisOptions
  ): Promise<EstimateRecommendation[]> {
    const systemPrompt = this.getRecommendationSystemPrompt(options);
    
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Проанализируй следующую смету и предоставь конкретные рекомендации по оптимизации:

${context}

Формат ответа должен быть JSON со следующей структурой:
{
  "recommendations": [
    {
      "type": "cost_reduction" | "quality_improvement" | "time_saving" | "resource_optimization",
      "title": "Название рекомендации",
      "description": "Подробное описание",
      "potentialSavings": число (в рублях, если применимо),
      "priority": "high" | "medium" | "low",
      "actionItems": ["Действие 1", "Действие 2", ...]
    }
  ]
}`,
      },
    ];

    try {
      const response = await this.deepSeekService.chat(messages, {
        temperature: 0.3,
        maxTokens: 2000,
        model: 'deepseek-reasoner',
      });

      const content = response.choices[0]?.message.content || '{}';
      const parsed = this.parseJSONResponse(content);
      
      return parsed.recommendations || [];
    } catch (error) {
      this.logger.error('Failed to generate recommendations:', error);
      return [];
    }
  }

  /**
   * Analyze optimization potential
   */
  private async analyzeOptimizationPotential(
    context: string,
    options: EstimateAnalysisOptions
  ): Promise<OptimizationPotential> {
    const level = options.optimizationLevel || 'moderate';
    
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: this.getOptimizationSystemPrompt(level),
      },
      {
        role: 'user',
        content: `Проанализируй потенциал оптимизации для следующей сметы:

${context}

Уровень оптимизации: ${level}

Формат ответа должен быть JSON со следующей структурой:
{
  "totalPotentialSavings": число,
  "percentageReduction": число,
  "optimizationAreas": [
    {
      "name": "Название области",
      "currentCost": число,
      "optimizedCost": число,
      "savingsAmount": число,
      "savingsPercentage": число,
      "suggestions": ["Предложение 1", "Предложение 2"]
    }
  ]
}`,
      },
    ];

    try {
      const response = await this.deepSeekService.chat(messages, {
        temperature: 0.2,
        maxTokens: 1500,
      });

      const content = response.choices[0]?.message.content || '{}';
      const parsed = this.parseJSONResponse(content);
      
      return {
        totalPotentialSavings: parsed.totalPotentialSavings || 0,
        percentageReduction: parsed.percentageReduction || 0,
        optimizationAreas: parsed.optimizationAreas || [],
      };
    } catch (error) {
      this.logger.error('Failed to analyze optimization potential:', error);
      return {
        totalPotentialSavings: 0,
        percentageReduction: 0,
        optimizationAreas: [],
      };
    }
  }

  /**
   * Verify rates against ФСБЦ-2022 standards
   */
  private async verifyRates(
    estimateItems: any[],
    options: EstimateAnalysisOptions
  ): Promise<RateVerification> {
    if (!options.compareWithMarketRates) {
      return {
        status: 'unable_to_verify',
        discrepancies: [],
        verifiedAgainst: 'ФСБЦ-2022',
        lastUpdated: new Date(),
      };
    }

    const itemsContext = estimateItems.map(item => ({
      id: item.id,
      name: item.name,
      rate: item.unitPrice,
      unit: item.unit,
      quantity: item.quantity,
    }));

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: this.getRateVerificationSystemPrompt(),
      },
      {
        role: 'user',
        content: `Проверь корректность расценок следующих позиций сметы относительно базы ФСБЦ-2022:

${JSON.stringify(itemsContext, null, 2)}

Формат ответа должен быть JSON со следующей структурой:
{
  "status": "verified" | "discrepancies_found" | "unable_to_verify",
  "discrepancies": [
    {
      "itemId": "ID позиции",
      "itemName": "Название позиции",
      "currentRate": число,
      "expectedRate": число,
      "deviation": число,
      "deviationPercentage": число,
      "reason": "Причина отклонения"
    }
  ]
}`,
      },
    ];

    try {
      const response = await this.deepSeekService.chat(messages, {
        temperature: 0.1,
        maxTokens: 2000,
      });

      const content = response.choices[0]?.message.content || '{}';
      const parsed = this.parseJSONResponse(content);
      
      return {
        status: parsed.status || 'unable_to_verify',
        discrepancies: parsed.discrepancies || [],
        verifiedAgainst: 'ФСБЦ-2022',
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to verify rates:', error);
      return {
        status: 'unable_to_verify',
        discrepancies: [],
        verifiedAgainst: 'ФСБЦ-2022',
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Assess estimate risks
   */
  private async assessRisks(
    context: string,
    options: EstimateAnalysisOptions
  ): Promise<EstimateRisk[]> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: this.getRiskAssessmentSystemPrompt(),
      },
      {
        role: 'user',
        content: `Выполни оценку рисков для следующей сметы:

${context}

Формат ответа должен быть JSON со следующей структурой:
{
  "risks": [
    {
      "type": "budget_overrun" | "timeline_delay" | "quality_issue" | "compliance_violation" | "resource_shortage",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "Название риска",
      "description": "Описание риска",
      "mitigationStrategies": ["Стратегия 1", "Стратегия 2"],
      "probability": число (0-100),
      "impact": число (0-100)
    }
  ]
}`,
      },
    ];

    try {
      const response = await this.deepSeekService.chat(messages, {
        temperature: 0.3,
        maxTokens: 1500,
      });

      const content = response.choices[0]?.message.content || '{}';
      const parsed = this.parseJSONResponse(content);
      
      return parsed.risks || [];
    } catch (error) {
      this.logger.error('Failed to assess risks:', error);
      return [];
    }
  }

  /**
   * Prepare estimate context for AI analysis
   */
  private prepareEstimateContext(
    estimate: Estimate,
    estimateItems: any[],
    options: EstimateAnalysisOptions
  ): string {
    const totalByCategory = this.calculateTotalsByCategory(estimateItems);
    
    const context = `
Смета: ${estimate.name}
Описание: ${estimate.description || 'Не указано'}
Статус: ${estimate.status}
Общая стоимость: ${estimate.totalCost.toLocaleString('ru-RU')} руб.

Разбивка по категориям:
- Работы: ${estimate.laborCost.toLocaleString('ru-RU')} руб. (${((estimate.laborCost / estimate.totalCost) * 100).toFixed(1)}%)
- Материалы: ${estimate.materialCost.toLocaleString('ru-RU')} руб. (${((estimate.materialCost / estimate.totalCost) * 100).toFixed(1)}%)
- Оборудование: ${estimate.equipmentCost.toLocaleString('ru-RU')} руб. (${((estimate.equipmentCost / estimate.totalCost) * 100).toFixed(1)}%)
- Накладные расходы: ${estimate.overheadCost.toLocaleString('ru-RU')} руб. (${((estimate.overheadCost / estimate.totalCost) * 100).toFixed(1)}%)
- Прибыль: ${estimate.profitMargin.toLocaleString('ru-RU')} руб.
- НДС: ${estimate.vatRate}%

Количество позиций: ${estimateItems.length}

Топ-5 наиболее затратных позиций:
${this.getTopExpensiveItems(estimateItems, 5)}

${options.includeRegionalFactors ? `Региональные факторы: ${estimate.metadata?.region || 'Не указаны'}` : ''}
`;

    return context;
  }

  /**
   * Calculate totals by category
   */
  private calculateTotalsByCategory(items: any[]): Record<string, number> {
    return items.reduce((acc, item) => {
      const category = item.category || 'Прочее';
      acc[category] = (acc[category] || 0) + item.totalPrice;
      return acc;
    }, {});
  }

  /**
   * Get top expensive items
   */
  private getTopExpensiveItems(items: any[], count: number): string {
    const sorted = [...items].sort((a, b) => b.totalPrice - a.totalPrice);
    const top = sorted.slice(0, count);
    
    return top.map((item, index) => 
      `${index + 1}. ${item.name}: ${item.totalPrice.toLocaleString('ru-RU')} руб. (${item.quantity} ${item.unit})`
    ).join('\n');
  }

  /**
   * Parse JSON response from AI
   */
  private parseJSONResponse(content: string): any {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {};
    } catch (error) {
      this.logger.warn('Failed to parse JSON response:', error);
      return {};
    }
  }

  /**
   * Get system prompts for different analyses
   */
  private getRecommendationSystemPrompt(options: EstimateAnalysisOptions): string {
    const lang = options.language || 'ru';
    
    if (lang === 'ru') {
      return `Ты - эксперт по оптимизации строительных смет с глубоким знанием стандартов ФСБЦ-2022.
      
Твоя задача - анализировать сметы и предоставлять конкретные, действенные рекомендации по:
1. Снижению затрат без ущерба качеству
2. Улучшению качества работ
3. Экономии времени выполнения
4. Оптимизации использования ресурсов

Каждая рекомендация должна быть обоснована и содержать конкретные шаги для реализации.
Приоритизируй рекомендации по потенциальной экономии и простоте внедрения.`;
    }
    
    return `You are an expert in construction estimate optimization with deep knowledge of industry standards.
    
Your task is to analyze estimates and provide specific, actionable recommendations for:
1. Cost reduction without quality compromise
2. Work quality improvement
3. Time savings
4. Resource optimization

Each recommendation must be justified and contain specific implementation steps.
Prioritize recommendations by potential savings and ease of implementation.`;
  }

  private getOptimizationSystemPrompt(level: string): string {
    const levelDescriptions = {
      aggressive: 'Максимальная оптимизация с готовностью к компромиссам в сроках и некритичных аспектах качества',
      moderate: 'Сбалансированная оптимизация с сохранением качества и разумными сроками',
      conservative: 'Минимальная оптимизация с приоритетом качества и надежности',
    };
    
    return `Ты - эксперт по оптимизации строительных смет.
    
Уровень оптимизации: ${levelDescriptions[level as keyof typeof levelDescriptions]}

Анализируй смету и находи области для оптимизации затрат. Для каждой области:
1. Оцени текущие затраты
2. Предложи оптимизированный вариант
3. Рассчитай потенциальную экономию
4. Предоставь конкретные предложения по реализации

Учитывай отраслевые стандарты и не предлагай оптимизации, которые могут нарушить нормативы.`;
  }

  private getRateVerificationSystemPrompt(): string {
    return `Ты - эксперт по расценкам в строительстве, специализирующийся на базе ФСБЦ-2022.
    
Твоя задача - проверить корректность указанных расценок:
1. Сравни текущие расценки с актуальными данными ФСБЦ-2022
2. Выяви отклонения более 10%
3. Определи причины отклонений (устаревшие расценки, ошибки, региональные коэффициенты)
4. Предоставь рекомендуемые расценки

Учитывай региональные коэффициенты и особенности ценообразования.`;
  }

  private getRiskAssessmentSystemPrompt(): string {
    return `Ты - эксперт по управлению рисками в строительных проектах.
    
Проанализируй смету и выяви потенциальные риски:
1. Риски превышения бюджета
2. Риски задержки сроков
3. Риски качества работ
4. Риски несоответствия нормативам
5. Риски нехватки ресурсов

Для каждого риска оцени:
- Вероятность возникновения (0-100%)
- Влияние на проект (0-100%)
- Критичность (critical/high/medium/low)
- Стратегии смягчения

Фокусируйся на наиболее вероятных и критичных рисках.`;
  }

  /**
   * Generate quick estimate tips
   */
  async generateQuickTips(estimateType: string, region?: string): Promise<string[]> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: 'Ты - эксперт по составлению строительных смет. Предоставляй краткие, практичные советы.',
      },
      {
        role: 'user',
        content: `Дай 5 кратких советов по составлению сметы для: ${estimateType}${region ? `, регион: ${region}` : ''}. Каждый совет - одно предложение.`,
      },
    ];

    try {
      const response = await this.deepSeekService.chat(messages, {
        temperature: 0.5,
        maxTokens: 500,
      });

      const content = response.choices[0]?.message.content || '';
      return content.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
    } catch (error) {
      this.logger.error('Failed to generate quick tips:', error);
      return [];
    }
  }

  /**
   * Compare estimates
   */
  async compareEstimates(
    estimate1: Estimate,
    estimate2: Estimate,
    items1: any[],
    items2: any[]
  ): Promise<any> {
    const context = `
Смета 1: ${estimate1.name}
Общая стоимость: ${estimate1.totalCost.toLocaleString('ru-RU')} руб.
Количество позиций: ${items1.length}

Смета 2: ${estimate2.name}
Общая стоимость: ${estimate2.totalCost.toLocaleString('ru-RU')} руб.
Количество позиций: ${items2.length}
`;

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: 'Ты - эксперт по анализу и сравнению строительных смет.',
      },
      {
        role: 'user',
        content: `Сравни две сметы и выдели ключевые различия:\n${context}`,
      },
    ];

    const response = await this.deepSeekService.chat(messages, {
      temperature: 0.3,
      maxTokens: 1500,
    });

    return response.choices[0]?.message.content || '';
  }
}
