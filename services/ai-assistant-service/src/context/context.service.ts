import { Injectable } from '@nestjs/common';

@Injectable()
export class ContextService {
  private readonly knowledgeBase: Map<string, string>;

  constructor() {
    this.knowledgeBase = new Map([
      ['FSBTS-2022', 'Федеральная сборная база цен 2022 года для строительства в России.'],
      ['Construction Estimation', 'Процесс оценки стоимости строительных работ и материалов, необходимых для выполнения строительного проекта.'],
      ['Rate', 'Цена на выполнение единицы работы или используемого материала в процессе строительства.'],
      ['Estimate Item', 'Запись в смете, представляющая конкретный элемент работ или материалов с указанием количества и стоимости.'],
      ['Coefficient', 'Коэффициенты, применяемые к базовой стоимости для учета региональных или контекстных условий.'],
      ['Overhead Costs', 'Дополнительные расходы, связанные с организацией и управлением строительным процессом. Как правило, выражаются в процентах от прямых затрат.'],
    ]);
  }

  /**
   * Get context related to a specific term
   */
  getContext(term: string): string | null {
    return this.knowledgeBase.get(term) || null;
  }

  /**
   * Add or update context for a specific term
   */
  setContext(term: string, description: string) {
    this.knowledgeBase.set(term, description);
  }
}

