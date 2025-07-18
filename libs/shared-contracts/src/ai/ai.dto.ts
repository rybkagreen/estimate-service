/**
 * DTO для планирования задач AI
 */
export interface TaskStep {
  id: string;
  type: string;
  description: string;
  parameters: Record<string, any>;
  complexity: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface StepResult {
  status: 'success' | 'error' | 'pending';
  output: Record<string, unknown>;
  timestamp: Date;
}

export interface TaskPlanRequest {
  taskType: string;
  parameters: Record<string, any>;
  complexity: 'low' | 'medium' | 'high';
}

export interface TaskPlanResponse {
  taskId: string;
  status: 'planned' | 'in-progress' | 'completed' | 'failed';
  steps: TaskStep[];
  estimatedTime: number;
  requiredResources: string[];
  result?: Record<string, StepResult>;
}
