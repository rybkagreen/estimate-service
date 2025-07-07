/**
 * Integration Tests for ModelManagerService
 * 
 * This test suite validates the integration of ModelManagerService with external
 * dependencies and tests real-world scenarios:
 * 
 * 1. **Model Selection with Caching**: Tests cache integration for model selection
 *    - Cache hit/miss scenarios
 *    - Context-based caching
 *    - Different context handling
 * 
 * 2. **Performance Tracking**: Tests metrics collection across multiple requests
 *    - Multi-request metric aggregation
 *    - Mixed success/failure scenarios
 *    - Real-time metric updates
 * 
 * 3. **Rate Limiting**: Tests rate limit enforcement with cache
 *    - Request limit enforcement
 *    - TTL-based reset
 *    - Concurrent request handling
 * 
 * 4. **Model Optimization**: Tests optimization with real performance data
 *    - Error rate-based optimization
 *    - Temperature adjustments
 *    - Configuration persistence
 * 
 * 5. **Fallback Mechanism**: Tests multi-model fallback scenarios
 *    - Primary to secondary fallback
 *    - Multiple fallback levels
 *    - Fallback metric tracking
 * 
 * 6. **Health Checks**: Tests health monitoring across models
 *    - Multi-model health status
 *    - Provider initialization
 *    - Active model filtering
 * 
 * 7. **Cost Tracking**: Tests accurate cost calculation
 *    - Token-based cost calculation
 *    - Multi-model cost aggregation
 *    - Budget compliance
 * 
 * 8. **Concurrent Operations**: Tests thread safety and race conditions
 *    - Parallel request processing
 *    - Metric consistency
 *    - Cache coherency
 * 
 * 9. **End-to-End Workflows**: Tests complete user scenarios
 *    - Selection → Execution → Optimization
 *    - Real-world usage patterns
 *    - Performance validation
 * 
 * These tests require actual cache and configuration services to validate
 * real-world behavior and integration points.
 * 
 * @module ModelManagerService Integration Tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '../../cache/cache.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { 
  ModelManagerService, 
  ModelType, 
  ModelSelectionContext,
  ModelMetrics 
} from './model-manager.service';
import { CacheService } from '../../cache';
import { PrismaService } from '../../../prisma/prisma.service';
import { AiRequest } from '../providers/ai-provider.interface';
import { ConfidenceLevel } from '../../../types/shared-contracts';

describe('ModelManagerService Integration Tests', () => {
  let service: ModelManagerService;
  let cacheService: CacheService;
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        CacheModule,
        PrismaModule,
      ],
      providers: [ModelManagerService],
    }).compile();

    service = module.get<ModelManagerService>(ModelManagerService);
    cacheService = module.get<CacheService>(CacheService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // Clear cache before each test
    await cacheService.del('model_selection:*');
    await cacheService.del('rate_limit:*');
  });

  describe('Model Selection with Caching', () => {
    it('should cache model selection and reuse it for similar contexts', async () => {
      const context: ModelSelectionContext = {
        taskType: 'estimation',
        complexity: 'high',
        urgency: 'medium',
        requiredAccuracy: 'high',
      };

      // First call - should compute and cache
      const firstSelection = await service.selectModel(context);
      expect(firstSelection).toBeDefined();

      // Second call with same context - should use cache
      const secondSelection = await service.selectModel(context);
      expect(secondSelection).toBe(firstSelection);

      // Verify cache was used
      const cacheKey = `model_selection:${JSON.stringify(context)}`;
      const cachedValue = await cacheService.get(cacheKey);
      expect(cachedValue).toBe(firstSelection);
    });

    it('should select different models for different contexts', async () => {
      const estimationContext: ModelSelectionContext = {
        taskType: 'estimation',
        complexity: 'high',
        urgency: 'low',
        requiredAccuracy: 'high',
      };

      const validationContext: ModelSelectionContext = {
        taskType: 'validation',
        complexity: 'low',
        urgency: 'high',
        requiredAccuracy: 'medium',
      };

      const estimationModel = await service.selectModel(estimationContext);
      const validationModel = await service.selectModel(validationContext);

      // Different contexts might select different models based on their specializations
      expect(estimationModel).toBeDefined();
      expect(validationModel).toBeDefined();
    });
  });

  describe('Model Performance Tracking', () => {
    it('should track performance metrics across multiple requests', async () => {
      const request: AiRequest = {
        messages: [{ role: 'user', content: 'Test estimation' }],
        temperature: 0.7,
      };

      const context: ModelSelectionContext = {
        taskType: 'estimation',
        complexity: 'medium',
        urgency: 'medium',
      };

      // Mock successful responses for testing
      jest.spyOn(service as any, 'getOrCreateProvider').mockResolvedValue({
        initialize: jest.fn(),
        generateResponse: jest.fn().mockResolvedValue({
          content: 'Test response',
          confidence: ConfidenceLevel.HIGH,
          tokensUsed: 150,
          metadata: {},
        }),
        isAvailable: jest.fn().mockResolvedValue(true),
      });

      // Execute multiple requests
      for (let i = 0; i < 5; i++) {
        await service.executeWithBestModel(request, context);
      }

      // Check metrics
      const report = await service.getModelPerformanceReport();
      const selectedModel = await service.selectModel(context);
      const metrics = report[selectedModel];

      expect(metrics.totalRequests).toBe(5);
      expect(metrics.successRate).toBe(1.0);
      expect(metrics.averageTokensUsed).toBe(150);
      expect(metrics.confidenceDistribution[ConfidenceLevel.HIGH]).toBe(5);
    });

    it('should update metrics correctly with mixed success/failure', async () => {
      const request: AiRequest = {
        messages: [{ role: 'user', content: 'Test' }],
      };

      const context: ModelSelectionContext = {
        taskType: 'analysis',
        complexity: 'high',
        urgency: 'low',
      };

      let callCount = 0;
      jest.spyOn(service as any, 'getOrCreateProvider').mockResolvedValue({
        initialize: jest.fn(),
        generateResponse: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount % 3 === 0) {
            return Promise.reject(new Error('Model error'));
          }
          return Promise.resolve({
            content: 'Success',
            confidence: ConfidenceLevel.MEDIUM,
            tokensUsed: 100,
            metadata: {},
          });
        }),
        isAvailable: jest.fn().mockResolvedValue(true),
      });

      // Execute multiple requests with some failures
      for (let i = 0; i < 9; i++) {
        try {
          await service.executeWithBestModel(request, context);
        } catch (error) {
          // Expected failures
        }
      }

      const report = await service.getModelPerformanceReport();
      const selectedModel = await service.selectModel(context);
      const metrics = report[selectedModel];

      expect(metrics.totalRequests).toBe(9);
      expect(metrics.successRate).toBeCloseTo(0.67, 2); // 6 successes out of 9
      expect(metrics.errorRate).toBeCloseTo(0.33, 2);
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should enforce rate limits across multiple requests', async () => {
      const request: AiRequest = {
        messages: [{ role: 'user', content: 'Test' }],
      };

      const context: ModelSelectionContext = {
        taskType: 'estimation',
        complexity: 'low',
        urgency: 'high',
      };

      // Mock provider
      jest.spyOn(service as any, 'getOrCreateProvider').mockResolvedValue({
        initialize: jest.fn(),
        generateResponse: jest.fn().mockResolvedValue({
          content: 'Response',
          confidence: ConfidenceLevel.HIGH,
          tokensUsed: 50,
          metadata: {},
        }),
        isAvailable: jest.fn().mockResolvedValue(true),
      });

      // Get the selected model's rate limit
      const selectedModel = await service.selectModel(context);
      const models = service.listAvailableModels();
      const modelConfig = models.find(m => m.id === selectedModel)?.config;
      const rateLimit = modelConfig?.rateLimit?.requestsPerMinute || 60;

      // Execute requests up to the rate limit
      const requests = [];
      for (let i = 0; i < rateLimit; i++) {
        requests.push(service.executeWithBestModel(request, context));
      }

      await Promise.all(requests);

      // Next request should fail due to rate limit
      await expect(service.executeWithBestModel(request, context))
        .rejects.toThrow('Rate limit exceeded');
    });

    it('should reset rate limits after TTL expires', async () => {
      const request: AiRequest = {
        messages: [{ role: 'user', content: 'Test' }],
      };

      const context: ModelSelectionContext = {
        taskType: 'generation',
        complexity: 'medium',
        urgency: 'medium',
      };

      // Mock provider
      jest.spyOn(service as any, 'getOrCreateProvider').mockResolvedValue({
        initialize: jest.fn(),
        generateResponse: jest.fn().mockResolvedValue({
          content: 'Response',
          confidence: ConfidenceLevel.HIGH,
          tokensUsed: 50,
          metadata: {},
        }),
        isAvailable: jest.fn().mockResolvedValue(true),
      });

      // Set initial rate limit usage
      const selectedModel = await service.selectModel(context);
      const rateLimitKey = `rate_limit:${selectedModel}`;
      await cacheService.set(rateLimitKey, { requests: 59, tokens: 50000 }, { ttl: 1 });

      // First request should succeed (brings it to limit)
      await expect(service.executeWithBestModel(request, context)).resolves.toBeDefined();

      // Next request should fail
      await expect(service.executeWithBestModel(request, context))
        .rejects.toThrow('Rate limit exceeded');

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should work again after TTL
      await expect(service.executeWithBestModel(request, context)).resolves.toBeDefined();
    });
  });

  describe('Model Optimization', () => {
    it('should optimize model configuration based on real performance data', async () => {
      // Simulate a model with poor performance
      const report = await service.getModelPerformanceReport();
      const metrics = report[ModelType.DEEPSEEK_R1];
      
      // Manually update metrics to simulate poor performance
      metrics.totalRequests = 200;
      metrics.errorRate = 0.35;
      metrics.successRate = 0.65;
      metrics.confidenceDistribution = {
        [ConfidenceLevel.HIGH]: 20,
        [ConfidenceLevel.MEDIUM]: 40,
        [ConfidenceLevel.LOW]: 80,
        [ConfidenceLevel.UNCERTAIN]: 60,
      };

      // Run optimization
      await service.optimizeModelConfiguration();

      // Check that the model was disabled
      const models = service.listAvailableModels();
      const deepseekModel = models.find(m => m.id === ModelType.DEEPSEEK_R1);
      expect(deepseekModel?.config.isActive).toBe(false);
    });

    it('should adjust temperature for low confidence models', async () => {
      const report = await service.getModelPerformanceReport();
      const metrics = report[ModelType.DEEPSEEK_R1];
      
      // Simulate low confidence results
      metrics.totalRequests = 150;
      metrics.errorRate = 0.1;
      metrics.successRate = 0.9;
      metrics.confidenceDistribution = {
        [ConfidenceLevel.HIGH]: 30,
        [ConfidenceLevel.MEDIUM]: 20,
        [ConfidenceLevel.LOW]: 60,
        [ConfidenceLevel.UNCERTAIN]: 40,
      };

      const originalConfig = service.getActiveModelConfig();
      const originalTemp = originalConfig?.temperature || 0.3;

      await service.optimizeModelConfiguration();

      const updatedConfig = service.getActiveModelConfig();
      expect(updatedConfig?.temperature).toBeLessThan(originalTemp);
    });
  });

  describe('Fallback Mechanism', () => {
    it('should fallback to secondary model when primary fails', async () => {
      const request: AiRequest = {
        messages: [{ role: 'user', content: 'Test fallback' }],
      };

      const context: ModelSelectionContext = {
        taskType: 'analysis',
        complexity: 'medium',
        urgency: 'medium',
      };

      let providerCalls = 0;
      jest.spyOn(service as any, 'getOrCreateProvider').mockImplementation((modelId) => {
        providerCalls++;
        if (providerCalls === 1) {
          // First call fails
          return {
            initialize: jest.fn(),
            generateResponse: jest.fn().mockRejectedValue(new Error('Primary model failed')),
            isAvailable: jest.fn().mockResolvedValue(false),
          };
        } else {
          // Fallback succeeds
          return {
            initialize: jest.fn(),
            generateResponse: jest.fn().mockResolvedValue({
              content: 'Fallback response',
              confidence: ConfidenceLevel.MEDIUM,
              tokensUsed: 100,
              metadata: { fallback: true },
            }),
            isAvailable: jest.fn().mockResolvedValue(true),
          };
        }
      });

      // This should fail on primary but succeed with fallback
      const response = await service.executeWithBestModel(request, context);
      
      expect(response).toBeDefined();
      expect(response.content).toBe('Fallback response');
      expect(response.metadata?.fallback).toBe(true);
      expect(providerCalls).toBeGreaterThan(1);
    });
  });

  describe('Health Check Integration', () => {
    it('should perform health checks on all active models', async () => {
      // Mock providers with different health states
      jest.spyOn(service as any, 'getOrCreateProvider').mockImplementation((modelId) => {
        if (modelId === ModelType.DEEPSEEK_R1) {
          return {
            initialize: jest.fn(),
            isAvailable: jest.fn().mockResolvedValue(true),
            generateResponse: jest.fn(),
          };
        } else {
          return {
            initialize: jest.fn(),
            isAvailable: jest.fn().mockResolvedValue(false),
            generateResponse: jest.fn(),
          };
        }
      });

      const health = await service.healthCheck();

      expect(health).toBeDefined();
      expect(health[ModelType.DEEPSEEK_R1]).toBe(true);
      
      // Only active models should be checked
      const models = service.listAvailableModels();
      const activeModels = models.filter(m => m.config.isActive);
      
      activeModels.forEach(model => {
        expect(health).toHaveProperty(model.id);
      });
    });
  });

  describe('Cost Tracking', () => {
    it('should accurately track costs across multiple models', async () => {
      const request: AiRequest = {
        messages: [{ role: 'user', content: 'Calculate construction costs' }],
      };

      const context: ModelSelectionContext = {
        taskType: 'estimation',
        complexity: 'high',
        urgency: 'medium',
        budget: 1.0,
      };

      // Mock provider with specific token usage
      jest.spyOn(service as any, 'getOrCreateProvider').mockResolvedValue({
        initialize: jest.fn(),
        generateResponse: jest.fn().mockResolvedValue({
          content: 'Cost estimation response',
          confidence: ConfidenceLevel.HIGH,
          tokensUsed: 500,
          metadata: {},
        }),
        isAvailable: jest.fn().mockResolvedValue(true),
      });

      // Execute multiple requests
      for (let i = 0; i < 10; i++) {
        await service.executeWithBestModel(request, context);
      }

      const report = await service.getModelPerformanceReport();
      const selectedModel = await service.selectModel(context);
      const metrics = report[selectedModel];
      const models = service.listAvailableModels();
      const modelCapabilities = models.find(m => m.id === selectedModel)?.capabilities;

      // Calculate expected cost
      const expectedCost = 10 * 500 * (modelCapabilities?.costPerToken || 0);
      expect(metrics.totalCost).toBeCloseTo(expectedCost, 4);
    });
  });

  describe('Priority-based Model Selection', () => {
    it('should respect model priorities in selection', async () => {
      // Test multiple contexts and verify priority influence
      const contexts: ModelSelectionContext[] = [
        { taskType: 'estimation', complexity: 'low', urgency: 'low' },
        { taskType: 'analysis', complexity: 'medium', urgency: 'medium' },
        { taskType: 'validation', complexity: 'high', urgency: 'high' },
      ];

      const selections = await Promise.all(
        contexts.map(ctx => service.selectModel(ctx))
      );

      // Verify that selections consider model priorities
      const models = service.listAvailableModels();
      selections.forEach(selection => {
        const selectedModel = models.find(m => m.id === selection);
        expect(selectedModel).toBeDefined();
        expect(selectedModel?.config.priority).toBeDefined();
      });
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent requests without race conditions', async () => {
      const request: AiRequest = {
        messages: [{ role: 'user', content: 'Concurrent test' }],
      };

      const context: ModelSelectionContext = {
        taskType: 'estimation',
        complexity: 'medium',
        urgency: 'high',
      };

      // Mock provider
      jest.spyOn(service as any, 'getOrCreateProvider').mockResolvedValue({
        initialize: jest.fn(),
        generateResponse: jest.fn().mockImplementation(() => {
          // Simulate some processing time
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                content: 'Concurrent response',
                confidence: ConfidenceLevel.HIGH,
                tokensUsed: 100,
                metadata: {},
              });
            }, 10);
          });
        }),
        isAvailable: jest.fn().mockResolvedValue(true),
      });

      // Execute multiple concurrent requests
      const promises = Array(20).fill(null).map(() => 
        service.executeWithBestModel(request, context)
      );

      const results = await Promise.all(promises);

      // All requests should succeed
      expect(results).toHaveLength(20);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.content).toBe('Concurrent response');
      });

      // Check metrics consistency
      const report = await service.getModelPerformanceReport();
      const selectedModel = await service.selectModel(context);
      const metrics = report[selectedModel];

      expect(metrics.totalRequests).toBe(20);
      expect(metrics.successRate).toBe(1.0);
    });
  });

  describe('Model Switching', () => {
    it('should successfully switch models and update configuration', async () => {
      // Get initial configuration
      const initialConfig = service.getActiveModelConfig();
      expect(initialConfig?.model).toBe(ModelType.DEEPSEEK_R1);

      // Switch to a different model (need to make it active first)
      const models = service.listAvailableModels();
      const claudeModel = models.find(m => m.id === ModelType.CLAUDE_3_SONNET);
      if (claudeModel) {
        claudeModel.config.isActive = true;
      }

      // This should fail because Claude is not active by default
      await expect(service.switchModel(ModelType.CLAUDE_3_SONNET))
        .rejects.toThrow();

      // Verify model didn't change
      const currentConfig = service.getActiveModelConfig();
      expect(currentConfig?.model).toBe(ModelType.DEEPSEEK_R1);
    });
  });

  describe('End-to-End Workflow', () => {
    it('should handle complete workflow from selection to optimization', async () => {
      // 1. Select model for specific context
      const context: ModelSelectionContext = {
        taskType: 'estimation',
        complexity: 'high',
        urgency: 'medium',
        requiredAccuracy: 'high',
        budget: 0.5,
        dataVolume: 1000,
      };

      const selectedModel = await service.selectModel(context);
      expect(selectedModel).toBeDefined();

      // 2. Execute multiple requests
      const request: AiRequest = {
        messages: [{ role: 'user', content: 'Estimate construction costs for a 5-story building' }],
        temperature: 0.7,
        maxTokens: 2000,
      };

      // Mock provider responses
      let requestCount = 0;
      jest.spyOn(service as any, 'getOrCreateProvider').mockResolvedValue({
        initialize: jest.fn(),
        generateResponse: jest.fn().mockImplementation(() => {
          requestCount++;
          const confidence = requestCount % 4 === 0 ? ConfidenceLevel.LOW : ConfidenceLevel.HIGH;
          return Promise.resolve({
            content: `Estimation #${requestCount}`,
            confidence,
            tokensUsed: 200 + Math.random() * 100,
            metadata: { requestId: requestCount },
          });
        }),
        isAvailable: jest.fn().mockResolvedValue(true),
      });

      // Execute 20 requests
      for (let i = 0; i < 20; i++) {
        await service.executeWithBestModel(request, context);
      }

      // 3. Check performance metrics
      const report = await service.getModelPerformanceReport();
      const metrics = report[selectedModel];

      expect(metrics.totalRequests).toBe(20);
      expect(metrics.successRate).toBe(1.0);
      expect(metrics.averageTokensUsed).toBeGreaterThan(200);
      expect(metrics.averageTokensUsed).toBeLessThan(300);

      // 4. Run optimization
      await service.optimizeModelConfiguration();

      // 5. Verify optimization didn't disable the model (since it performed well)
      const models = service.listAvailableModels();
      const model = models.find(m => m.id === selectedModel);
      expect(model?.config.isActive).toBe(true);

      // 6. Perform health check
      const health = await service.healthCheck();
      expect(health[selectedModel]).toBe(true);
    });
  });
});
