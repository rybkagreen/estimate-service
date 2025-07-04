import { Injectable, Logger } from '@nestjs/common';
import {
  AiAnalysis,
  ConfidenceLevel,
  GrandSmetaItem,
  GrandSmetaWorkCategory,
  PriceSource,
} from '../../types/shared-contracts';

interface EstimateRule {
  id: string;
  name: string;
  category: GrandSmetaWorkCategory;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  confidence: ConfidenceLevel;
}

interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'range' | 'regex';
  value: any;
}

interface RuleAction {
  type: 'SET_PRICE' | 'SET_CATEGORY' | 'ADD_WARNING' | 'REQUIRE_REVIEW';
  value: any;
  explanation: string;
}

/**
 * Правилоориентированная система для обработки типовых сценариев
 * Покрывает 70-80% стандартных случаев без участия ИИ
 */
@Injectable()
export class RuleEngineService {
  private readonly logger = new Logger(RuleEngineService.name);

  private rules: EstimateRule[] = [];

  constructor() {
    this.initializeRules();
  }

  /**
   * Обработка позиции сметы через правила
   */
  async processItem(item: Partial<GrandSmetaItem>): Promise<{
    processed: boolean;
    confidence: ConfidenceLevel;
    modifications: any[];
    requiresAiAssistance: boolean;
    warnings: string[];
  }> {
    this.logger.log(`Обработка позиции через правила: ${item.name}`);

    const applicableRules = this.findApplicableRules(item);
    const modifications: any[] = [];
    const warnings: string[] = [];
    let highestConfidence = ConfidenceLevel.UNCERTAIN;
    let requiresAiAssistance = false;

    // Применяем все подходящие правила
    for (const rule of applicableRules) {
      try {
        const result = await this.applyRule(rule, item);

        modifications.push(...result.modifications);
        warnings.push(...result.warnings);

        if (result.confidence === ConfidenceLevel.HIGH) {
          highestConfidence = ConfidenceLevel.HIGH;
        } else if (result.confidence === ConfidenceLevel.MEDIUM && highestConfidence !== ConfidenceLevel.HIGH) {
          highestConfidence = ConfidenceLevel.MEDIUM;
        }

        if (result.requiresAiAssistance) {
          requiresAiAssistance = true;
        }
      } catch (error) {
        this.logger.error(`Ошибка применения правила ${rule.id}:`, error);
        requiresAiAssistance = true;
      }
    }

    // Если не найдено подходящих правил или низкая уверенность - передаем ИИ
    if (applicableRules.length === 0 || highestConfidence === ConfidenceLevel.UNCERTAIN) {
      requiresAiAssistance = true;
    }

    return {
      processed: applicableRules.length > 0,
      confidence: highestConfidence,
      modifications,
      requiresAiAssistance,
      warnings,
    };
  }

  /**
   * Поиск применимых правил для позиции
   */
  private findApplicableRules(item: Partial<GrandSmetaItem>): EstimateRule[] {
    return this.rules
      .filter(rule => this.isRuleApplicable(rule, item))
      .sort((a, b) => b.priority - a.priority); // Сортировка по приоритету
  }

  /**
   * Проверка применимости правила
   */
  private isRuleApplicable(rule: EstimateRule, item: Partial<GrandSmetaItem>): boolean {
    return rule.conditions.every(condition => {
      const fieldValue = this.getFieldValue(item, condition.field);

      return this.checkCondition(fieldValue, condition);
    });
  }

