import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TaskPlannerService } from '../services/task-planner.service';
import { TaskPlan, AITask } from '../interfaces/ai-task.interface';

class PlanTasksDto {
  query: string;
  projectId?: string;
  userId?: string;
}

class ExecuteTaskDto {
  taskId: string;
}

@ApiTags('AI Task Planner')
@Controller('ai/tasks')
export class TaskPlannerController {
  constructor(private readonly taskPlannerService: TaskPlannerService) {}

  @Post('plan')
  @ApiOperation({ summary: 'План задач на основе пользовательского запроса' })
  @ApiResponse({ status: 200, description: 'План задач создан успешно' })
  async planTasks(@Body() dto: PlanTasksDto): Promise<TaskPlan> {
    return this.taskPlannerService.planTasks(dto.query, {
      userQuery: dto.query,
      projectId: dto.projectId,
      userId: dto.userId,
    });
  }

  @Post('execute')
  @ApiOperation({ summary: 'Выполнить конкретную задачу' })
  @ApiResponse({ status: 200, description: 'Задача выполнена' })
  async executeTask(@Body() dto: ExecuteTaskDto): Promise<AITask> {
    // В реальном приложении здесь нужно получить задачу из хранилища
    const mockTask: AITask = {
      id: dto.taskId,
      type: 'CALCULATION' as any,
      description: 'Mock task',
      dependencies: [],
      priority: 50,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return this.taskPlannerService.executeTask(mockTask);
  }

  @Post('batch-execute')
  @ApiOperation({ summary: 'Выполнить план задач полностью' })
  @ApiResponse({ status: 200, description: 'Все задачи выполнены' })
  async executePlan(@Body() plan: TaskPlan): Promise<AITask[]> {
    const results: AITask[] = [];
    
    // Выполняем задачи в порядке их зависимостей
    for (const task of plan.tasks) {
      // Проверяем, что все зависимости выполнены
      const dependenciesCompleted = task.dependencies.every(depId => 
        results.find(r => r.id === depId && r.status === 'completed')
      );
      
      if (dependenciesCompleted || task.dependencies.length === 0) {
        const result = await this.taskPlannerService.executeTask(task);
        results.push(result);
      }
    }
    
    return results;
  }

  @Get('examples')
  @ApiOperation({ summary: 'Примеры запросов для планировщика' })
  @ApiResponse({ status: 200, description: 'Список примеров' })
  getExamples() {
    return {
      examples: [
        {
          category: 'Расчеты',
          queries: [
            'Рассчитай стоимость фундамента для дома 10x12 метров',
            'Сколько нужно кирпича на стену площадью 50 кв.м',
            'Определи затраты на кровельные работы',
          ],
        },
        {
          category: 'Сравнения',
          queries: [
            'Сравни керамзитобетонные блоки и газобетон',
            'Что лучше выбрать: металлочерепицу или профнастил',
            'Альтернативы для утеплителя минеральная вата',
          ],
        },
        {
          category: 'Проверки',
          queries: [
            'Проверь соответствует ли толщина стены нормам СНиП',
            'Можно ли использовать данный фундамент для 3-этажного дома',
            'Допустимо ли применение этого материала в жилом строительстве',
          ],
        },
        {
          category: 'Отчеты',
          queries: [
            'Сформируй смету на строительство бани',
            'Создай отчет по расходам материалов за месяц',
            'Покажи все затраты по проекту Дом-1',
          ],
        },
        {
          category: 'Комплексные запросы',
          queries: [
            'Рассчитай стоимость материалов, сравни поставщиков и создай отчет',
            'Проверь нормы, рассчитай смету и подготовь документацию',
            'Найди альтернативы, сравни цены и проверь соответствие стандартам',
          ],
        },
      ],
    };
  }
}
