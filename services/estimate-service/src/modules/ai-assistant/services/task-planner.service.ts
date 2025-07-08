import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AITask, TaskType, TaskPlan, TaskExecutionContext } from '../interfaces/ai-task.interface';

interface TaskPattern {
  pattern: RegExp;
  type: TaskType;
  priority: number;
  extractor: (match: RegExpMatchArray) => Partial<AITask>;
}

class PriorityQueue<T> {
  private items: Array<{ element: T; priority: number }> = [];

  enqueue(element: T, priority: number): void {
    const queueElement = { element, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority > this.items[i].priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(queueElement);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  peek(): T | undefined {
    return this.items[0]?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  toArray(): T[] {
    return this.items.map(item => item.element);
  }
}

@Injectable()
export class TaskPlannerService {
  private readonly logger = new Logger(TaskPlannerService.name);
  private taskPatterns: TaskPattern[];

  constructor() {
    this.initializeTaskPatterns();
  }

  private initializeTaskPatterns(): void {
    this.taskPatterns = [
      // Calculation patterns
      {
        pattern: /(?:рассчитай|посчитай|вычисли|определи)\s+(?:стоимость|смету|затраты|расход)\s+(?:на\s+)?(.+)/i,
        type: TaskType.CALCULATION,
        priority: 80,
        extractor: (match) => ({
          description: `Расчет стоимости: ${match[1]}`,
          data: { target: match[1] }
        })
      },
      {
        pattern: /(?:сколько\s+(?:стоит|нужно|потребуется))\s+(.+)/i,
        type: TaskType.CALCULATION,
        priority: 75,
        extractor: (match) => ({
          description: `Расчет количества/стоимости: ${match[1]}`,
          data: { target: match[1] }
        })
      },

      // Comparison patterns
      {
        pattern: /(?:сравни|выбери|что\s+лучше|какой\s+выбрать)\s+(?:между\s+)?(.+?)\s+(?:и|или)\s+(.+)/i,
        type: TaskType.COMPARISON,
        priority: 70,
        extractor: (match) => ({
          description: `Сравнение: ${match[1]} и ${match[2]}`,
          data: { items: [match[1], match[2]] }
        })
      },
      {
        pattern: /(?:альтернативы|варианты|аналоги)\s+(?:для\s+)?(.+)/i,
        type: TaskType.COMPARISON,
        priority: 65,
        extractor: (match) => ({
          description: `Поиск альтернатив для: ${match[1]}`,
          data: { target: match[1] }
        })
      },

      // Validation patterns
      {
        pattern: /(?:проверь|соответствует\s+ли|правильно\s+ли)\s+(.+?)\s+(?:нормам|требованиям|стандартам|СНиП|ГОСТ)/i,
        type: TaskType.VALIDATION,
        priority: 90,
        extractor: (match) => ({
          description: `Проверка соответствия нормам: ${match[1]}`,
          data: { target: match[1] }
        })
      },
      {
        pattern: /(?:допустимо\s+ли|можно\s+ли|разрешено\s+ли)\s+(.+)/i,
        type: TaskType.VALIDATION,
        priority: 85,
        extractor: (match) => ({
          description: `Проверка допустимости: ${match[1]}`,
          data: { target: match[1] }
        })
      },

      // Report patterns
      {
        pattern: /(?:сформируй|создай|подготовь)\s+(?:отчет|смету|документ|таблицу)\s+(?:по\s+)?(.+)/i,
        type: TaskType.REPORT,
        priority: 60,
        extractor: (match) => ({
          description: `Формирование отчета: ${match[1]}`,
          data: { target: match[1] }
        })
      },
      {
        pattern: /(?:покажи|выведи|отобрази)\s+(?:все\s+)?(.+?)\s+(?:за|для|по)\s+(.+)/i,
        type: TaskType.REPORT,
        priority: 55,
        extractor: (match) => ({
          description: `Отображение данных: ${match[1]} для ${match[2]}`,
          data: { type: match[1], scope: match[2] }
        })
      },
    ];
  }

  async planTasks(userQuery: string, context?: TaskExecutionContext): Promise<TaskPlan> {
    this.logger.log(`Planning tasks for query: ${userQuery}`);
    
    const tasks = this.extractTasks(userQuery);
    const prioritizedTasks = this.prioritizeTasks(tasks);
    const tasksWithDependencies = this.analyzeDependencies(prioritizedTasks);
    
    const taskPlan: TaskPlan = {
      tasks: tasksWithDependencies,
      totalEstimatedTime: this.estimateExecutionTime(tasksWithDependencies),
      createdAt: new Date(),
    };

    this.logger.log(`Created task plan with ${taskPlan.tasks.length} tasks`);
    return taskPlan;
  }

  private extractTasks(query: string): AITask[] {
    const tasks: AITask[] = [];
    const segments = this.splitComplexQuery(query);

    for (const segment of segments) {
      for (const pattern of this.taskPatterns) {
        const match = segment.match(pattern.pattern);
        if (match) {
          const extracted = pattern.extractor(match);
          const task: AITask = {
            id: uuidv4(),
            type: pattern.type,
            description: extracted.description || segment,
            dependencies: [],
            priority: pattern.priority,
            status: 'pending',
            data: extracted.data,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          tasks.push(task);
          break; // Only match first pattern per segment
        }
      }
    }

    // If no specific patterns matched, create a general calculation task
    if (tasks.length === 0) {
      tasks.push({
        id: uuidv4(),
        type: TaskType.CALCULATION,
        description: `Общий расчет: ${query}`,
        dependencies: [],
        priority: 50,
        status: 'pending',
        data: { query },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return tasks;
  }

  private splitComplexQuery(query: string): string[] {
    // Split by common conjunctions and punctuation
    const delimiters = /(?:,\s*а\s+также|,\s*и\s+еще|;\s*|,\s*и\s+|,\s*а\s+|,\s*|\.\s+)/i;
    const segments = query.split(delimiters)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    return segments.length > 0 ? segments : [query];
  }

  private prioritizeTasks(tasks: AITask[]): AITask[] {
    const priorityQueue = new PriorityQueue<AITask>();
    
    for (const task of tasks) {
      // Adjust priority based on task type and dependencies
      let adjustedPriority = task.priority;
      
      // Validation tasks get highest priority
      if (task.type === TaskType.VALIDATION) {
        adjustedPriority += 20;
      }
      
      // Calculations that might be dependencies get higher priority
      if (task.type === TaskType.CALCULATION && this.isLikelyDependency(task)) {
        adjustedPriority += 10;
      }
      
      priorityQueue.enqueue(task, adjustedPriority);
    }
    
    return priorityQueue.toArray();
  }

  private isLikelyDependency(task: AITask): boolean {
    // Check if task description contains keywords indicating it's a dependency
    const dependencyKeywords = [
      'общ', 'итог', 'сумм', 'основн', 'базов', 
      'материал', 'работ', 'затрат'
    ];
    
    const description = task.description.toLowerCase();
    return dependencyKeywords.some(keyword => description.includes(keyword));
  }

  private analyzeDependencies(tasks: AITask[]): AITask[] {
    const taskMap = new Map<string, AITask>();
    tasks.forEach(task => taskMap.set(task.id, task));

    // Analyze dependencies between tasks
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const dependency = this.checkDependency(tasks[i], tasks[j]);
        if (dependency) {
          tasks[j].dependencies.push(tasks[i].id);
        }
      }
    }

    // Sort tasks respecting dependencies (topological sort)
    return this.topologicalSort(tasks);
  }

  private checkDependency(task1: AITask, task2: AITask): boolean {
    // Report tasks depend on calculations
    if (task1.type === TaskType.CALCULATION && task2.type === TaskType.REPORT) {
      return true;
    }

    // Comparisons depend on calculations
    if (task1.type === TaskType.CALCULATION && task2.type === TaskType.COMPARISON) {
      return true;
    }

    // Validations should be done before reports
    if (task1.type === TaskType.VALIDATION && task2.type === TaskType.REPORT) {
      return true;
    }

    // Check for explicit data dependencies
    if (task2.data?.target && task1.description.includes(task2.data.target)) {
      return true;
    }

    return false;
  }

  private topologicalSort(tasks: AITask[]): AITask[] {
    const sorted: AITask[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      if (visiting.has(taskId)) {
        this.logger.warn(`Circular dependency detected for task ${taskId}`);
        return;
      }

      visiting.add(taskId);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        for (const depId of task.dependencies) {
          visit(depId);
        }
        sorted.push(task);
      }
      visiting.delete(taskId);
      visited.add(taskId);
    };

    tasks.forEach(task => visit(task.id));
    return sorted;
  }

  private estimateExecutionTime(tasks: AITask[]): number {
    let totalTime = 0;
    
    for (const task of tasks) {
      switch (task.type) {
        case TaskType.CALCULATION:
          totalTime += 500; // 0.5 seconds
          break;
        case TaskType.COMPARISON:
          totalTime += 800; // 0.8 seconds
          break;
        case TaskType.VALIDATION:
          totalTime += 600; // 0.6 seconds
          break;
        case TaskType.REPORT:
          totalTime += 1000; // 1 second
          break;
      }
    }
    
    return totalTime;
  }

  async executeTask(task: AITask): Promise<AITask> {
    this.logger.log(`Executing task ${task.id}: ${task.description}`);
    
    try {
      task.status = 'processing';
      task.updatedAt = new Date();

      switch (task.type) {
        case TaskType.CALCULATION:
          task.result = await this.executeCalculation(task);
          break;
        case TaskType.COMPARISON:
          task.result = await this.executeComparison(task);
          break;
        case TaskType.VALIDATION:
          task.result = await this.executeValidation(task);
          break;
        case TaskType.REPORT:
          task.result = await this.executeReport(task);
          break;
      }

      task.status = 'completed';
      task.updatedAt = new Date();
    } catch (error) {
      this.logger.error(`Error executing task ${task.id}:`, error);
      task.status = 'failed';
      task.error = error.message;
      task.updatedAt = new Date();
    }

    return task;
  }

  private async executeCalculation(task: AITask): Promise<any> {
    // Integration with EstimateCalculatorService
    this.logger.debug(`Executing calculation: ${task.description}`);
    
    // Example implementation - would need actual integration
    return {
      type: 'calculation',
      result: 'Calculation result placeholder',
      details: task.data
    };
  }

  private async executeComparison(task: AITask): Promise<any> {
    // Integration with MaterialService
    this.logger.debug(`Executing comparison: ${task.description}`);
    
    // Example implementation - would need actual integration
    return {
      type: 'comparison',
      result: 'Comparison result placeholder',
      items: task.data?.items || []
    };
  }

  private async executeValidation(task: AITask): Promise<any> {
    // Integration with NormService
    this.logger.debug(`Executing validation: ${task.description}`);
    
    // Example implementation - would need actual integration
    return {
      type: 'validation',
      result: 'Validation result placeholder',
      isValid: true,
      norms: []
    };
  }

  private async executeReport(task: AITask): Promise<any> {
    // Generate report based on previous task results
    this.logger.debug(`Executing report generation: ${task.description}`);
    
    return {
      type: 'report',
      result: 'Report placeholder',
      format: 'html',
      data: task.data
    };
  }
}