  /**
   * Проверка условия правила
   */
  private checkCondition(fieldValue: any, condition: RuleCondition): boolean {
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;

      case 'contains':
        return typeof fieldValue === 'string'
               && fieldValue.toLowerCase().includes(condition.value.toLowerCase());

      case 'range':
        return fieldValue >= condition.value.min && fieldValue <= condition.value.max;

      case 'regex':
        return new RegExp(condition.value).test(fieldValue);

      default:
        return false;
    }
  }

  /**
   * Получение значения поля
   */
  private getFieldValue(item: any, field: string): any {
    const fields = field.split('.');
    let value = item;

    for (const f of fields) {
      value = value?.[f];
      if (value === undefined) break;
    }

    return value;
  }

  /**
   * Применение правила
   */
  private async applyRule(rule: EstimateRule, item: Partial<GrandSmetaItem>): Promise<{
    modifications: any[];
    warnings: string[];
    confidence: ConfidenceLevel;
    requiresAiAssistance: boolean;
  }> {
    const modifications: any[] = [];
    const warnings: string[] = [];
    let requiresAiAssistance = false;

    for (const action of rule.actions) {
      switch (action.type) {
        case 'SET_PRICE':
          modifications.push({
            field: 'unitPrice',
            value: action.value,
            source: PriceSource.FER,
            explanation: action.explanation,
          });
          break;

        case 'SET_CATEGORY':
          modifications.push({
            field: 'category',
            value: action.value,
            explanation: action.explanation,
          });
          break;

        case 'ADD_WARNING':
          warnings.push(action.value);
          break;

        case 'REQUIRE_REVIEW':
          requiresAiAssistance = true;
          warnings.push(`Требует ручной проверки: ${action.explanation}`);
          break;
      }
    }

    return {
      modifications,
      warnings,
      confidence: rule.confidence,
      requiresAiAssistance,
    };
  }

  /**
   * Инициализация базовых правил
   */
  private initializeRules(): void {
    this.rules = [
      // Правила для земляных работ
      {
        id: 'earthworks-basic',
        name: 'Базовые земляные работы',
        category: GrandSmetaWorkCategory.EARTHWORKS,
        conditions: [
          { field: 'name', operator: 'contains', value: 'разработка грунта' },
          { field: 'unit.code', operator: 'equals', value: 'м3' },
        ],
        actions: [
          {
            type: 'SET_CATEGORY',
            value: GrandSmetaWorkCategory.EARTHWORKS,
            explanation: 'Автоматически определена категория "Земляные работы"',
          },
        ],
        priority: 10,
        confidence: ConfidenceLevel.HIGH,
      },

      // Правила для бетонных работ
      {
        id: 'concrete-basic',
        name: 'Базовые бетонные работы',
        category: GrandSmetaWorkCategory.CONCRETE,
        conditions: [
          { field: 'name', operator: 'contains', value: 'бетон' },
          { field: 'unit.code', operator: 'equals', value: 'м3' },
        ],
        actions: [
          {
            type: 'SET_CATEGORY',
            value: GrandSmetaWorkCategory.CONCRETE,
            explanation: 'Автоматически определена категория "Бетонные работы"',
          },
        ],
        priority: 10,
        confidence: ConfidenceLevel.HIGH,
      },

      // Правила для арматурных работ
      {
        id: 'reinforcement-basic',
        name: 'Базовые арматурные работы',
        category: GrandSmetaWorkCategory.REINFORCEMENT,
        conditions: [
          { field: 'name', operator: 'contains', value: 'арматур' },
          { field: 'unit.code', operator: 'equals', value: 'т' },
        ],
        actions: [
          {
            type: 'SET_CATEGORY',
            value: GrandSmetaWorkCategory.REINFORCEMENT,
            explanation: 'Автоматически определена категория "Арматурные работы"',
          },
        ],
        priority: 10,
        confidence: ConfidenceLevel.HIGH,
      },

      // Правила валидации цен
      {
        id: 'price-validation-high',
        name: 'Валидация высоких цен',
        category: GrandSmetaWorkCategory.EARTHWORKS,
        conditions: [
          { field: 'unitPrice', operator: 'range', value: { min: 100000, max: Infinity } },
        ],
        actions: [
          {
            type: 'ADD_WARNING',
            value: 'Обнаружена подозрительно высокая цена',
            explanation: 'Цена превышает обычные рыночные значения',
          },
          {
            type: 'REQUIRE_REVIEW',
            value: true,
            explanation: 'Высокая стоимость требует проверки ИИ или эксперта',
          },
        ],
        priority: 15,
        confidence: ConfidenceLevel.MEDIUM,
      },

      // Правила для отделочных работ
      {
        id: 'finishing-basic',
        name: 'Базовые отделочные работы',
        category: GrandSmetaWorkCategory.FINISHING,
        conditions: [
          { field: 'name', operator: 'regex', value: '(штукатур|покрас|плитк|обои)' },
        ],
        actions: [
          {
            type: 'SET_CATEGORY',
            value: GrandSmetaWorkCategory.FINISHING,
            explanation: 'Автоматически определена категория "Отделочные работы"',
          },
        ],
        priority: 8,
        confidence: ConfidenceLevel.HIGH,
      },

      // Правила для инженерных систем
      {
        id: 'engineering-basic',
        name: 'Базовые инженерные системы',
        category: GrandSmetaWorkCategory.ENGINEERING,
        conditions: [
          { field: 'name', operator: 'regex', value: '(электр|отопл|водопров|канализ|вентил)' },
        ],
        actions: [
          {
            type: 'SET_CATEGORY',
            value: GrandSmetaWorkCategory.ENGINEERING,
            explanation: 'Автоматически определена категория "Инженерные системы"',
          },
        ],
        priority: 9,
        confidence: ConfidenceLevel.HIGH,
      },
    ];

    this.logger.log(`Инициализировано ${this.rules.length} правил`);
  }

  /**
   * Получение статистики правил
   */
  getRulesStatistics(): {
    totalRules: number;
    rulesByCategory: Record<string, number>;
    rulesByConfidence: Record<string, number>;
    } {
    const rulesByCategory: Record<string, number> = {};
    const rulesByConfidence: Record<string, number> = {};

    this.rules.forEach(rule => {
      rulesByCategory[rule.category] = (rulesByCategory[rule.category] || 0) + 1;
      rulesByConfidence[rule.confidence] = (rulesByConfidence[rule.confidence] || 0) + 1;
    });

    return {
      totalRules: this.rules.length,
      rulesByCategory,
      rulesByConfidence,
    };
  }
}
