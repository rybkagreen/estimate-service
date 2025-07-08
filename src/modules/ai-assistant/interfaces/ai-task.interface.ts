export enum TaskType {
  CALCULATION = 'CALCULATION',
  COMPARISON = 'COMPARISON',
  VALIDATION = 'VALIDATION',
  REPORT = 'REPORT',
}

export interface AITask {
  id: string;
  type: TaskType;
  description: string;
  dependencies: string[];
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data?: any;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskPlan {
  tasks: AITask[];
  totalEstimatedTime?: number;
  createdAt: Date;
}

export interface TaskExecutionContext {
  userQuery: string;
  projectId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}
