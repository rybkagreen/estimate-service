import { Test, TestingModule } from '@nestjs/testing';
import { AiAssistantService } from './ai-assistant.service';
import { RuleEngineService } from './rule-engine.service';
import { ResponseBuilderService } from './services/response-builder.service';
import { HistoricalEstimateService } from './services/historical-estimate.service';
import { ClaudeValidatorService } from './services/claude-validator.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfidenceLevel, GrandSmetaItem } from '../../types/shared-contracts';

describe('AiAssistantService Integration', () => {
  let service: AiAssistantService;
  let responseBuilderService: ResponseBuilderService;
  let ruleEngineService: RuleEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAssistantService,
        RuleEngineService,
        ResponseBuilderService,
        HistoricalEstimateService,
        ClaudeValidatorService,
        PrismaService,
      ],
    }).compile();

    service = module.get<AiAssistantService>(AiAssistantService);
    responseBuilderService = module.get<ResponseBuilderService>(ResponseBuilderService);
    ruleEngineService = module.get<RuleEngineService>(RuleEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSuggestions with validation', () => {
    const mockItem: GrandSmetaItem = {
      id: '1',
      name: 'Test Work Item',
      code: 'TEST001',
      unit: { name: 'м²', code: 'M2' },
      quantity: 100,
      unitPrice: 1000,
      totalPrice: 100000,
      category: 'construction',
      sectionId: 'section1',
      priceSource: 'MARKET_ANALYSIS',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should validate rule-based responses', async () => {
      // Mock rule engine to return a response
      jest.spyOn(ruleEngineService, 'processItem').mockResolvedValue({
        requiresAiAssistance: false,
        modifications: { updatedPrice: 950 },
        confidence: ConfidenceLevel.HIGH,
        warnings: [],
      } as any);

      // Mock validation to pass
      jest.spyOn(responseBuilderService, 'validateResponse').mockResolvedValue({
        isValid: true,
        overallConfidence: 0.9,
        requiresFallback: false,
        levels: {
          level1: { level: 1, passed: true, confidence: 0.9 },
          level2: { level: 2, passed: true, confidence: 0.9 },
          level3: { level: 3, passed: true, confidence: 0.9 },
        },
      } as any);

      const result = await service.getSuggestions(mockItem);

      expect(result.success).toBe(true);
      expect(result.action).toBe('SUGGEST');
      expect(responseBuilderService.validateResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          action: 'SUGGEST',
          confidence: ConfidenceLevel.HIGH,
        }),
        { item: mockItem, source: 'rule_engine' },
      );
    });

    it('should fallback to AI when rule validation fails', async () => {
      // Mock rule engine to return a response
      jest.spyOn(ruleEngineService, 'processItem').mockResolvedValue({
        requiresAiAssistance: false,
        modifications: { updatedPrice: 950 },
        confidence: ConfidenceLevel.HIGH,
        warnings: [],
      } as any);

      // Mock validation to fail for rules
      jest.spyOn(responseBuilderService, 'validateResponse')
        .mockResolvedValueOnce({
          isValid: false,
          overallConfidence: 0.6,
          requiresFallback: true,
          fallbackAction: { type: 'retry', reason: 'Low confidence' },
          levels: {
            level1: { level: 1, passed: false, confidence: 0.5 },
            level2: { level: 2, passed: true, confidence: 0.7 },
            level3: { level: 3, passed: true, confidence: 0.6 },
          },
        } as any)
        .mockResolvedValueOnce({
          isValid: true,
          overallConfidence: 0.85,
          requiresFallback: false,
          levels: {
            level1: { level: 1, passed: true, confidence: 0.9 },
            level2: { level: 2, passed: true, confidence: 0.8 },
            level3: { level: 3, passed: true, confidence: 0.85 },
          },
        } as any);

      const result = await service.getSuggestions(mockItem);

      expect(result.success).toBe(true);
      expect(responseBuilderService.validateResponse).toHaveBeenCalledTimes(2);
    });

    it('should handle AI suggestions with validation', async () => {
      // Mock rule engine to require AI assistance
      jest.spyOn(ruleEngineService, 'processItem').mockResolvedValue({
        requiresAiAssistance: true,
        modifications: {},
        confidence: ConfidenceLevel.UNCERTAIN,
        warnings: ['Unable to process with rules'],
      } as any);

      // Mock AI provider response
      const mockAiResponse = {
        recommendation: 'Adjust price based on market analysis',
        confidence: ConfidenceLevel.MEDIUM,
        explanation: 'Market analysis suggests price adjustment',
        alternatives: [],
        uncertaintyAreas: [],
      };

      // Mock the provideAiSuggestions method
      jest.spyOn(service as any, 'provideAiSuggestions').mockResolvedValue(mockAiResponse);

      // Mock validation to pass
      jest.spyOn(responseBuilderService, 'validateResponse').mockResolvedValue({
        isValid: true,
        overallConfidence: 0.82,
        requiresFallback: false,
        levels: {
          level1: { level: 1, passed: true, confidence: 0.8 },
          level2: { level: 2, passed: true, confidence: 0.85 },
          level3: { level: 3, passed: true, confidence: 0.81 },
        },
      } as any);

      const result = await service.getSuggestions(mockItem);

      expect(result.success).toBe(true);
      expect(result.confidence).toBe(ConfidenceLevel.MEDIUM);
      expect(responseBuilderService.validateResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          action: 'SUGGEST',
          result: mockAiResponse,
        }),
        { item: mockItem, source: 'ai_assistant' },
        0,
      );
    });

    it('should handle fallback actions correctly', async () => {
      // Mock rule engine to require AI assistance
      jest.spyOn(ruleEngineService, 'processItem').mockResolvedValue({
        requiresAiAssistance: true,
        modifications: {},
        confidence: ConfidenceLevel.UNCERTAIN,
        warnings: [],
      } as any);

      // Mock AI response
      jest.spyOn(service as any, 'provideAiSuggestions').mockResolvedValue({
        recommendation: 'Test recommendation',
        confidence: ConfidenceLevel.LOW,
        explanation: 'Low confidence analysis',
      });

      // Mock validation to require fallback
      jest.spyOn(responseBuilderService, 'validateResponse').mockResolvedValue({
        isValid: false,
        overallConfidence: 0.5,
        requiresFallback: true,
        fallbackAction: {
          type: 'human_review',
          reason: 'Critical internal contradictions detected',
        },
        levels: {
          level1: { level: 1, passed: false, confidence: 0.4 },
          level2: { level: 2, passed: true, confidence: 0.6 },
          level3: { level: 3, passed: true, confidence: 0.5 },
        },
      } as any);

      const result = await service.getSuggestions(mockItem);

      expect(result.success).toBe(false);
      expect(result.requiresManualReview).toBe(true);
      expect(result.confidence).toBe(ConfidenceLevel.UNCERTAIN);
      expect(result.explanation).toContain('Требуется ручная проверка');
    });

    it('should handle retry fallback with max retries', async () => {
      // Mock rule engine to require AI assistance
      jest.spyOn(ruleEngineService, 'processItem').mockResolvedValue({
        requiresAiAssistance: true,
        modifications: {},
        confidence: ConfidenceLevel.UNCERTAIN,
        warnings: [],
      } as any);

      // Mock AI response
      jest.spyOn(service as any, 'provideAiSuggestions').mockResolvedValue({
        recommendation: 'Test recommendation',
        confidence: ConfidenceLevel.MEDIUM,
        explanation: 'Test analysis',
      });

      // Mock validation to always require retry
      jest.spyOn(responseBuilderService, 'validateResponse').mockResolvedValue({
        isValid: false,
        overallConfidence: 0.6,
        requiresFallback: true,
        fallbackAction: {
          type: 'retry',
          reason: 'Low confidence',
          maxRetries: 2,
        },
        levels: {
          level1: { level: 1, passed: true, confidence: 0.6 },
          level2: { level: 2, passed: true, confidence: 0.6 },
          level3: { level: 3, passed: true, confidence: 0.6 },
        },
      } as any);

      const result = await service.getSuggestions(mockItem);

      // Should have been called 3 times (initial + 2 retries)
      expect(responseBuilderService.validateResponse).toHaveBeenCalledTimes(3);
      expect(result.requiresManualReview).toBe(true);
    });
  });
});
