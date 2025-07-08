import { Test, TestingModule } from '@nestjs/testing';
import { PredictionService } from './prediction.service';
import { HuggingFaceService } from './huggingface.service';
import { PredictCostDto } from '../dto/predict-cost.dto';

describe('PredictionService', () => {
  let service: PredictionService;
  let huggingFaceService: HuggingFaceService;

  const mockHuggingFaceService = {
    extractFeatures: jest.fn().mockResolvedValue([100, 2, 3, 1.5, 180]),
    predictWithModel: jest.fn().mockResolvedValue({ prediction: 0.85 }),
    analyzeSentiment: jest.fn().mockResolvedValue({ sentiment: 'positive' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictionService,
        {
          provide: HuggingFaceService,
          useValue: mockHuggingFaceService,
        },
      ],
    }).compile();

    service = module.get<PredictionService>(PredictionService);
    huggingFaceService = module.get<HuggingFaceService>(HuggingFaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('predictCost', () => {
    it('should predict cost based on project parameters', async () => {
      const predictCostDto: PredictCostDto = {
        projectName: 'Test Project',
        projectType: 'residential',
        area: 100,
        floors: 2,
        materials: ['concrete', 'steel'],
        location: 'moscow',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
      };

      const result = await service.predictCost(predictCostDto);

      expect(result).toBeDefined();
      expect(result.estimatedCost).toBeGreaterThan(0);
      expect(result.confidence).toBe(0.85);
      expect(result.breakdown).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(huggingFaceService.extractFeatures).toHaveBeenCalledWith(predictCostDto);
    });
  });

  describe('analyzeRisks', () => {
    it('should analyze project risks', async () => {
      const result = await service.analyzeRisks();

      expect(result).toBeDefined();
      expect(result.overallRiskScore).toBeGreaterThan(0);
      expect(result.riskFactors).toHaveLength(3);
      expect(result.recommendations).toBeDefined();
      expect(result.potentialOverspend).toBe(0.15);
    });
  });

  describe('optimizeBudget', () => {
    it('should optimize project budget', async () => {
      const result = await service.optimizeBudget();

      expect(result).toBeDefined();
      expect(result.originalBudget).toBeGreaterThan(0);
      expect(result.optimizedBudget).toBeLessThan(result.originalBudget);
      expect(result.savings).toBeGreaterThan(0);
      expect(result.optimizations).toHaveLength(3);
    });
  });
});
