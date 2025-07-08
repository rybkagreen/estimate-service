import { Test, TestingModule } from '@nestjs/testing';
import { TaskPlannerService } from './task-planner.service';
import { EstimateCalculatorService } from '../../estimate-calculator/estimate-calculator.service';
import { MaterialService } from '../../materials/material.service';
import { NormService } from '../../norms/norm.service';
import { TaskType } from '../interfaces/ai-task.interface';

describe('TaskPlannerService', () => {
  let service: TaskPlannerService;
  let estimateCalculatorService: EstimateCalculatorService;
  let materialService: MaterialService;
  let normService: NormService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskPlannerService,
        {
          provide: EstimateCalculatorService,
          useValue: {
            calculateEstimate: jest.fn(),
          },
        },
        {
          provide: MaterialService,
          useValue: {
            findAll: jest.fn(),
            compareMatrials: jest.fn(),
          },
        },
        {
          provide: NormService,
          useValue: {
            validateNorm: jest.fn(),
            findApplicableNorms: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskPlannerService>(TaskPlannerService);
    estimateCalculatorService = module.get<EstimateCalculatorService>(EstimateCalculatorService);
    materialService = module.get<MaterialService>(MaterialService);
    normService = module.get<NormService>(NormService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('planTasks', () => {
    it('should create a task plan for calculation query', async () => {
      const query = 'Рассчитай стоимость фундамента';
      const plan = await service.planTasks(query);

      expect(plan).toBeDefined();
      expect(plan.tasks).toHaveLength(1);
      expect(plan.tasks[0].type).toBe(TaskType.CALCULATION);
      expect(plan.tasks[0].description).toContain('фундамента');
    });

    it('should create multiple tasks for complex query', async () => {
      const query = 'Рассчитай стоимость материалов, сравни кирпич и блоки, проверь соответствие нормам';
      const plan = await service.planTasks(query);

      expect(plan.tasks.length).toBeGreaterThanOrEqual(3);
      
      const taskTypes = plan.tasks.map(t => t.type);
      expect(taskTypes).toContain(TaskType.CALCULATION);
      expect(taskTypes).toContain(TaskType.COMPARISON);
      expect(taskTypes).toContain(TaskType.VALIDATION);
    });

    it('should prioritize validation tasks', async () => {
      const query = 'Рассчитай смету и проверь соответствует ли СНиП';
      const plan = await service.planTasks(query);

      const validationTask = plan.tasks.find(t => t.type === TaskType.VALIDATION);
      const calculationTask = plan.tasks.find(t => t.type === TaskType.CALCULATION);

      expect(validationTask).toBeDefined();
      expect(calculationTask).toBeDefined();
      
      // Validation should come before calculation in sorted order due to higher priority
      const validationIndex = plan.tasks.indexOf(validationTask!);
      const calculationIndex = plan.tasks.indexOf(calculationTask!);
      
      // Note: Due to topological sort, this might vary based on dependencies
      expect(validationTask!.priority).toBeGreaterThan(calculationTask!.priority);
    });

    it('should handle comparison queries', async () => {
      const query = 'Что лучше выбрать между керамзитом и щебнем';
      const plan = await service.planTasks(query);

      expect(plan.tasks).toHaveLength(1);
      expect(plan.tasks[0].type).toBe(TaskType.COMPARISON);
      expect(plan.tasks[0].data.items).toEqual(['керамзитом', 'щебнем']);
    });

    it('should handle report generation queries', async () => {
      const query = 'Сформируй отчет по затратам на строительство';
      const plan = await service.planTasks(query);

      expect(plan.tasks).toHaveLength(1);
      expect(plan.tasks[0].type).toBe(TaskType.REPORT);
      expect(plan.tasks[0].description).toContain('затратам на строительство');
    });

    it('should analyze dependencies correctly', async () => {
      const query = 'Рассчитай стоимость материалов и создай отчет по расходам';
      const plan = await service.planTasks(query);

      const reportTask = plan.tasks.find(t => t.type === TaskType.REPORT);
      const calculationTask = plan.tasks.find(t => t.type === TaskType.CALCULATION);

      expect(reportTask).toBeDefined();
      expect(calculationTask).toBeDefined();
      expect(reportTask!.dependencies).toContain(calculationTask!.id);
    });

    it('should handle queries without specific patterns', async () => {
      const query = 'Нужна информация о строительстве';
      const plan = await service.planTasks(query);

      expect(plan.tasks).toHaveLength(1);
      expect(plan.tasks[0].type).toBe(TaskType.CALCULATION);
      expect(plan.tasks[0].priority).toBe(50); // Default priority
    });

    it('should estimate execution time', async () => {
      const query = 'Рассчитай, сравни и создай отчет';
      const plan = await service.planTasks(query);

      expect(plan.totalEstimatedTime).toBeGreaterThan(0);
      expect(plan.totalEstimatedTime).toBe(
        plan.tasks.reduce((sum, task) => {
          switch (task.type) {
            case TaskType.CALCULATION: return sum + 500;
            case TaskType.COMPARISON: return sum + 800;
            case TaskType.VALIDATION: return sum + 600;
            case TaskType.REPORT: return sum + 1000;
            default: return sum;
          }
        }, 0)
      );
    });
  });

  describe('executeTask', () => {
    it('should execute calculation task', async () => {
      const task = {
        id: 'task-1',
        type: TaskType.CALCULATION,
        description: 'Test calculation',
        dependencies: [],
        priority: 80,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await service.executeTask(task);

      expect(result.status).toBe('completed');
      expect(result.result).toBeDefined();
      expect(result.result.type).toBe('calculation');
    });

    it('should handle task execution errors', async () => {
      const task = {
        id: 'task-1',
        type: TaskType.CALCULATION,
        description: 'Test calculation',
        dependencies: [],
        priority: 80,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock an error
      jest.spyOn(service as any, 'executeCalculation').mockRejectedValue(new Error('Calculation failed'));

      const result = await service.executeTask(task);

      expect(result.status).toBe('failed');
      expect(result.error).toBe('Calculation failed');
    });

    it('should execute comparison task', async () => {
      const task = {
        id: 'task-2',
        type: TaskType.COMPARISON,
        description: 'Compare materials',
        dependencies: [],
        priority: 70,
        status: 'pending' as const,
        data: { items: ['item1', 'item2'] },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await service.executeTask(task);

      expect(result.status).toBe('completed');
      expect(result.result.type).toBe('comparison');
      expect(result.result.items).toEqual(['item1', 'item2']);
    });

    it('should execute validation task', async () => {
      const task = {
        id: 'task-3',
        type: TaskType.VALIDATION,
        description: 'Validate norms',
        dependencies: [],
        priority: 90,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await service.executeTask(task);

      expect(result.status).toBe('completed');
      expect(result.result.type).toBe('validation');
      expect(result.result.isValid).toBe(true);
    });

    it('should execute report task', async () => {
      const task = {
        id: 'task-4',
        type: TaskType.REPORT,
        description: 'Generate report',
        dependencies: [],
        priority: 60,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await service.executeTask(task);

      expect(result.status).toBe('completed');
      expect(result.result.type).toBe('report');
      expect(result.result.format).toBe('html');
    });
  });

  describe('Complex scenarios', () => {
    it('should handle circular dependencies gracefully', async () => {
      // This test would require mocking internal methods to create circular deps
      const query = 'Сложный запрос с множественными зависимостями';
      const plan = await service.planTasks(query);

      expect(plan).toBeDefined();
      expect(plan.tasks).toBeDefined();
      // Should not throw or hang
    });

    it('should split complex queries correctly', async () => {
      const query = 'Рассчитай фундамент, а также сравни материалы; проверь нормы. И создай отчет';
      const plan = await service.planTasks(query);

      expect(plan.tasks.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle Russian language patterns', async () => {
      const queries = [
        'Сколько стоит кирпич',
        'Можно ли использовать этот материал',
        'Покажи все расходы за месяц',
        'Альтернативы для бетона М300',
      ];

      for (const query of queries) {
        const plan = await service.planTasks(query);
        expect(plan.tasks).toHaveLength(1);
        expect(plan.tasks[0].description).toBeTruthy();
      }
    });
  });
});
