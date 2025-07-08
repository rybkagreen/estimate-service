import { AiAssistantResponse, ConfidenceLevel, GrandSmetaItem } from '../../types/shared-contracts';
import { Injectable, Logger } from '@nestjs/common';
import { DeepSeekAiProvider } from './providers/deepseek-ai.provider';
import { CachedAiProvider } from './providers/cached-ai.provider';
import { RuleEngineService } from './rule-engine.service';
import { ResponseBuilderService, ResponseValidation, FallbackAction } from './services/response-builder.service';
import { CacheService } from '../cache';
import { AiProvider } from './providers/ai-provider.interface';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  private readonly aiProvider: AiProvider;

  constructor(
    private readonly ruleEngineService: RuleEngineService,
    private readonly responseBuilderService: ResponseBuilderService,
    private readonly cacheService: CacheService,
  ) {
    // Create DeepSeek provider and wrap it with caching
    const deepSeekProvider = new DeepSeekAiProvider();
    this.aiProvider = new CachedAiProvider(deepSeekProvider, this.cacheService);
    
    this.aiProvider.initialize({
      provider: 'deepseek-r1',
      apiKey: process.env['DEEPSEEK_API_KEY'] ?? '',
      model: process.env['DEEPSEEK_MODEL'] ?? 'deepseek-r1',
      baseUrl: process.env['DEEPSEEK_BASE_URL'] ?? 'https://api.deepseek.com/v1',
      maxTokens: Number(process.env['DEEPSEEK_MAX_TOKENS']) || 4000,
      temperature: Number(process.env['AI_TEMPERATURE']) || 0.3,
    });
  }

  /**
   * Получение предложений от ИИ с валидацией через ResponseBuilderService
   */
  async getSuggestions(item: GrandSmetaItem): Promise<AiAssistantResponse> {
    // Сначала применяем правила
    const ruleResult = await this.ruleEngineService.processItem(item);

    if (ruleResult.requiresAiAssistance) {
      // Если правила не могут обработать - обращаемся к ИИ с повторными попытками
      return await this.getAiSuggestionsWithValidation(item);
    }

    // Валидируем результат применения правил
    const ruleResponse: AiAssistantResponse = {
      success: true,
      action: 'SUGGEST',
      result: ruleResult.modifications,
      confidence: ruleResult.confidence,
      explanation: 'Применены правила автоматической обработки',
      alternatives: [],
      requiresManualReview: ruleResult.warnings.length > 0,
      uncertaintyAreas: [],
    };

    // Валидируем даже ответы от правил
    const validation = await this.responseBuilderService.validateResponse(
      ruleResponse,
      { item, source: 'rule_engine' },
    );

    if (validation.isValid && !validation.requiresFallback) {
      return ruleResponse;
    }

    // Если валидация правил не прошла, пробуем ИИ
    this.logger.warn('Rule-based response failed validation, falling back to AI');
    return await this.getAiSuggestionsWithValidation(item);
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
   * Получение ИИ-предложений с валидацией и обработкой fallback
   */
  private async getAiSuggestionsWithValidation(
    item: GrandSmetaItem,
    retryCount: number = 0,
  ): Promise<AiAssistantResponse> {
    try {
      // Получаем ответ от ИИ
      const aiResponse = await this.provideAiSuggestions(item);

      // Формируем структурированный ответ
      const response: AiAssistantResponse = {
        success: true,
        action: 'SUGGEST',
        result: aiResponse,
        confidence: aiResponse.confidence || ConfidenceLevel.MEDIUM,
        explanation: `ИИ-анализ: ${aiResponse.explanation || 'Анализ выполнен'}`,
        alternatives: aiResponse.alternatives || [],
        requiresManualReview: aiResponse.confidence !== ConfidenceLevel.HIGH,
        uncertaintyAreas: aiResponse.uncertaintyAreas || [],
      };

      // Валидируем ответ
      const validation = await this.responseBuilderService.validateResponse(
        response,
        { item, source: 'ai_assistant' },
        retryCount,
      );

      // Если валидация прошла успешно
      if (validation.isValid && !validation.requiresFallback) {
        return response;
      }

      // Обрабатываем fallback действия
      if (validation.requiresFallback && validation.fallbackAction) {
        return await this.handleFallbackAction(
          validation.fallbackAction,
          item,
          response,
          retryCount,
        );
      }

      // Если валидация не прошла, но fallback не требуется
      this.logger.warn('Response validation failed without fallback action');
      return {
        ...response,
        requiresManualReview: true,
        uncertaintyAreas: [
          ...(response.uncertaintyAreas || []),
          'Низкая уверенность в результатах валидации',
        ],
      };
    } catch (error) {
      this.logger.error('Error in AI suggestions with validation:', error);
      return this.createFallbackResponse('Ошибка при получении ИИ-анализа', item);
    }
  }

  /**
   * Обработка fallback действий
   */
  private async handleFallbackAction(
    action: FallbackAction,
    item: GrandSmetaItem,
    originalResponse: AiAssistantResponse,
    retryCount: number,
  ): Promise<AiAssistantResponse> {
    this.logger.log(`Handling fallback action: ${action.type}`);

    switch (action.type) {
      case 'retry':
        if (retryCount < (action.maxRetries || 3)) {
          this.logger.log(`Retrying AI suggestion (attempt ${retryCount + 1})`);
          // Добавляем небольшую задержку перед повтором
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return await this.getAiSuggestionsWithValidation(item, retryCount + 1);
        }
        // Если исчерпаны попытки, переходим к human_review
        return this.createFallbackResponse(action.reason, item, 'human_review');

      case 'alternative_model':
        // В будущем здесь можно переключиться на другую модель
        this.logger.warn('Alternative model fallback not implemented, using degraded response');
        return this.createFallbackResponse(action.reason, item, 'degraded_response');

      case 'human_review':
        return this.createFallbackResponse(action.reason, item, 'human_review');

      case 'degraded_response':
        return {
          ...originalResponse,
          requiresManualReview: true,
          explanation: `${originalResponse.explanation} (${action.reason})`,
          uncertaintyAreas: [
            ...(originalResponse.uncertaintyAreas || []),
            action.reason,
          ],
        };

      default:
        return this.createFallbackResponse('Неизвестный тип fallback', item);
    }
  }

  /**
   * Создание fallback ответа
   */
  private createFallbackResponse(
    reason: string,
    item: GrandSmetaItem,
    reviewType: 'human_review' | 'degraded_response' = 'human_review',
  ): AiAssistantResponse {
    return {
      success: reviewType === 'degraded_response',
      action: 'SUGGEST',
      result: {
        recommendation: 'Требуется ручная проверка',
        originalItem: item,
      },
      confidence: ConfidenceLevel.UNCERTAIN,
      explanation: `Требуется ручная проверка: ${reason}`,
      alternatives: [],
      requiresManualReview: true,
      uncertaintyAreas: [
        reason,
        'Автоматический анализ не дал надежных результатов',
      ],
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
Единица измерения: ${typeof item.unit === 'string' ? item.unit : item.unit?.name || 'не указана'} ${typeof item.unit === 'object' && item.unit?.code ? `(${item.unit.code})` : ''}
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

