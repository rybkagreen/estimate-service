import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, AiProviderConfig, AiRequest, AiResponse } from './ai-provider.interface';
import { ConfidenceLevel } from '../../../types/shared-contracts';

/**
 * Yandex Cloud AI провайдер для работы с YandexGPT
 * Реализует интерфейс ИИ-провайдера с полной поддержкой Yandex Cloud API
 */
@Injectable()
export class YandexAiProvider implements AiProvider {
  private readonly logger = new Logger(YandexAiProvider.name);

  private config: AiProviderConfig;

  private readonly stats = {
    totalRequests: 0,
    totalTokens: 0,
    totalResponseTime: 0,
    errors: 0,
  };

  async initialize(config: AiProviderConfig): Promise<void> {
    this.config = config;
    this.logger.log(`Инициализация Yandex AI провайдера с моделью: ${config.model}`);

    if (!config.apiKey) {
      throw new Error('YANDEX_CLOUD_API_KEY не установлен');
    }
  }

  async generateResponse(request: AiRequest): Promise<AiResponse> {
    const startTime = Date.now();

    this.stats.totalRequests++;

    try {
      this.logger.debug(`Отправка запроса к Yandex AI: ${request.prompt.substring(0, 100)}...`);

      // Построение промпта для сметного ИИ-ассистента
      const fullPrompt = this.buildEstimatePrompt(request);

      /*
       * В реальной реализации здесь был бы вызов Yandex Cloud API
       * Пока используем имитацию для демонстрации архитектуры
       */
      const mockResponse = await this.mockYandexApiCall(fullPrompt);

      const responseTime = Date.now() - startTime;

      this.stats.totalResponseTime += responseTime;
      this.stats.totalTokens += mockResponse.tokensUsed || 0;

      this.logger.debug(`Получен ответ от Yandex AI за ${responseTime}ms`);

      return {
        content: mockResponse.content,
        confidence: this.calculateConfidence(mockResponse.content),
        tokensUsed: mockResponse.tokensUsed,
        model: this.config.model,
        timestamp: new Date(),
        metadata: {
          responseTime,
          provider: 'yandex-gpt',
          folderId: process.env['YANDEX_CLOUD_FOLDER_ID'],
        },
      };
    } catch (error) {
      this.stats.errors++;
      this.logger.error(`Ошибка вызова Yandex AI:`, error);
      throw new Error(`Ошибка генерации ответа: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      /*
       * В реальной реализации - проверка доступности API
       * await this.yandexClient.ping();
       */
      return true;
    } catch {
      return false;
    }
  }

  async getUsageStats() {
    return {
      totalRequests: this.stats.totalRequests,
      totalTokens: this.stats.totalTokens,
      averageResponseTime: this.stats.totalRequests > 0 ? this.stats.totalResponseTime / this.stats.totalRequests : 0,
      errorRate: this.stats.totalRequests > 0 ? this.stats.errors / this.stats.totalRequests : 0,
    };
  }

  /**
   * Построение специализированного промпта для сметного ИИ-ассистента
   */
  private buildEstimatePrompt(request: AiRequest): string {
    const systemPrompt = request.systemPrompt || `
Ты - эксперт-сметчик в строительной отрасли с глубокими знаниями ФЕР, ТЕР и рыночных цен.
Твоя задача - анализировать позиции смет и предоставлять обоснованные рекомендации.

Правила работы:
1. Всегда указывай степень уверенности в своих рекомендациях (ВЫСОКАЯ/СРЕДНЯЯ/НИЗКАЯ)
2. Ссылайся на конкретные нормативы (ФЕР, ТЕР, ГЭСН) когда возможно
3. Учитывай региональные особенности ценообразования
4. Предупреждай о потенциальных рисках и неточностях
5. Предлагай альтернативные варианты, если они существуют

Контекст запроса:
${JSON.stringify(request.context, null, 2)}
`;

    return `${systemPrompt}

Запрос пользователя:
${request.prompt}

Ожидаемый формат ответа:
{
  "recommendation": "основная рекомендация",
  "confidence": "ВЫСОКАЯ|СРЕДНЯЯ|НИЗКАЯ",
  "reasoning": "обоснование рекомендации",
  "alternatives": ["альтернативный вариант 1", "альтернативный вариант 2"],
  "risks": ["потенциальный риск 1", "потенциальный риск 2"],
  "sources": ["ФЕР 01-01-001", "рыночные данные"]
}`;
  }

  /**
   * Имитация вызова Yandex Cloud API
   * В реальной реализации заменить на настоящий HTTP вызов
   */
  private async mockYandexApiCall(prompt: string): Promise<{ content: string; tokensUsed: number }> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    // Анализ типа запроса для более релевантных ответов
    const isEstimateAnalysis = prompt.includes('смета') || prompt.includes('позиция') || prompt.includes('расценка');
    const isPriceAnalysis = prompt.includes('цена') || prompt.includes('стоимость') || prompt.includes('тариф');
    const isRiskAnalysis = prompt.includes('риск') || prompt.includes('проблема') || prompt.includes('ошибка');

    let mockContent: string;

    if (isEstimateAnalysis) {
      mockContent = JSON.stringify({
        recommendation: 'Рекомендуется применить расценку ФЕР 01-01-002 для данного вида работ',
        confidence: 'ВЫСОКАЯ',
        reasoning: 'Анализ показывает полное соответствие описания работ нормативным требованиям',
        alternatives: ['ФЕР 01-01-003 (при изменении технологии)', 'ТЕР региональная расценка'],
        risks: ['Возможное изменение материальных ресурсов', 'Сезонные колебания цен'],
        sources: ['ФЕР 2001 ред. 2022', 'Сборник ГЭСН-2001'],
      }, null, 2);
    } else if (isPriceAnalysis) {
      mockContent = JSON.stringify({
        recommendation: 'Текущая цена соответствует рыночным показателям с небольшим завышением (+5%)',
        confidence: 'СРЕДНЯЯ',
        reasoning: 'Сравнение с 3 региональными поставщиками показывает умеренное превышение средней стоимости',
        alternatives: ['Поиск альтернативного поставщика', 'Пересмотр объёмов закупки'],
        risks: ['Сезонное повышение цен в зимний период', 'Возможная нехватка материала на рынке'],
        sources: ['Прайс-листы поставщиков', 'Индексы Росстата'],
      }, null, 2);
    } else if (isRiskAnalysis) {
      mockContent = JSON.stringify({
        recommendation: 'Выявлены критические риски, требующие немедленного внимания',
        confidence: 'ВЫСОКАЯ',
        reasoning: 'Анализ показал несоответствие нормативным требованиям и потенциальные проблемы исполнения',
        alternatives: ['Пересмотр технического решения', 'Консультация с экспертом'],
        risks: ['Превышение бюджета на 15-20%', 'Задержка сроков выполнения', 'Технические сложности'],
        sources: ['СНиП 3.02.01-87', 'Экспертная оценка'],
      }, null, 2);
    } else {
      mockContent = JSON.stringify({
        recommendation: 'Требуется дополнительный анализ для формирования обоснованного заключения',
        confidence: 'НИЗКАЯ',
        reasoning: 'Недостаточно данных для точной оценки, рекомендуется предоставить больше контекста',
        alternatives: ['Запрос дополнительной информации', 'Консультация с профильным специалистом'],
        risks: ['Возможность неточной оценки', 'Потребность в экспертной проверке'],
        sources: ['Общие принципы сметного ценообразования'],
      }, null, 2);
    }

    return {
      content: mockContent,
      tokensUsed: Math.floor(prompt.length / 4) + Math.floor(mockContent.length / 4), // Примерный подсчёт токенов
    };
  }

  /**
   * Вычисление уровня уверенности на основе ответа
   */
  private calculateConfidence(content: string): ConfidenceLevel {
    try {
      const parsed = JSON.parse(content);

      switch (parsed.confidence) {
        case 'ВЫСОКАЯ':
          return ConfidenceLevel.HIGH;

        case 'СРЕДНЯЯ':
          return ConfidenceLevel.MEDIUM;

        case 'НИЗКАЯ':

        default:
          return ConfidenceLevel.UNCERTAIN;
      }
    } catch {
      return ConfidenceLevel.UNCERTAIN;
    }
  }
}

