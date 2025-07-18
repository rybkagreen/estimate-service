import { TaskPlanRequest, TaskPlanResponse } from './ai.dto';

/**
 * Unified AI API Interface
 * Описывает контракт для унифицированного AI API
 */
export interface IUnifiedAIApi {
  /**
   * Планирование задачи
   * @param request Запрос на планирование задачи
   */
  planTask(request: TaskPlanRequest): Promise<TaskPlanResponse>;

  /**
   * Выполнение запланированной задачи
   * @param taskId ID задачи
   */
  executeTask(taskId: string): Promise<TaskPlanResponse>;

  /**
   * Управление знаниями
   * @param knowledgeData Данные знаний
   */
  manageKnowledge(knowledgeData: unknown): Promise<void>;

  /**
   * Получение аналитики
   * @param filters Фильтры аналитики
   */
  getAnalytics(filters: unknown): Promise<unknown>;
}
