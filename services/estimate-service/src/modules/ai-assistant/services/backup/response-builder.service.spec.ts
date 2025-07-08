import { Test, TestingModule } from '@nestjs/testing';
import { ResponseBuilderService } from './response-builder.service';
import { HistoricalEstimateService } from './historical-estimate.service';
import { ClaudeValidatorService } from './claude-validator.service';

describe('ResponseBuilderService', () => {
  let service: ResponseBuilderService;
  let historicalEstimateService: jest.Mocked<HistoricalEstimateService>;
  let claudeValidatorService: jest.Mocked<ClaudeValidatorService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponseBuilderService,
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
      ],
    }).compile();

    service = module.get<ResponseBuilderService>(ResponseBuilderService);
    historicalEstimateService = module.get(HistoricalEstimateService);
    claudeValidatorService = module.get(ClaudeValidatorService);
  });

  describe('buildResponse', () => {
    it('should return formatted response when validation passes with high confidence', async () => {
      const rawAnswer = 'The total cost is $100,000 for 500 square meters.';
      
      // Mock successful validations
      historicalEstimateService.compareWithHistorical.mockResolvedValue({
        isWithinRange: true,
        confidence: 0.9,
        deviations: [],
      });

      claudeValidatorService.validateWithClaude.mockResolvedValue({
        isValid: true,
        confidence: 0.95,
        issues: [],
      });

      const result = await service.buildResponse(rawAnswer);

      expect(result.success).toBe(true);
      expect(result.answer).toBe(rawAnswer);
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      expect(result.validation.passed).toBe(true);
    });

    it('should trigger retry fallback when confidence < 0.8 on first attempt', async () => {
      const rawAnswer = 'The cost is both $100,000 and not $100,000.';
      
      // Mock validations with contradictions
      historicalEstimateService.compareWithHistorical.mockResolvedValue({
        isWithinRange: true,
        confidence: 0.7,
        deviations: [],
      });

      claudeValidatorService.validateWithClaude.mockResolvedValue({
        isValid: false,
        confidence: 0.5,
        issues: ['Contradictory statements detected'],
      });

      const result = await service.buildResponse(rawAnswer);

      expect(result.success).toBe(false);
      expect(result.action).toBe('retry_required');
      expect(result.retryCount).toBe(1);
      expect(result.reason).toContain('confidence');
    });

    it('should flag for human review after multiple failed retries', async () => {
      const rawAnswer = 'Invalid response with contradictions';
      const context = { retryCount: 3 };

      // Mock very low confidence validations
      historicalEstimateService.compareWithHistorical.mockResolvedValue({
        isWithinRange: false,
        confidence: 0.3,
        deviations: [{ description: 'Significantly deviates from historical data' }],
      });

      claudeValidatorService.validateWithClaude.mockResolvedValue({
        isValid: false,
        confidence: 0.2,
        issues: ['Multiple logical errors'],
      });

      const validation = await service.validateResponse(rawAnswer, context, 3);
      
      expect(validation.requiresFallback).toBe(true);
      expect(validation.fallbackAction?.type).toBe('human_review');
    });

    it('should return degraded response when confidence is moderate', async () => {
      const rawAnswer = 'The estimated cost is approximately $95,000.';
      
      // Mock moderate confidence validations
      historicalEstimateService.compareWithHistorical.mockResolvedValue({
        isWithinRange: true,
        confidence: 0.75,
        deviations: [],
      });

      claudeValidatorService.validateWithClaude.mockResolvedValue({
        isValid: true,
        confidence: 0.7,
        issues: ['Minor uncertainty in calculations'],
      });

      const result = await service.buildResponse(rawAnswer);

      expect(result.degraded).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain(expect.stringContaining('Confidence score'));
    });
  });

  describe('validateResponse', () => {
    describe('Level 1: Internal Contradiction Checks', () => {
      it('should detect contradictory numbers', async () => {
        const response = 'The area is 100 m² but also mentioned as 200 m² in total.';
        
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: true,
          confidence: 0.9,
          deviations: [],
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: true,
          confidence: 0.9,
          issues: [],
        });

        const result = await service.validateResponse(response);
        
        expect(result.levels.level1.passed).toBe(false);
        expect(result.levels.level1.issues).toContain(
          expect.stringContaining('Contradictory values')
        );
      });

      it('should detect logical contradictions', async () => {
        const response = 'The cost both increased and decreased compared to last year.';
        
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: true,
          confidence: 0.9,
          deviations: [],
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: true,
          confidence: 0.9,
          issues: [],
        });

        const result = await service.validateResponse(response);
        
        expect(result.levels.level1.passed).toBe(false);
        expect(result.levels.level1.issues).toContain(
          expect.stringContaining('Contradictory trends')
        );
      });

      it('should detect impossible percentages', async () => {
        const response = 'The completion rate is 150% of the project.';
        
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: true,
          confidence: 0.9,
          deviations: [],
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: true,
          confidence: 0.9,
          issues: [],
        });

        const result = await service.validateResponse(response);
        
        expect(result.levels.level1.passed).toBe(false);
        expect(result.levels.level1.issues).toContain(
          expect.stringContaining('Impossible percentage')
        );
      });

      it('should detect mixed unit systems', async () => {
        const response = 'The area is 100 square meters or 300 square feet.';
        
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: true,
          confidence: 0.9,
          deviations: [],
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: true,
          confidence: 0.9,
          issues: [],
        });

        const result = await service.validateResponse(response);
        
        expect(result.levels.level1.passed).toBe(false);
        expect(result.levels.level1.issues).toContain(
          expect.stringContaining('Mixed unit systems')
        );
      });
    });

    describe('Level 2: Historical Comparison', () => {
      it('should pass when within historical range', async () => {
        const response = { cost: 100000, area: 500 };
        
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: true,
          confidence: 0.95,
          deviations: [],
          historicalRange: { min: 90000, max: 110000 },
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: true,
          confidence: 0.9,
          issues: [],
        });

        const result = await service.validateResponse(response);
        
        expect(result.levels.level2.passed).toBe(true);
        expect(result.levels.level2.confidence).toBe(0.95);
      });

      it('should fail when significantly deviates from historical data', async () => {
        const response = { cost: 500000, area: 500 };
        
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: false,
          confidence: 0.3,
          deviations: [
            {
              metric: 'cost',
              value: 500000,
              historicalRange: { min: 90000, max: 110000 },
              deviationPercentage: 400,
              description: 'Cost is 400% above historical maximum',
            },
          ],
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: true,
          confidence: 0.9,
          issues: [],
        });

        const result = await service.validateResponse(response);
        
        expect(result.levels.level2.passed).toBe(false);
        expect(result.levels.level2.confidence).toBe(0.3);
        expect(result.levels.level2.issues).toContain(
          expect.stringContaining('400% above historical maximum')
        );
      });
    });

    describe('Level 3: Claude Validation', () => {
      it('should pass with high confidence from Claude', async () => {
        const response = 'Valid construction estimate with proper details.';
        
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: true,
          confidence: 0.9,
          deviations: [],
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: true,
          confidence: 0.98,
          issues: [],
          semanticAnalysis: {
            coherence: 0.95,
            completeness: 0.98,
            relevance: 1.0,
          },
        });

        const result = await service.validateResponse(response);
        
        expect(result.levels.level3.passed).toBe(true);
        expect(result.levels.level3.confidence).toBe(0.98);
      });

      it('should fail when Claude detects issues', async () => {
        const response = 'Incomplete estimate missing key details.';
        
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: true,
          confidence: 0.9,
          deviations: [],
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: false,
          confidence: 0.4,
          issues: [
            'Missing material costs breakdown',
            'Labor estimates not provided',
            'Timeline information absent',
          ],
          semanticAnalysis: {
            coherence: 0.8,
            completeness: 0.3,
            relevance: 0.9,
          },
        });

        const result = await service.validateResponse(response);
        
        expect(result.levels.level3.passed).toBe(false);
        expect(result.levels.level3.confidence).toBe(0.4);
        expect(result.levels.level3.issues).toHaveLength(3);
      });
    });

    describe('Confidence Score Calculation', () => {
      it('should calculate weighted average correctly', async () => {
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: true,
          confidence: 0.8,
          deviations: [],
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: true,
          confidence: 0.9,
          issues: [],
        });

        const result = await service.validateResponse('Valid response');
        
        // Level 1: 1.0 * 0.2 = 0.2
        // Level 2: 0.8 * 0.3 = 0.24
        // Level 3: 0.9 * 0.5 = 0.45
        // Total: 0.89
        expect(result.overallConfidence).toBeCloseTo(0.89, 2);
      });

      it('should apply penalty for failed validations', async () => {
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: false,
          confidence: 0.8,
          deviations: [{ description: 'Out of range' }],
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: true,
          confidence: 0.9,
          issues: [],
        });

        const result = await service.validateResponse('Response with issues');
        
        // One validation failed, so penalty factor = 0.8
        // Base confidence would be ~0.89, with penalty: 0.89 * 0.8 = 0.712
        expect(result.overallConfidence).toBeLessThan(0.8);
      });
    });

    describe('Fallback Strategies', () => {
      it('should recommend retry for low confidence on first attempt', async () => {
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: true,
          confidence: 0.6,
          deviations: [],
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: true,
          confidence: 0.6,
          issues: [],
        });

        const result = await service.validateResponse('Low confidence response', {}, 0);
        
        expect(result.requiresFallback).toBe(true);
        expect(result.fallbackAction?.type).toBe('retry');
      });

      it('should recommend alternative model for historical deviations', async () => {
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: false,
          confidence: 0.3,
          deviations: [{ description: 'Significant deviation' }],
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: true,
          confidence: 0.9,
          issues: [],
        });

        const result = await service.validateResponse('Deviant response', {}, 1);
        
        expect(result.requiresFallback).toBe(true);
        expect(result.fallbackAction?.type).toBe('alternative_model');
      });

      it('should recommend human review for persistent low confidence', async () => {
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: true,
          confidence: 0.5,
          deviations: [],
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: true,
          confidence: 0.5,
          issues: ['Low quality response'],
        });

        const result = await service.validateResponse('Poor response', {}, 2);
        
        expect(result.requiresFallback).toBe(true);
        expect(result.fallbackAction?.type).toBe('human_review');
      });

      it('should return degraded response for moderate confidence', async () => {
        historicalEstimateService.compareWithHistorical.mockResolvedValue({
          isWithinRange: true,
          confidence: 0.7,
          deviations: [],
        });

        claudeValidatorService.validateWithClaude.mockResolvedValue({
          isValid: true,
          confidence: 0.75,
          issues: [],
        });

        const result = await service.validateResponse('Moderate response', {}, 1);
        
        expect(result.requiresFallback).toBe(true);
        expect(result.fallbackAction?.type).toBe('degraded_response');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in historical service gracefully', async () => {
      historicalEstimateService.compareWithHistorical.mockRejectedValue(
        new Error('Database connection failed')
      );

      claudeValidatorService.validateWithClaude.mockResolvedValue({
        isValid: true,
        confidence: 0.9,
        issues: [],
      });

      const result = await service.validateResponse('Valid response');
      
      expect(result.levels.level2.passed).toBe(true);
      expect(result.levels.level2.confidence).toBe(0.5);
      expect(result.levels.level2.issues).toContain('Historical comparison unavailable');
    });

    it('should handle errors in Claude service gracefully', async () => {
      historicalEstimateService.compareWithHistorical.mockResolvedValue({
        isWithinRange: true,
        confidence: 0.9,
        deviations: [],
      });

      claudeValidatorService.validateWithClaude.mockRejectedValue(
        new Error('Claude API timeout')
      );

      const result = await service.validateResponse('Valid response');
      
      expect(result.levels.level3.passed).toBe(true);
      expect(result.levels.level3.confidence).toBe(0.5);
      expect(result.levels.level3.issues).toContain('Claude validation unavailable');
    });

    it('should return emergency fallback on buildResponse error', async () => {
      const error = new Error('Unexpected error');
      jest.spyOn(service, 'validateResponse').mockRejectedValue(error);

      const result = await service.buildResponse('Any response');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to build validated response');
      expect(result.validation.requiresFallback).toBe(true);
    });
  });
});
