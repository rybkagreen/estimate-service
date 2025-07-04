import { Injectable, Logger } from '@nestjs/common';
import { RuleEngineService } from './rule-engine.service';
import { AiAssistantResponse, ConfidenceLevel, GrandSmetaItem } from '@ez-eco/shared-contracts';
import { YandexAiProvider } from './providers/yandex-ai.provider';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  private readonly aiProvider: YandexAiProvider;

  constructor(private readonly ruleEngineService: RuleEngineService) {
    this.aiProvider = new YandexAiProvider();
    this.aiProvider.initialize({
      provider: 'yandex-gpt',
      apiKey: process.env['YANDEX_CLOUD_API_KEY'] ?? '',
      model: process.env['YANDEX_GPT_MODEL'] ?? 'yandexgpt',
      maxTokens: Number(process.env['OPENAI_MAX_TOKENS']) || 4000,
      temperature: Number(process.env['AI_TEMPERATURE']) || 0.3,
    });
  }

  /**
   * Получение предложений от ИИ
   */
  async getSuggestions(item: GrandSmetaItem): Promise<AiAssistantResponse> {
    // Сначала применяем правила
    const ruleResult = await this.ruleEngineService.processItem(item);

    if (ruleResult.requiresAiAssistance) {
      // Если правила не могут обработать - обращаемся к ИИ
      const aiResponse = await this.provideAiSuggestions(item);

      return {
        success: true,
        action: 'SUGGEST',
        result: aiResponse,
        confidence: aiResponse.confidence,
        explanation: `ИИ-анализ: ${aiResponse.explanation}`,
        alternatives: aiResponse.alternatives || [],
        requiresManualReview: aiResponse.confidence !== ConfidenceLevel.HIGH,
        uncertaintyAreas: aiResponse.uncertaintyAreas || [],
      };
    }

    return {
      success: true,
      action: 'SUGGEST',
      result: ruleResult.modifications,
      confidence: ruleResult.confidence,
      explanation: 'Применены правила автоматической обработки',
      alternatives: [],
      requiresManualReview: ruleResult.warnings.length > 0,
      uncertaintyAreas: [],
    };
  }

  /**
   * Получение статистики правил
   */
  async getRulesStatistics(): Promise<{ totalRules: number; rulesStats: any }> {
    const stats = this.ruleEngineService.getRulesStatistics();

    return {
      totalRules: stats.totalRules,
      rulesStats: stats,
    };
  }

  /**
   * Предоставление ИИ-предложений через провайдер
   */
  private async provideAiSuggestions(item: GrandSmetaItem): Promise<any> {
    try {
      const prompt = this.buildAnalysisPrompt(item);
      const aiResponse = await this.aiProvider.generateResponse({
        prompt,
        context: {
          item,
          analysis_type: 'estimate_review',
          timestamp: new Date().toISOString(),
        },
        maxTokens: 2000,
        temperature: 0.3,
      });

      // Парсим ответ ИИ
      const parsedResponse = this.parseAiResponse(aiResponse.content);

      return {
        ...parsedResponse,
        confidence: aiResponse.confidence,
        aiMetadata: aiResponse.metadata,
        tokensUsed: aiResponse.tokensUsed,
      };
    } catch (error) {
      this.logger.error('Ошибка получения ИИ-предложений:', error);

      return {
        recommendation: 'Требуется ручная проверка',
        confidence: ConfidenceLevel.UNCERTAIN,
        explanation: 'Не удалось получить ИИ-анализ',
        alternatives: [],
        uncertaintyAreas: ['ИИ-анализ недоступен'],
      };
    }
  }

  /**
   * Построение промпта для анализа позиции сметы
   */
  private buildAnalysisPrompt(item: GrandSmetaItem): string {
    return `
Проанализируй следующую позицию сметы:

Наименование: ${item.name}
Единица измерения: ${item.unit?.name} (${item.unit?.code})
Количество: ${item.quantity}
Цена за единицу: ${item.unitPrice} руб.
Общая стоимость: ${item.totalPrice || (item.quantity || 0) * (item.unitPrice || 0)} руб.
Категория работ: ${item.category}
Источник цены: ${item.priceSource}

Требуется:
1. Оценить корректность расценки
2. Проверить соответствие нормативам
3. Выявить потенциальные риски
4. Предложить альтернативы если необходимо
5. Указать уровень уверенности в рекомендации

Обрати особое внимание на:
- Соответствие цены рыночным значениям
- Правильность применения единиц измерения
- Актуальность нормативной базы
- Региональные особенности
`;
  }

  /**
   * Парсинг ответа ИИ
   */
  private parseAiResponse(content: string): any {
    try {
      const parsed = JSON.parse(content);

      return {
        recommendation: parsed.recommendation || 'Рекомендация не определена',
        explanation: parsed.reasoning || 'Обоснование отсутствует',
        alternatives: parsed.alternatives || [],
        uncertaintyAreas: parsed.risks || [],
        sources: parsed.sources || [],
      };
    } catch (error) {
      // Fallback если ответ не в JSON формате
      return {
        recommendation: content.substring(0, 200),
        explanation: 'Ответ получен в неструктурированном формате',
        alternatives: [],
        uncertaintyAreas: ['Неструктурированный ответ ИИ'],
        sources: [],
      };
    }
  }
}

