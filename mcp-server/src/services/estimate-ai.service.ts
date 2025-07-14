/**
 * Estimate AI Service
 * Специализированный сервис для работы со сметной документацией ФСБЦ-2022
 * через DeepSeek R1 API
 */

import { DeepSeekService, DeepSeekMessage } from './deepseek.service.js';
import { logger } from '../utils/logger.js';

export interface EstimateAnalysisRequest {
  estimateText: string;
  documentType?: 'смета' | 'акт' | 'договор' | 'спецификация';
  regionCode?: string;
  year?: number;
}

export interface EstimateGenerationRequest {
  projectDescription: string;
  workTypes: string[];
  area?: number;
  region?: string;
  priceLevel?: 'базовый' | 'текущий';
}

export interface FSBCSearchRequest {
  query: string;
  category?: string;
  region?: string;
  maxResults?: number;
}

export class EstimateAIService {
  private deepseek: DeepSeekService;
  
  constructor() {
    this.deepseek = new DeepSeekService();
    logger.info('📊 Estimate AI Service initialized');
  }

  /**
   * Анализ сметной документации
   */
  async analyzeEstimate(request: EstimateAnalysisRequest): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `Ты - эксперт по анализу строительных смет и нормативной базе ФСБЦ-2022.
        
Твои задачи:
1. Анализировать структуру и содержание сметной документации
2. Проверять соответствие расценок базе ФСБЦ-2022
3. Выявлять ошибки, несоответствия и возможности оптимизации
4. Учитывать региональные коэффициенты и индексы пересчета
5. Предлагать рекомендации по улучшению

При анализе обращай внимание на:
- Правильность применения расценок ФСБЦ
- Корректность единиц измерения
- Обоснованность накладных расходов и сметной прибыли
- Соответствие региональным нормативам
- Полноту учета всех видов работ

Отвечай структурированно, выделяя основные разделы анализа.`
      },
      {
        role: 'user',
        content: `Проанализируй следующую сметную документацию:

Тип документа: ${request.documentType || 'смета'}
${request.regionCode ? `Регион: ${request.regionCode}` : ''}
${request.year ? `Год составления: ${request.year}` : ''}

Содержание документа:
${request.estimateText}`
      }
    ];

    try {
      const response = await this.deepseek.chat(messages, { 
        temperature: 0.3,
        maxTokens: 4000 
      });
      
      logger.info('✅ Estimate analysis completed');
      return response;
    } catch (error) {
      logger.error('❌ Error analyzing estimate:', error);
      throw new Error(`Failed to analyze estimate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Генерация сметы на основе описания проекта
   */
  async generateEstimate(request: EstimateGenerationRequest): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `Ты - профессиональный сметчик, специализирующийся на составлении смет по базе ФСБЦ-2022.

Твои задачи при генерации сметы:
1. Создать структурированную смету с разделами и подразделами
2. Подобрать соответствующие расценки из базы ФСБЦ-2022
3. Указать единицы измерения и объемы работ
4. Рассчитать накладные расходы и сметную прибыль согласно нормативам
5. Применить актуальные региональные коэффициенты
6. Учесть все необходимые виды работ для полноты сметы

Формат вывода:
- Используй табличную структуру для позиций сметы
- Указывай коды расценок ФСБЦ
- Приводи промежуточные и итоговые суммы
- Добавляй пояснения к сложным позициям`
      },
      {
        role: 'user',
        content: `Составь смету для следующего проекта:

Описание проекта: ${request.projectDescription}
Виды работ: ${request.workTypes.join(', ')}
${request.area ? `Площадь/объем: ${request.area} м²` : ''}
${request.region ? `Регион: ${request.region}` : ''}
Уровень цен: ${request.priceLevel || 'текущий'}

Требования:
- Использовать актуальные расценки ФСБЦ-2022
- Включить все необходимые разделы
- Обосновать выбор расценок
- Предоставить детальную калькуляцию`
      }
    ];

    try {
      const response = await this.deepseek.chat(messages, { 
        temperature: 0.4,
        maxTokens: 6000 
      });
      
      logger.info('✅ Estimate generation completed');
      return response;
    } catch (error) {
      logger.error('❌ Error generating estimate:', error);
      throw new Error(`Failed to generate estimate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Поиск и объяснение расценок ФСБЦ-2022
   */
  async searchFSBC(request: FSBCSearchRequest): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `Ты - эксперт по нормативной базе ФСБЦ-2022 (Федеральные сборники базовых цен).

При поиске расценок:
1. Находи наиболее подходящие расценки по запросу
2. Объясняй состав работ каждой расценки
3. Указывай единицы измерения и нормы расхода
4. Приводи связанные и альтернативные расценки
5. Учитывай региональную специфику применения

Формат ответа:
- Код расценки и полное наименование
- Единица измерения
- Состав работ
- Примечания по применению
- Альтернативные варианты`
      },
      {
        role: 'user',
        content: `Найди расценки ФСБЦ-2022 по запросу:

Запрос: ${request.query}
${request.category ? `Категория: ${request.category}` : ''}
${request.region ? `Регион применения: ${request.region}` : ''}
Максимум результатов: ${request.maxResults || 5}

Предоставь подробную информацию о найденных расценках.`
      }
    ];

    try {
      const response = await this.deepseek.chat(messages, { 
        temperature: 0.2,
        maxTokens: 3000 
      });
      
      logger.info('✅ FSBC search completed');
      return response;
    } catch (error) {
      logger.error('❌ Error searching FSBC:', error);
      throw new Error(`Failed to search FSBC: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Сравнение смет и выявление расхождений
   */
  async compareEstimates(estimate1: string, estimate2: string): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `Ты - эксперт по анализу и сравнению строительных смет.

При сравнении смет:
1. Выявляй расхождения в расценках и объемах
2. Анализируй различия в структуре документов
3. Сравнивай итоговые суммы и их составляющие
4. Находи упущенные или лишние позиции
5. Оценивай обоснованность различий

Структура анализа:
- Общее сравнение (итоги, структура)
- Детальные расхождения по разделам
- Анализ причин расхождений
- Рекомендации по устранению различий`
      },
      {
        role: 'user',
        content: `Сравни две сметы и выяви основные расхождения:

СМЕТА 1:
${estimate1}

СМЕТА 2:
${estimate2}

Проведи детальный сравнительный анализ.`
      }
    ];

    try {
      const response = await this.deepseek.chat(messages, { 
        temperature: 0.3,
        maxTokens: 4000 
      });
      
      logger.info('✅ Estimates comparison completed');
      return response;
    } catch (error) {
      logger.error('❌ Error comparing estimates:', error);
      throw new Error(`Failed to compare estimates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Оптимизация сметы для снижения стоимости
   */
  async optimizeEstimate(estimateText: string, targetReduction?: number): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `Ты - эксперт по оптимизации строительных смет.

Задачи оптимизации:
1. Найти возможности снижения стоимости без ущерба качеству
2. Предложить альтернативные расценки и материалы
3. Оптимизировать объемы и технологии работ
4. Выявить завышенные позиции
5. Предложить этапность выполнения для оптимизации затрат

Приоритеты:
- Сохранение качества и безопасности
- Соответствие нормативам
- Реалистичность предложений
- Измеримый экономический эффект`
      },
      {
        role: 'user',
        content: `Оптимизируй следующую смету:

${targetReduction ? `Целевое снижение стоимости: ${targetReduction}%` : ''}

Смета для оптимизации:
${estimateText}

Предложи конкретные меры по снижению стоимости с расчетом экономии.`
      }
    ];

    try {
      const response = await this.deepseek.chat(messages, { 
        temperature: 0.4,
        maxTokens: 4000 
      });
      
      logger.info('✅ Estimate optimization completed');
      return response;
    } catch (error) {
      logger.error('❌ Error optimizing estimate:', error);
      throw new Error(`Failed to optimize estimate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Валидация сметы на соответствие нормативам
   */
  async validateEstimate(estimateText: string): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `Ты - эксперт по проверке соответствия смет нормативным требованиям.

Проверяй:
1. Правильность применения расценок ФСБЦ-2022
2. Корректность расчета накладных расходов и сметной прибыли
3. Соответствие единиц измерения нормативам
4. Применение актуальных коэффициентов
5. Полноту состава работ
6. Математическую точность расчетов

Формат отчета:
- ✅ Соответствует нормативам
- ⚠️ Требует уточнения
- ❌ Нарушение нормативов
Приводи ссылки на конкретные пункты нормативов.`
      },
      {
        role: 'user',
        content: `Проверь смету на соответствие нормативным требованиям:

${estimateText}

Выяви все несоответствия и предоставь рекомендации по исправлению.`
      }
    ];

    try {
      const response = await this.deepseek.chat(messages, { 
        temperature: 0.2,
        maxTokens: 4000 
      });
      
      logger.info('✅ Estimate validation completed');
      return response;
    } catch (error) {
      logger.error('❌ Error validating estimate:', error);
      throw new Error(`Failed to validate estimate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Экспорт singleton экземпляра
export const estimateAI = new EstimateAIService();
