import { Injectable } from '@nestjs/common';
import {
  IUnifiedAIApi,
  StepResult,
  TaskPlanRequest,
  TaskPlanResponse,
  TaskStep,
} from '../../../../../libs/shared-contracts/src/ai/ai.dto';
import { CacheService } from '../../../../cache/cache.service'; // Новый импорт
import { KnowledgeBaseService } from './knowledge-base.service';
import { ModelManagerService } from './model-manager.service';

@Injectable()
export class UnifiedAIService implements IUnifiedAIApi {
  private readonly TASK_PLAN_TTL = 86400; // 24 часа в секундах

  constructor(
    private readonly modelManager: ModelManagerService,
    private readonly knowledgeBase: KnowledgeBaseService,
    private readonly cacheService: CacheService, // Внедрение CacheService
  ) {}

  async planTask(request: TaskPlanRequest): Promise<TaskPlanResponse> {
    const context = await this.knowledgeBase.getTaskContext(request.taskType);
    const model = await this.modelManager.selectModel('planning', request.complexity);
    const plan = await model.generatePlan(request, context);

    // Сохраняем план в Redis
    const cacheKey = `taskPlan:${plan.taskId}`;

    await this.cacheService.set(cacheKey, JSON.stringify(plan), this.TASK_PLAN_TTL);

    return {
      taskId: plan.taskId,
      status: 'planned',
      steps: plan.steps,
      estimatedTime: plan.estimatedDuration,
      requiredResources: plan.requiredResources,
    };
  }

  async executeTask(taskId: string): Promise<TaskPlanResponse> {
    const plan = await this.getTaskPlan(taskId);
    const results: StepResult[] = [];

    for (const step of plan.steps) {
      const stepResult = await this.executeStep(step);

      results.push(stepResult);
      await this.updateTaskProgress(taskId, step.id, stepResult.status);
    }

    return {
      taskId,
      status: 'completed',
      steps: plan.steps.map((step: TaskStep, i: number) => ({
        ...step,
        result: results[i],
      })),
      estimatedTime: plan.estimatedDuration,
      result: this.aggregateResults(results),
    };
  }

  private async getTaskPlan(taskId: string): Promise<TaskPlanResponse> {
    const cacheKey = `taskPlan:${taskId}`;
    const storedPlan = await this.cacheService.get(cacheKey);

    if (!storedPlan) {
      throw new Error(`Task plan not found for id: ${taskId}`);
    }

    return JSON.parse(storedPlan) as TaskPlanResponse;
  }

  private async updateTaskProgress(taskId: string, stepId: string, status: string): Promise<void> {
    const cacheKey = `taskPlan:${taskId}`;
    const storedPlan = await this.cacheService.get(cacheKey);

    if (!storedPlan) return;

    const plan = JSON.parse(storedPlan) as TaskPlanResponse;
    const step = plan.steps.find((s: TaskStep) => s.id === stepId);

    if (step) {
      step.status = status;
      await this.cacheService.set(cacheKey, JSON.stringify(plan), this.TASK_PLAN_TTL);
      this.trackTaskEvent(taskId, 'step-updated', { stepId, status });
    }
  }

  private async executeStep(step: TaskStep): Promise<StepResult> {
    const model = await this.modelManager.selectModel(step.type, step.complexity);
    const result = await model.execute(step);

    return {
      status: 'success',
      output: result,
      timestamp: new Date(),
    };
  }

  private aggregateResults(results: StepResult[]): Record<string, StepResult> {
    return results.reduce((acc: Record<string, StepResult>, result: StepResult, index: number) => {
      acc[`step${index + 1}`] = result;

      return acc;
    }, {});
  }

  private readonly analyticsData: unknown[] = [];

  async manageKnowledge(knowledgeData: unknown): Promise<void> {
    if (Array.isArray(knowledgeData)) {
      await this.knowledgeBase.bulkCreate(knowledgeData);
    } else {
      await this.knowledgeBase.create(knowledgeData);
    }
  }

  async getAnalytics(): Promise<Record<string, unknown>> {
    const completedTasks = this.analyticsData.filter(item => {
      if (item && typeof item === 'object' && 'status' in item) {
        return (item as { status: string }).status === 'completed';
      }

      return false;
    });

    return {
      totalTasks: this.analyticsData.length,
      completedTasks: completedTasks.length,
      completionRate: completedTasks.length / Math.max(1, this.analyticsData.length),
    };
  }

  private trackTaskEvent(taskId: string, eventType: string, data?: unknown): void {
    const eventData: Record<string, unknown> = {
      taskId,
      eventType,
      timestamp: new Date(),
    };

    if (data && typeof data === 'object') {
      Object.assign(eventData, data);
    }

    this.analyticsData.push(eventData);
  }
}
