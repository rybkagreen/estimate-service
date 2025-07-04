import { Test, TestingModule } from '@nestjs/testing';
import { DeepSeekAiProvider } from './deepseek-ai.provider';
import { AiProviderConfig } from './ai-provider.interface';
import { ConfidenceLevel } from '../../../types/shared-contracts';

describe('DeepSeekAiProvider', () => {
  let provider: DeepSeekAiProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeepSeekAiProvider],
    }).compile();

    provider = module.get<DeepSeekAiProvider>(DeepSeekAiProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should not be ready before initialization', () => {
    expect(provider.isReady()).toBe(false);
  });

  describe('initialization', () => {
    it('should throw error without API key', async () => {
      const config: AiProviderConfig = {
        provider: 'deepseek-r1',
        model: 'deepseek-r1',
      };

      await expect(provider.initialize(config)).rejects.toThrow('DEEPSEEK_API_KEY не установлен');
    });

    it('should initialize with valid config', async () => {
      const config: AiProviderConfig = {
        provider: 'deepseek-r1',
        apiKey: 'test-api-key',
        model: 'deepseek-r1',
        baseUrl: 'https://api.test.com',
      };

      // Mock the validateConnection method to avoid actual API calls
      jest.spyOn(provider as any, 'validateConnection').mockResolvedValue(undefined);

      await provider.initialize(config);
      expect(provider.isReady()).toBe(true);
    });
  });

  describe('generateResponse', () => {
    beforeEach(async () => {
      const config: AiProviderConfig = {
        provider: 'deepseek-r1',
        apiKey: 'test-api-key',
        model: 'deepseek-r1',
        baseUrl: 'https://api.test.com',
      };

      // Mock the validateConnection method
      jest.spyOn(provider as any, 'validateConnection').mockResolvedValue(undefined);
      await provider.initialize(config);
    });

    it('should throw error if not initialized', async () => {
      const uninitializedProvider = new DeepSeekAiProvider();

      await expect(
        uninitializedProvider.generateResponse({
          prompt: 'test prompt',
        })
      ).rejects.toThrow('DeepSeek AI провайдер не инициализирован');
    });

    it('should generate response with mock API', async () => {
      const mockApiResponse = {
        data: {
          choices: [
            {
              message: {
                content: 'Test response from DeepSeek',
                role: 'assistant',
              },
              finish_reason: 'stop',
              index: 0,
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
          },
          model: 'deepseek-r1',
          id: 'test-id',
          created: Date.now(),
        },
      };

      // Mock the API call
      jest.spyOn(provider as any, 'callDeepSeekApi').mockResolvedValue(mockApiResponse);

      const response = await provider.generateResponse({
        prompt: 'Проанализируй смету',
        systemPrompt: 'Ты помощник сметчика',
      });

      expect(response).toBeDefined();
      expect(response.content).toBe('Test response from DeepSeek');
      expect(response.confidence).toBe(ConfidenceLevel.LOW); // determineConfidence возвращает LOW для коротких ответов
      expect(response.tokensUsed).toBe(30);
      expect(response.model).toBe('deepseek-r1');
      expect(response.metadata?.provider).toBe('deepseek-r1');
    });
  });

  describe('getUsageStats', () => {
    it('should return initial stats', async () => {
      const stats = await provider.getUsageStats();

      expect(stats).toEqual({
        totalRequests: 0,
        totalTokens: 0,
        averageResponseTime: 0,
        errorRate: 0,
      });
    });
  });

  describe('getConfig', () => {
    it('should return current config', async () => {
      const config: AiProviderConfig = {
        provider: 'deepseek-r1',
        apiKey: 'test-api-key',
        model: 'deepseek-r1',
      };

      jest.spyOn(provider as any, 'validateConnection').mockResolvedValue(undefined);
      await provider.initialize(config);

      const returnedConfig = provider.getConfig();
      expect(returnedConfig).toEqual(config);
    });
  });
});
