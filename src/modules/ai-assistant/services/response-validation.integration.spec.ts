import { Test, TestingModule } from '@nestjs/testing';
import { ResponseBuilderService } from './response-builder.service';
import { FallbackHandlerService } from './fallback-handler.service';
import { HistoricalEstimateService } from './historical-estimate.service';
import { ClaudeValidatorService } from './claude-validator.service';
import { AIAssistantService } from '../ai-assistant.service';

describe('Response Validation with Confidence Scoring and Fallback', () => {
  let responseBuilder: ResponseBuilderService;
  let fallbackHandler: FallbackHandlerService;
  let historicalService: HistoricalEstimateService;
  let claudeValidator: ClaudeValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponseBuilderService,
        FallbackHandlerService,
        {
          provide: HistoricalEstimateService,
          useValue: {
            compareWithHistorical: jest.fn(),
          },
        },
        {
          provide: ClaudeValidatorService,
          useValue: {
            validateWithClaude: jest.fn(),
          },
        },
        {
          provide: AIAssistantService,
          useValue: {
            generateEstimate: jest.fn(),
          },
        },
      ],
    }).compile();

    responseBuilder = module.get<ResponseBuilderService>(ResponseBuilderService);
    fallbackHandler = module.get<FallbackHandlerService>(FallbackHandlerService);
    historicalService = module.get<HistoricalEstimateService>(HistoricalEstimateService);
    claudeValidator = module.get<ClaudeValidatorService>(ClaudeValidatorService);
  });

  describe('Confidence Scoring', () => {
    it('should calculate high confidence when all validations pass', async () => {
      // Mock successful validations
      jest.spyOn(historicalService, 'compareWithHistorical').mockResolvedValue({
        isWithinRange: true,
        confidence: 0.9,
        deviations: [],
      });

      jest.spyOn(claudeValidator, 'validateWithClaude').mockResolvedValue({
        isValid: true,
        confidence: 0.95,
        issues: [],
      });

      const response = {
        estimate: 1000000,
        breakdown: {
          materials: 600000,
          labor: 300000,
          overhead: 100000,
        },
        description: 'Construction estimate for 100 m² building',
      };

      const validation = await responseBuilder.validateResponse(response);

      expect(validation.overallConfidence).toBeGreaterThan(0.8);
      expect(validation.requiresFallback).toBe(false);
      expect(validation.isValid).toBe(true);
    });

    it('should calculate low confidence with contradictions', async () => {
      const contradictoryResponse = {
        estimate: 1000000,
        description: 'The area is 100 m² and also 200 m². Cost increased by 50% and decreased by 30%.',
      };

      jest.spyOn(historicalService, 'compareWithHistorical').mockResolvedValue({
        isWithinRange: true,
        confidence: 0.8,
        deviations: [],
      });

      jest.spyOn(claudeValidator, 'validateWithClaude').mockResolvedValue({
        isValid: true,
        confidence: 0.85,
        issues: [],
      });

      const validation = await responseBuilder.validateResponse(contradictoryResponse);

      expect(validation.overallConfidence).toBeLessThan(0.8);
      expect(validation.requiresFallback).toBe(true);
      expect(validation.levels.level1.issues).toContain('Contradictory values found for m²: 100, 200');
    });

    it('should trigger fallback when confidence < 0.8', async () => {
      jest.spyOn(historicalService, 'compareWithHistorical').mockResolvedValue({
        isWithinRange: false,
        confidence: 0.4,
        deviations: [{ field: 'total', expected: 1000000, actual: 2000000, description: '100% deviation' }],
      });

      jest.spyOn(claudeValidator, 'validateWithClaude').mockResolvedValue({
        isValid: false,
        confidence: 0.5,
        issues: ['Response lacks justification', 'Calculations seem incorrect'],
      });

      const response = { estimate: 2000000 };
      const validation = await responseBuilder.validateResponse(response);

      expect(validation.requiresFallback).toBe(true);
      expect(validation.fallbackAction).toBeDefined();
      expect(validation.fallbackAction?.type).toBe('retry');
    });
  });

  describe('Fallback Strategies', () => {
    it('should retry with enhanced context on first failure', async () => {
      const validation = {
        isValid: false,
        overallConfidence: 0.6,
        requiresFallback: true,
        fallbackAction: {
          type: 'retry' as const,
          reason: 'Low overall confidence (0.60)',
          retryCount: 0,
          maxRetries: 3,
        },
        levels: {
          level1: { level: 1, passed: true, confidence: 0.8 },
          level2: { level: 2, passed: false, confidence: 0.4, issues: ['Deviates from historical data'] },
          level3: { level: 3, passed: true, confidence: 0.7 },
        },
        recommendations: ['Cross-reference with historical data'],
      };

      const originalRequest = { query: 'Estimate for construction' };
      const originalResponse = { estimate: 1000000 };

      const result = await fallbackHandler.handleFallback(
        validation,
        originalRequest,
        originalResponse,
      );

      expect(result.success).toBe(true);
      expect(result.action.type).toBe('retry');
      expect(result.metadata?.retryAttempt).toBe(1);
    });

    it('should switch to alternative model after multiple retries', async () => {
      const validation = {
        isValid: false,
        overallConfidence: 0.55,
        requiresFallback: true,
        fallbackAction: {
          type: 'alternative_model' as const,
          reason: 'Response deviates significantly from historical patterns',
          retryCount: 2,
          maxRetries: 3,
        },
        levels: {
          level1: { level: 1, passed: true, confidence: 0.9 },
          level2: { level: 2, passed: false, confidence: 0.3, issues: ['Significant deviation'] },
          level3: { level: 3, passed: true, confidence: 0.8 },
        },
      };

      const result = await fallbackHandler.handleFallback(
        validation,
        { query: 'test' },
        { estimate: 1000000 },
      );

      expect(result.action.type).toBe('alternative_model');
      expect(result.metadata?.alternativeModel).toBeDefined();
    });

    it('should flag for human review on critical failures', async () => {
      const validation = {
        isValid: false,
        overallConfidence: 0.25,
        requiresFallback: true,
        fallbackAction: {
          type: 'human_review' as const,
          reason: 'Multiple retries failed to resolve internal contradictions',
          retryCount: 3,
          maxRetries: 3,
        },
        levels: {
          level1: { level: 1, passed: false, confidence: 0.2, issues: ['Multiple contradictions'] },
          level2: { level: 2, passed: false, confidence: 0.3 },
          level3: { level: 3, passed: false, confidence: 0.25, issues: ['Invalid response'] },
        },
      };

      const result = await fallbackHandler.handleFallback(
        validation,
        { query: 'test' },
        { estimate: 1000000 },
      );

      expect(result.action.type).toBe('human_review');
      expect(result.success).toBe(true);
    });

    it('should return degraded response with warnings', async () => {
      const validation = {
        isValid: false,
        overallConfidence: 0.75,
        requiresFallback: true,
        fallbackAction: {
          type: 'degraded_response' as const,
          reason: 'Moderate confidence (0.75), flagging for review',
          retryCount: 1,
          maxRetries: 3,
        },
        levels: {
          level1: { level: 1, passed: true, confidence: 0.9 },
          level2: { level: 2, passed: true, confidence: 0.7 },
          level3: { level: 3, passed: false, confidence: 0.6, issues: ['Minor inaccuracies'] },
        },
        recommendations: ['Improve accuracy'],
      };

      const originalResponse = { estimate: 1000000, breakdown: {} };
      const result = await fallbackHandler.handleFallback(
        validation,
        { query: 'test' },
        originalResponse,
      );

      expect(result.action.type).toBe('degraded_response');
      expect(result.newResponse).toBeDefined();
      expect(result.newResponse.warnings).toContain('Response confidence: 75.0%');
      expect(result.newResponse.requiresReview).toBe(true);
    });
  });

  describe('Weighted Confidence Calculation', () => {
    it('should apply correct weights (20%, 30%, 50%)', async () => {
      // Mock specific confidence values
      jest.spyOn(historicalService, 'compareWithHistorical').mockResolvedValue({
        isWithinRange: true,
        confidence: 0.8, // Level 2: 30% weight
        deviations: [],
      });

      jest.spyOn(claudeValidator, 'validateWithClaude').mockResolvedValue({
        isValid: true,
        confidence: 0.9, // Level 3: 50% weight
        issues: [],
      });

      const response = { estimate: 1000000 };
      const validation = await responseBuilder.validateResponse(response);

      // Level 1 should have confidence 1.0 (no issues), weight 20%
      // Level 2 confidence 0.8, weight 30%
      // Level 3 confidence 0.9, weight 50%
      // Expected: (1.0 * 0.2) + (0.8 * 0.3) + (0.9 * 0.5) = 0.2 + 0.24 + 0.45 = 0.89
      expect(validation.overallConfidence).toBeCloseTo(0.89, 2);
    });

    it('should apply penalty for failed validations', async () => {
      jest.spyOn(historicalService, 'compareWithHistorical').mockResolvedValue({
        isWithinRange: false, // Failed validation
        confidence: 0.8,
        deviations: [{ field: 'total', expected: 1000000, actual: 2000000, description: 'High deviation' }],
      });

      jest.spyOn(claudeValidator, 'validateWithClaude').mockResolvedValue({
        isValid: true,
        confidence: 0.9,
        issues: [],
      });

      const response = { estimate: 2000000 };
      const validation = await responseBuilder.validateResponse(response);

      // With one failed validation, apply 20% penalty
      // Base confidence would be ~0.89, with penalty: 0.89 * 0.8 = 0.712
      expect(validation.overallConfidence).toBeLessThan(0.8);
      expect(validation.requiresFallback).toBe(true);
    });
  });
});
