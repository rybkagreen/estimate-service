import { Test, TestingModule } from '@nestjs/testing';
import { ResponseBuilderService } from './response-builder.service';
import { HistoricalEstimateService } from './historical-estimate.service';
import { ClaudeValidatorService } from './claude-validator.service';

describe('ResponseBuilderService', () => {
  let service: ResponseBuilderService;
  let historicalEstimateService: HistoricalEstimateService;
  let claudeValidatorService: ClaudeValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponseBuilderService,
        HistoricalEstimateService,
        ClaudeValidatorService,
      ],
    }).compile();

    service = module.get<ResponseBuilderService>(ResponseBuilderService);
    historicalEstimateService = module.get<HistoricalEstimateService>(
      HistoricalEstimateService,
    );
    claudeValidatorService = module.get<ClaudeValidatorService>(
      ClaudeValidatorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateResponse', () => {
    it('should validate a valid response successfully', async () => {
      const validResponse = {
        estimate: {
          totalCost: 1500000,
          costPerSqm: 1500,
          area: 1000,
          duration: '12 months',
          breakdown: {
            materials: 600000,
            labor: '40%',
            equipment: 300000,
          },
        },
        description:
          'The estimated cost for this residential project is $1,500,000 with a cost of $1,500 per m².',
      };

      const context = {
        projectType: 'residential',
        location: 'suburban',
      };

      const result = await service.validateResponse(validResponse, context);

      expect(result).toBeDefined();
      expect(result.levels.level1).toBeDefined();
      expect(result.levels.level2).toBeDefined();
      expect(result.levels.level3).toBeDefined();
      expect(result.overallConfidence).toBeGreaterThan(0);
    });

    it('should detect contradictions in Level 1 validation', async () => {
      const contradictoryResponse = `
        The total cost is $1,000,000 for the 500 m² project.
        The cost per m² is $5,000.
        The project will take 6 months and also 12 months to complete.
        The area is both 500 m² and 800 m².
      `;

      const result = await service.validateResponse(contradictoryResponse);

      expect(result.levels.level1.passed).toBe(false);
      expect(result.levels.level1.issues).toBeDefined();
      expect(result.levels.level1.issues!.length).toBeGreaterThan(0);
      expect(result.isValid).toBe(false);
    });

    it('should detect unit mixing in Level 1 validation', async () => {
      const mixedUnitsResponse = `
        The building height is 50 meters and 150 feet.
        The area is 1000 m² or 10,764 square feet.
        The concrete volume needed is 500 m³.
      `;

      const result = await service.validateResponse(mixedUnitsResponse);

      expect(result.levels.level1.issues).toBeDefined();
      const unitIssue = result.levels.level1.issues?.find((issue) =>
        issue.includes('Mixed unit systems'),
      );
      expect(unitIssue).toBeDefined();
    });

    it('should detect impossible percentages', async () => {
      const impossiblePercentResponse = `
        The project efficiency is 150%.
        Labor costs account for 120% of the total budget.
      `;

      const result = await service.validateResponse(impossiblePercentResponse);

      expect(result.levels.level1.passed).toBe(false);
      expect(result.levels.level1.issues).toBeDefined();
      const percentageIssue = result.levels.level1.issues?.find((issue) =>
        issue.includes('Impossible percentage'),
      );
      expect(percentageIssue).toBeDefined();
    });

    it('should handle null/undefined responses', async () => {
      const result = await service.validateResponse(null);

      expect(result.isValid).toBe(false);
      expect(result.levels.level1.passed).toBe(false);
      expect(result.levels.level1.issues).toContain(
        'Response is null or undefined',
      );
    });

    it('should generate recommendations based on issues', async () => {
      const problematicResponse = `
        The cost is $1,000 per m² and also $2,000 per m².
        The percentage of completion is 150%.
        The building is 50 meters and 150 feet tall.
      `;

      const result = await service.validateResponse(problematicResponse);

      expect(result.recommendations).toBeDefined();
      expect(result.recommendations!.length).toBeGreaterThan(0);
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          'Review and resolve contradictory statements',
          'Verify percentage calculations',
          'Standardize measurement units',
        ]),
      );
    });

    it('should calculate weighted overall confidence', async () => {
      // Mock the individual validation results
      jest
        .spyOn(historicalEstimateService, 'compareWithHistorical')
        .mockResolvedValue({
          isWithinRange: true,
          confidence: 0.8,
          deviations: [],
        });

      jest
        .spyOn(claudeValidatorService, 'validateWithClaude')
        .mockResolvedValue({
          isValid: true,
          confidence: 0.9,
        });

      const validResponse = 'The estimated cost is $1,500 per m² for the residential project.';

      const result = await service.validateResponse(validResponse);

      // Level 1: 20% weight, Level 2: 30% weight, Level 3: 50% weight
      // If all pass with high confidence, overall should be high
      expect(result.overallConfidence).toBeGreaterThan(0.7);
    });

    it('should handle historical comparison unavailable gracefully', async () => {
      jest
        .spyOn(historicalEstimateService, 'compareWithHistorical')
        .mockRejectedValue(new Error('Service unavailable'));

      const response = 'The estimated cost is $1,500 per m².';

      const result = await service.validateResponse(response);

      expect(result.levels.level2.passed).toBe(true);
      expect(result.levels.level2.confidence).toBe(0.5);
      expect(result.levels.level2.issues).toContain(
        'Historical comparison unavailable',
      );
    });

    it('should handle Claude validator unavailable gracefully', async () => {
      jest
        .spyOn(claudeValidatorService, 'validateWithClaude')
        .mockRejectedValue(new Error('Claude API error'));

      const response = 'The estimated cost is $1,500 per m².';

      const result = await service.validateResponse(response);

      expect(result.levels.level3.passed).toBe(true);
      expect(result.levels.level3.confidence).toBe(0.5);
      expect(result.levels.level3.issues).toContain(
        'Claude validation unavailable',
      );
    });
  });
});
