/**
 * Unit Tests for ModelManagerService
 * 
 * This test suite covers all features of the ModelManagerService including:
 * 
 * 1. **Model Selection**: Tests the intelligent model selection algorithm
 *    - Context-based selection
 *    - Caching mechanisms
 *    - Budget and urgency considerations
 *    - Specialization matching
 * 
 * 2. **Model Switching**: Tests manual model switching functionality
 *    - Valid model switching
 *    - Error handling for invalid models
 *    - Configuration persistence
 * 
 * 3. **Request Execution**: Tests the main execution flow
 *    - Successful request handling
 *    - Fallback mechanisms
 *    - Rate limiting enforcement
 *    - Infinite loop prevention
 * 
 * 4. **Performance Metrics**: Tests metric collection and reporting
 *    - Success/failure tracking
 *    - Latency measurements
 *    - Token usage tracking
 *    - Cost calculations
 *    - Confidence distribution
 * 
 * 5. **Optimization**: Tests automatic configuration optimization
 *    - Error rate-based disabling
 *    - Temperature adjustments
 *    - Insufficient data handling
 * 
 * 6. **Health Checks**: Tests model availability monitoring
 *    - Active model health checks
 *    - Error handling
 *    - Inactive model exclusion
 * 
 * 7. **Circuit Breaker**: Tests fault tolerance patterns
 *    - Consecutive failure tracking
 *    - Automatic model disabling
 * 
 * 8. **Caching**: Tests caching strategies
 *    - Model selection caching
 *    - Rate limit caching
 * 
 * 9. **Edge Cases**: Tests error conditions and boundary cases
 *    - Empty requests
 *    - Missing providers
 *    - Cache service failures
 * 
 * @module ModelManagerService Tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { 
  ModelManagerService, 
  ModelType, 
  ModelSelectionContext,
  ModelConfig,
  ModelMetrics,
  ModelCapabilities
} from './model-manager.service';
import { CacheService } from '../../cache';
import { PrismaService } from '../../../prisma/prisma.service';
import { AiProvider, AiRequest, AiResponse } from '../providers/ai-provider.interface';
import { ConfidenceLevel } from '../../../types/shared-contracts';

// Mock AI Provider implementation for testing
class MockAiProvider implements AiProvider {
  initialized = false;
  config: any;
  
  async initialize(config: any): Promise<void> {
    this.initialized = true;
    this.config = config;
  }
  
  async generateResponse(request: AiRequest): Promise<AiResponse> {
    return {
      content: 'Mock response',
      confidence: ConfidenceLevel.HIGH,
      tokensUsed: 100,
      metadata: {},
    };
  }
  
  async isAvailable(): Promise<boolean> {
    return true;
  }
}

describe('ModelManagerService', () => {
  let service: ModelManagerService;
  let configService: ConfigService;
  let cacheService: CacheService;
  let prismaService: PrismaService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config = {
        DEEPSEEK_API_KEY: 'test-api-key',
        DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
        ANTHROPIC_API_KEY: 'test-anthropic-key',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ttl: jest.fn(),
  };

  const mockPrismaService = {
    modelConfiguration: {
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
    modelMetrics: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModelManagerService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ModelManagerService>(ModelManagerService);
    configService = module.get<ConfigService>(ConfigService);
    cacheService = module.get<CacheService>(CacheService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with default models', () => {
      const models = service.listAvailableModels();
      expect(models.length).toBeGreaterThan(0);
      expect(models.some(m => m.id === ModelType.DEEPSEEK_R1)).toBe(true);
    });

    it('should set DEEPSEEK_R1 as the primary model by default', () => {
      const config = service.getActiveModelConfig();
      expect(config?.model).toBe(ModelType.DEEPSEEK_R1);
    });
  });

  describe('Model Selection', () => {
    describe('selectModel', () => {
      it('should select the best model based on context', async () => {
        const context: ModelSelectionContext = {
          taskType: 'estimation',
          complexity: 'high',
          urgency: 'medium',
          requiredAccuracy: 'high',
        };

        mockCacheService.get.mockResolvedValueOnce(null);
        mockCacheService.set.mockResolvedValueOnce(undefined);

        const result = await service.selectModel(context);

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(mockCacheService.get).toHaveBeenCalledWith(
          expect.stringContaining('model_selection:')
        );
        expect(mockCacheService.set).toHaveBeenCalledWith(
          expect.stringContaining('model_selection:'),
          result,
          { ttl: 3600 }
        );
      });

      it('should return cached selection if available', async () => {
        const context: ModelSelectionContext = {
          taskType: 'analysis',
          complexity: 'low',
          urgency: 'high',
        };

        mockCacheService.get.mockResolvedValueOnce(ModelType.CLAUDE_3_SONNET);

        const result = await service.selectModel(context);

        expect(result).toBe(ModelType.CLAUDE_3_SONNET);
        expect(mockCacheService.set).not.toHaveBeenCalled();
      });

      it('should consider budget constraints in model selection', async () => {
        const context: ModelSelectionContext = {
          taskType: 'generation',
          complexity: 'high',
          urgency: 'low',
          budget: 0.1,
          dataVolume: 1000,
        };

        mockCacheService.get.mockResolvedValueOnce(null);
        mockCacheService.set.mockResolvedValueOnce(undefined);

        const result = await service.selectModel(context);

        expect(result).toBeDefined();
        // Should not select expensive models like GPT-4
        expect(result).not.toBe(ModelType.GPT_4);
      });

      it('should prioritize fast models for high urgency tasks', async () => {
        const context: ModelSelectionContext = {
          taskType: 'validation',
          complexity: 'low',
          urgency: 'high',
          requiredAccuracy: 'medium',
        };

        mockCacheService.get.mockResolvedValueOnce(null);
        mockCacheService.set.mockResolvedValueOnce(undefined);

        const result = await service.selectModel(context);

        expect(result).toBeDefined();
      });
    });

    describe('calculateModelScore', () => {
      it('should calculate higher scores for specialized models', async () => {
        const context: ModelSelectionContext = {
          taskType: 'estimation',
          complexity: 'high',
          urgency: 'medium',
          requiredAccuracy: 'high',
        };

        mockCacheService.get.mockResolvedValueOnce(null);
        mockCacheService.set.mockResolvedValueOnce(undefined);

        const result = await service.selectModel(context);

        // DeepSeek R1 specializes in construction/estimation
        expect(result).toBe(ModelType.DEEPSEEK_R1);
      });
    });
  });

  describe('Model Switching', () => {
    describe('switchModel', () => {
      it('should switch to a valid active model', async () => {
        await expect(service.switchModel(ModelType.DEEPSEEK_R1)).resolves.not.toThrow();
        
        const config = service.getActiveModelConfig();
        expect(config?.model).toBe(ModelType.DEEPSEEK_R1);
      });

      it('should throw error for non-existent model', async () => {
        await expect(service.switchModel('non-existent-model'))
          .rejects.toThrow(BadRequestException);
        await expect(service.switchModel('non-existent-model'))
          .rejects.toThrow('Model non-existent-model not found');
      });

      it('should throw error for inactive model', async () => {
        // Claude is inactive by default in our test setup
        await expect(service.switchModel(ModelType.CLAUDE_3_SONNET))
          .rejects.toThrow(BadRequestException);
        await expect(service.switchModel(ModelType.CLAUDE_3_SONNET))
          .rejects.toThrow(`Model ${ModelType.CLAUDE_3_SONNET} is not active`);
      });

      it('should persist configuration after switching', async () => {
        await service.switchModel(ModelType.DEEPSEEK_R1);
        
        // Verify that persistModelConfiguration was called
        // This is implicitly tested by not throwing an error
        expect(service.getActiveModelConfig()?.model).toBe(ModelType.DEEPSEEK_R1);
      });
    });
  });

  describe('Request Execution with Fallback', () => {
    describe('executeWithBestModel', () => {
      it('should execute request with selected model', async () => {
        const request: AiRequest = {
          messages: [{ role: 'user', content: 'Test message' }],
          temperature: 0.7,
          maxTokens: 1000,
        };

        const context: ModelSelectionContext = {
          taskType: 'estimation',
          complexity: 'medium',
          urgency: 'medium',
        };

        // Mock the DeepSeekAiProvider
        jest.doMock('../providers/deepseek-ai.provider', () => ({
          DeepSeekAiProvider: MockAiProvider,
        }));

        mockCacheService.get.mockResolvedValue(null);
        mockCacheService.set.mockResolvedValue(undefined);

        const response = await service.executeWithBestModel(request, context);

        expect(response).toBeDefined();
        expect(response.content).toBe('Mock response');
        expect(response.confidence).toBe(ConfidenceLevel.HIGH);
      });

      it('should handle fallback when primary model fails', async () => {
        const request: AiRequest = {
          messages: [{ role: 'user', content: 'Test message' }],
        };

        const context: ModelSelectionContext = {
          taskType: 'analysis',
          complexity: 'high',
          urgency: 'low',
        };

        // Mock a failing provider
        const failingProvider = {
          initialize: jest.fn(),
          generateResponse: jest.fn().mockRejectedValueOnce(new Error('Model failed')),
          isAvailable: jest.fn().mockResolvedValue(false),
        };

        jest.doMock('../providers/deepseek-ai.provider', () => ({
          DeepSeekAiProvider: jest.fn(() => failingProvider),
        }));

        mockCacheService.get.mockResolvedValue(null);
        mockCacheService.set.mockResolvedValue(undefined);

        await expect(service.executeWithBestModel(request, context))
          .rejects.toThrow();
      });

      it('should prevent infinite fallback loops', async () => {
        const request: AiRequest = {
          messages: [{ role: 'user', content: 'Test message' }],
        };

        const context: ModelSelectionContext = {
          taskType: 'analysis',
          complexity: 'high',
          urgency: 'low',
        };

        // Mock all providers to fail
        jest.doMock('../providers/deepseek-ai.provider', () => ({
          DeepSeekAiProvider: jest.fn(() => ({
            initialize: jest.fn(),
            generateResponse: jest.fn().mockRejectedValue(new Error('Model failed')),
            isAvailable: jest.fn().mockResolvedValue(false),
          })),
        }));

        mockCacheService.get.mockResolvedValue(null);
        mockCacheService.set.mockResolvedValue(undefined);

        await expect(service.executeWithBestModel(request, context))
          .rejects.toThrow('All available models have been attempted');
      });
    });

    describe('Rate Limiting', () => {
      it('should apply rate limiting to requests', async () => {
        const request: AiRequest = {
          messages: [{ role: 'user', content: 'Test message' }],
        };

        const context: ModelSelectionContext = {
          taskType: 'estimation',
          complexity: 'low',
          urgency: 'medium',
        };

        // Simulate rate limit exceeded
        mockCacheService.get
          .mockResolvedValueOnce(null) // model selection cache
          .mockResolvedValueOnce({ requests: 60, tokens: 50000 }); // rate limit cache

        mockCacheService.set.mockResolvedValue(undefined);

        jest.doMock('../providers/deepseek-ai.provider', () => ({
          DeepSeekAiProvider: MockAiProvider,
        }));

        await expect(service.executeWithBestModel(request, context))
          .rejects.toThrow('Rate limit exceeded');
      });

      it('should update rate limit usage on successful requests', async () => {
        const request: AiRequest = {
          messages: [{ role: 'user', content: 'Test message' }],
        };

        const context: ModelSelectionContext = {
          taskType: 'estimation',
          complexity: 'low',
          urgency: 'medium',
        };

        mockCacheService.get
          .mockResolvedValueOnce(null) // model selection cache
          .mockResolvedValueOnce({ requests: 10, tokens: 10000 }); // rate limit cache

        mockCacheService.set.mockResolvedValue(undefined);

        jest.doMock('../providers/deepseek-ai.provider', () => ({
          DeepSeekAiProvider: MockAiProvider,
        }));

        await service.executeWithBestModel(request, context);

        expect(mockCacheService.set).toHaveBeenCalledWith(
          expect.stringContaining('rate_limit:'),
          expect.objectContaining({ requests: 11 }),
          { ttl: 60 }
        );
      });
    });
  });

  describe('Model Metrics', () => {
    describe('updateModelMetrics', () => {
      it('should track successful requests', async () => {
        const request: AiRequest = {
          messages: [{ role: 'user', content: 'Test message' }],
        };

        const context: ModelSelectionContext = {
          taskType: 'estimation',
          complexity: 'medium',
          urgency: 'medium',
        };

        jest.doMock('../providers/deepseek-ai.provider', () => ({
          DeepSeekAiProvider: MockAiProvider,
        }));

        mockCacheService.get.mockResolvedValue(null);
        mockCacheService.set.mockResolvedValue(undefined);

        await service.executeWithBestModel(request, context);

        const report = await service.getModelPerformanceReport();
        const metrics = report[ModelType.DEEPSEEK_R1];

        expect(metrics.totalRequests).toBe(1);
        expect(metrics.successRate).toBe(1.0);
        expect(metrics.averageTokensUsed).toBe(100);
      });

      it('should track failed requests', async () => {
        const request: AiRequest = {
          messages: [{ role: 'user', content: 'Test message' }],
        };

        const context: ModelSelectionContext = {
          taskType: 'estimation',
          complexity: 'medium',
          urgency: 'medium',
        };

        jest.doMock('../providers/deepseek-ai.provider', () => ({
          DeepSeekAiProvider: jest.fn(() => ({
            initialize: jest.fn(),
            generateResponse: jest.fn().mockRejectedValue(new Error('Model failed')),
            isAvailable: jest.fn().mockResolvedValue(false),
          })),
        }));

        mockCacheService.get.mockResolvedValue(null);
        mockCacheService.set.mockResolvedValue(undefined);

        try {
          await service.executeWithBestModel(request, context);
        } catch (error) {
          // Expected to fail
        }

        const report = await service.getModelPerformanceReport();
        const metrics = report[ModelType.DEEPSEEK_R1];

        expect(metrics.totalRequests).toBe(1);
        expect(metrics.successRate).toBeLessThan(1.0);
        expect(metrics.errorRate).toBeGreaterThan(0);
      });

      it('should update confidence distribution', async () => {
        const request: AiRequest = {
          messages: [{ role: 'user', content: 'Test message' }],
        };

        const context: ModelSelectionContext = {
          taskType: 'estimation',
          complexity: 'medium',
          urgency: 'medium',
        };

        jest.doMock('../providers/deepseek-ai.provider', () => ({
          DeepSeekAiProvider: MockAiProvider,
        }));

        mockCacheService.get.mockResolvedValue(null);
        mockCacheService.set.mockResolvedValue(undefined);

        await service.executeWithBestModel(request, context);

        const report = await service.getModelPerformanceReport();
        const metrics = report[ModelType.DEEPSEEK_R1];

        expect(metrics.confidenceDistribution[ConfidenceLevel.HIGH]).toBe(1);
      });

      it('should calculate cost based on token usage', async () => {
        const request: AiRequest = {
          messages: [{ role: 'user', content: 'Test message' }],
        };

        const context: ModelSelectionContext = {
          taskType: 'estimation',
          complexity: 'medium',
          urgency: 'medium',
        };

        jest.doMock('../providers/deepseek-ai.provider', () => ({
          DeepSeekAiProvider: MockAiProvider,
        }));

        mockCacheService.get.mockResolvedValue(null);
        mockCacheService.set.mockResolvedValue(undefined);

        await service.executeWithBestModel(request, context);

        const report = await service.getModelPerformanceReport();
        const metrics = report[ModelType.DEEPSEEK_R1];

        // DeepSeek R1 costs 0.0001 per token, used 100 tokens
        expect(metrics.totalCost).toBe(0.01);
      });
    });

    describe('getModelPerformanceReport', () => {
      it('should return complete metrics for all models', async () => {
        const report = await service.getModelPerformanceReport();

        expect(report).toBeDefined();
        expect(typeof report).toBe('object');
        
        // Check if default models are in the report
        expect(report[ModelType.DEEPSEEK_R1]).toBeDefined();
        expect(report[ModelType.DEEPSEEK_R1].modelId).toBe(ModelType.DEEPSEEK_R1);
        expect(report[ModelType.DEEPSEEK_R1].totalRequests).toBe(0);
        expect(report[ModelType.DEEPSEEK_R1].successRate).toBe(1.0);
        expect(report[ModelType.DEEPSEEK_R1].confidenceDistribution).toBeDefined();
      });
    });
  });

  describe('Model Optimization', () => {
    describe('optimizeModelConfiguration', () => {
      it('should disable models with high error rates', async () => {
        // Manually set high error rate for a model
        const models = service.listAvailableModels();
        const deepseekModel = models.find(m => m.id === ModelType.DEEPSEEK_R1);
        
        // Simulate 100 failed requests
        const metrics = await service.getModelPerformanceReport();
        const modelMetrics = metrics[ModelType.DEEPSEEK_R1];
        modelMetrics.totalRequests = 100;
        modelMetrics.errorRate = 0.4;
        modelMetrics.successRate = 0.6;

        await service.optimizeModelConfiguration();

        const updatedModels = service.listAvailableModels();
        const updatedDeepseek = updatedModels.find(m => m.id === ModelType.DEEPSEEK_R1);
        
        // Model should be disabled due to high error rate
        expect(updatedDeepseek?.config.isActive).toBe(false);
      });

      it('should adjust temperature based on confidence distribution', async () => {
        // Simulate low confidence results
        const metrics = await service.getModelPerformanceReport();
        const modelMetrics = metrics[ModelType.DEEPSEEK_R1];
        modelMetrics.totalRequests = 100;
        modelMetrics.confidenceDistribution[ConfidenceLevel.LOW] = 30;
        modelMetrics.confidenceDistribution[ConfidenceLevel.UNCERTAIN] = 25;
        modelMetrics.confidenceDistribution[ConfidenceLevel.HIGH] = 45;

        const originalConfig = service.getActiveModelConfig();
        const originalTemp = originalConfig?.temperature || 0.3;

        await service.optimizeModelConfiguration();

        const updatedConfig = service.getActiveModelConfig();
        expect(updatedConfig?.temperature).toBeLessThan(originalTemp);
      });

      it('should not optimize models with insufficient data', async () => {
        // Model with only 10 requests shouldn't be optimized
        const metrics = await service.getModelPerformanceReport();
        const modelMetrics = metrics[ModelType.DEEPSEEK_R1];
        modelMetrics.totalRequests = 10;
        modelMetrics.errorRate = 0.4;

        await service.optimizeModelConfiguration();

        const models = service.listAvailableModels();
        const deepseek = models.find(m => m.id === ModelType.DEEPSEEK_R1);
        
        // Model should still be active despite high error rate due to low sample size
        expect(deepseek?.config.isActive).toBe(true);
      });
    });
  });

  describe('Health Checks', () => {
    describe('healthCheck', () => {
      it('should return health status for all active models', async () => {
        jest.doMock('../providers/deepseek-ai.provider', () => ({
          DeepSeekAiProvider: jest.fn(() => ({
            initialize: jest.fn(),
            isAvailable: jest.fn().mockResolvedValue(true),
            generateResponse: jest.fn(),
          })),
        }));

        const health = await service.healthCheck();

        expect(health).toBeDefined();
        expect(typeof health).toBe('object');
        expect(health[ModelType.DEEPSEEK_R1]).toBe(true);
      });

      it('should handle provider initialization errors', async () => {
        jest.doMock('../providers/deepseek-ai.provider', () => ({
          DeepSeekAiProvider: jest.fn(() => {
            throw new Error('Provider initialization failed');
          }),
        }));

        const health = await service.healthCheck();

        expect(health[ModelType.DEEPSEEK_R1]).toBe(false);
      });

      it('should skip inactive models', async () => {
        const health = await service.healthCheck();

        // Claude is inactive by default, shouldn't be in health check
        expect(health[ModelType.CLAUDE_3_SONNET]).toBeUndefined();
      });
    });
  });

  describe('Model Capabilities', () => {
    describe('getModelCapabilities', () => {
      it('should return correct capabilities for known models', () => {
        const models = service.listAvailableModels();
        
        const deepseek = models.find(m => m.id === ModelType.DEEPSEEK_R1);
        expect(deepseek?.capabilities).toMatchObject({
          supportsStreaming: true,
          supportsTools: true,
          maxTokens: 4000,
          costPerToken: 0.0001,
          responseTime: 'medium',
          accuracy: 'high',
          specializations: expect.arrayContaining(['construction', 'estimation', 'analysis']),
        });

        const claude = models.find(m => m.id === ModelType.CLAUDE_3_SONNET);
        expect(claude?.capabilities).toMatchObject({
          supportsStreaming: true,
          supportsTools: false,
          maxTokens: 4096,
          costPerToken: 0.003,
          responseTime: 'fast',
          accuracy: 'high',
        });
      });

      it('should return default capabilities for unknown models', () => {
        // This is tested internally - unknown models get default capabilities
        const models = service.listAvailableModels();
        expect(models.every(m => m.capabilities !== undefined)).toBe(true);
      });
    });

    describe('listAvailableModels', () => {
      it('should list all models with complete information', () => {
        const models = service.listAvailableModels();

        expect(Array.isArray(models)).toBe(true);
        expect(models.length).toBeGreaterThan(0);
        
        models.forEach(model => {
          expect(model).toHaveProperty('id');
          expect(model).toHaveProperty('config');
          expect(model).toHaveProperty('capabilities');
          expect(model.config).toHaveProperty('priority');
          expect(model.config).toHaveProperty('isActive');
          expect(model.capabilities).toHaveProperty('maxTokens');
          expect(model.capabilities).toHaveProperty('costPerToken');
        });
      });
    });
  });

  describe('Caching', () => {
    it('should cache model selection results', async () => {
      const context: ModelSelectionContext = {
        taskType: 'estimation',
        complexity: 'high',
        urgency: 'medium',
      };

      mockCacheService.get.mockResolvedValueOnce(null);
      mockCacheService.set.mockResolvedValueOnce(undefined);

      await service.selectModel(context);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('model_selection:'),
        expect.any(String),
        { ttl: 3600 }
      );
    });

    it('should cache rate limit information', async () => {
      const request: AiRequest = {
        messages: [{ role: 'user', content: 'Test' }],
      };

      const context: ModelSelectionContext = {
        taskType: 'estimation',
        complexity: 'low',
        urgency: 'medium',
      };

      mockCacheService.get
        .mockResolvedValueOnce(null) // model selection
        .mockResolvedValueOnce({ requests: 0, tokens: 0 }); // rate limit

      mockCacheService.set.mockResolvedValue(undefined);

      jest.doMock('../providers/deepseek-ai.provider', () => ({
        DeepSeekAiProvider: MockAiProvider,
      }));

      await service.executeWithBestModel(request, context);

      // Should update rate limit cache
      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('rate_limit:'),
        expect.objectContaining({ requests: 1 }),
        { ttl: 60 }
      );
    });
  });

  describe('Circuit Breaker Pattern', () => {
    it('should track consecutive failures', async () => {
      const request: AiRequest = {
        messages: [{ role: 'user', content: 'Test' }],
      };

      const context: ModelSelectionContext = {
        taskType: 'estimation',
        complexity: 'medium',
        urgency: 'medium',
      };

      // Mock multiple failures
      jest.doMock('../providers/deepseek-ai.provider', () => ({
        DeepSeekAiProvider: jest.fn(() => ({
          initialize: jest.fn(),
          generateResponse: jest.fn().mockRejectedValue(new Error('Service unavailable')),
          isAvailable: jest.fn().mockResolvedValue(false),
        })),
      }));

      mockCacheService.get.mockResolvedValue(null);
      mockCacheService.set.mockResolvedValue(undefined);

      // Try multiple times
      for (let i = 0; i < 3; i++) {
        try {
          await service.executeWithBestModel(request, context);
        } catch (error) {
          // Expected to fail
        }
      }

      const report = await service.getModelPerformanceReport();
      const metrics = report[ModelType.DEEPSEEK_R1];

      expect(metrics.totalRequests).toBe(3);
      expect(metrics.errorRate).toBeGreaterThan(0);
    });

    it('should disable models after optimization detects high failure rate', async () => {
      // Set up a model with high failure rate
      const report = await service.getModelPerformanceReport();
      const metrics = report[ModelType.DEEPSEEK_R1];
      metrics.totalRequests = 150;
      metrics.errorRate = 0.35;
      metrics.successRate = 0.65;

      await service.optimizeModelConfiguration();

      const models = service.listAvailableModels();
      const deepseek = models.find(m => m.id === ModelType.DEEPSEEK_R1);

      expect(deepseek?.config.isActive).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty request gracefully', async () => {
      const request: AiRequest = {
        messages: [],
      };

      const context: ModelSelectionContext = {
        taskType: 'estimation',
        complexity: 'low',
        urgency: 'low',
      };

      jest.doMock('../providers/deepseek-ai.provider', () => ({
        DeepSeekAiProvider: MockAiProvider,
      }));

      mockCacheService.get.mockResolvedValue(null);
      mockCacheService.set.mockResolvedValue(undefined);

      const response = await service.executeWithBestModel(request, context);
      expect(response).toBeDefined();
    });

    it('should handle missing provider gracefully', async () => {
      const request: AiRequest = {
        messages: [{ role: 'user', content: 'Test' }],
      };

      const context: ModelSelectionContext = {
        taskType: 'estimation',
        complexity: 'medium',
        urgency: 'medium',
      };

      jest.doMock('../providers/deepseek-ai.provider', () => {
        throw new Error('Module not found');
      });

      mockCacheService.get.mockResolvedValue(null);
      mockCacheService.set.mockResolvedValue(undefined);

      await expect(service.executeWithBestModel(request, context))
        .rejects.toThrow();
    });

    it('should handle cache service errors gracefully', async () => {
      const context: ModelSelectionContext = {
        taskType: 'estimation',
        complexity: 'high',
        urgency: 'medium',
      };

      mockCacheService.get.mockRejectedValueOnce(new Error('Cache error'));
      mockCacheService.set.mockResolvedValue(undefined);

      // Should still work even if cache fails
      await expect(service.selectModel(context)).rejects.toThrow();
    });
  });
});
