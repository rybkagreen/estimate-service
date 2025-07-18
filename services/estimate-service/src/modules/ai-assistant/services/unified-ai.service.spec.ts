import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeBaseService } from './knowledge-base.service';
import { ModelManagerService } from './model-manager.service';
import { UnifiedAIService } from './unified-ai.service';

describe('UnifiedAIService', () => {
  let service: UnifiedAIService;
  let modelManager: ModelManagerService;
  let knowledgeBase: KnowledgeBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnifiedAIService,
        {
          provide: ModelManagerService,
          useValue: {
            selectModel: jest.fn().mockResolvedValue({
              generatePlan: jest.fn().mockResolvedValue({
                steps: [{ id: 'step1', type: 'analysis' }],
                estimatedDuration: 30,
                requiredResources: [],
              }),
              execute: jest.fn().mockResolvedValue({ status: 'completed' }),
            }),
          },
        },
        {
          provide: KnowledgeBaseService,
          useValue: {
            getTaskContext: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<UnifiedAIService>(UnifiedAIService);
    modelManager = module.get<ModelManagerService>(ModelManagerService);
    knowledgeBase = module.get<KnowledgeBaseService>(KnowledgeBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('planTask', () => {
    it('should return task plan', async () => {
      const result = await service.planTask({
        taskType: 'analysis',
        complexity: 'medium',
      });

      expect(result).toHaveProperty('taskId');
      expect(result.steps.length).toBeGreaterThan(0);
    });
  });

  describe('executeTask', () => {
    it('should execute task steps', async () => {
      const result = await service.executeTask('test-task');

      expect(result.status).toEqual('completed');
      expect(result.steps[0].result.status).toEqual('completed');
    });
  });
});
