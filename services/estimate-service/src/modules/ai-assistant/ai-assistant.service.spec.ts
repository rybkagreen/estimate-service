import { Test, TestingModule } from '@nestjs/testing';
import { AiAssistantService } from './ai-assistant.service';
import { DeepSeekAiProvider } from './providers/deepseek-ai.provider';
import { RuleEngineService } from './rule-engine.service';
import { ConfidenceLevel } from '../../types/shared-contracts';

describe('AiAssistantService', () => {
  let service: AiAssistantService;
  let aiProvider: DeepSeekAiProvider;

  const mockAiProvider = {
    initialize: jest.fn(),
    generateResponse: jest.fn(),
    isReady: jest.fn(),
    isAvailable: jest.fn(),
    getUsageStats: jest.fn(),
    getConfig: jest.fn(),
  };

  const mockRuleEngineService = {
    processItem: jest.fn(),
    validateEstimate: jest.fn(),
    validateEstimateItem: jest.fn(),
    calculateOptimizations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAssistantService,
        {
          provide: DeepSeekAiProvider,
          useValue: mockAiProvider,
        },
        {
          provide: RuleEngineService,
          useValue: mockRuleEngineService,
        },
      ],
    }).compile();

    service = module.get<AiAssistantService>(AiAssistantService);
    aiProvider = module.get<DeepSeekAiProvider>(DeepSeekAiProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSuggestions', () => {
    it('should get AI suggestions for estimate item successfully', async () => {
      const mockItem = {
        id: '1',
        name: 'Земляные работы',
        quantity: 100,
        unitPrice: 1000,
        totalPrice: 100000,
        unit: 'м³',
        category: 'earthworks' as any,
        priceSource: 'ФЕР-2024' as any,
      };

      const mockRuleResult = {
        confidence: 'HIGH' as any,
        suggestions: ['Test rule suggestion'],
        issues: [],
        isValid: true,
      };

      const mockAiResponse = {
        content: 'AI рекомендации для позиции',
        confidence: ConfidenceLevel.HIGH,
        tokensUsed: 150,
        model: 'deepseek-r1',
        timestamp: new Date(),
        metadata: {
          provider: 'deepseek-r1',
          responseTime: 1000,
        },
      };

      mockRuleEngineService.processItem.mockResolvedValue(mockRuleResult);
      mockAiProvider.generateResponse.mockResolvedValue(mockAiResponse);

      const result = await service.getSuggestions(mockItem);

      expect(result).toBeDefined();
      expect(mockRuleEngineService.processItem).toHaveBeenCalledWith(mockItem);
      expect(mockAiProvider.generateResponse).toHaveBeenCalled();
    });
  });

  describe('getRulesStatistics', () => {
    it('should return rules statistics', async () => {
      const stats = await service.getRulesStatistics();

      expect(stats).toBeDefined();
      expect(stats.totalRules).toBeDefined();
      expect(stats.rulesStats).toBeDefined();
    });
  });
});
