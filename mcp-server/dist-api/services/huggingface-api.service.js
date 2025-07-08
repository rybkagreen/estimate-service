/**
 * Hugging Face API Service for DeepSeek R1
 * Сервис для работы с моделью DeepSeek R1 через Hugging Face API (платная подписка)
 */
import { HfInference } from '@huggingface/inference';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
/**
 * Сервис для работы с DeepSeek R1 через Hugging Face API
 */
export class HuggingFaceApiService {
    client;
    modelName;
    apiKey;
    isInitialized = false;
    constructor() {
        this.apiKey = config.ai.huggingface?.apiKey || process.env.HF_TOKEN || '';
        this.modelName = config.ai.huggingface?.modelName || 'deepseek-ai/DeepSeek-R1';
        if (!this.apiKey) {
            throw new Error('HF_TOKEN environment variable is required for Hugging Face API');
        }
        this.client = new HfInference(this.apiKey);
        logger.info(`🤗 HuggingFace API Service initialized`);
        logger.debug('🔧 HuggingFace API config:', {
            modelName: this.modelName,
            hasApiKey: !!this.apiKey,
        });
    }
    /**
     * Инициализация сервиса
     */
    async initialize() {
        try {
            logger.info('🚀 Initializing HuggingFace API Service...');
            // Проверяем доступность API
            await this.testConnection();
            this.isInitialized = true;
            logger.info('✅ HuggingFace API Service initialized successfully');
        }
        catch (error) {
            logger.error('❌ Failed to initialize HuggingFace API Service:', error);
            throw error;
        }
    }
    /**
     * Проверка подключения к API
     */
    async testConnection() {
        try {
            const response = await this.client.chatCompletion({
                model: this.modelName,
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10,
                temperature: 0.1,
            });
            logger.info('🔗 HuggingFace API connection test successful');
        }
        catch (error) {
            logger.error('🔗 HuggingFace API connection test failed:', error);
            throw new Error(`Failed to connect to HuggingFace API: ${error.message}`);
        }
    }
    /**
     * Генерация ответа через DeepSeek R1
     */
    async generateResponse(messages, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const { temperature = 0.7, maxTokens = 1024, topP = 0.9, stream = false, } = options;
            logger.debug('🤖 Generating response with DeepSeek R1:', {
                modelName: this.modelName,
                messagesCount: messages.length,
                options,
            });
            if (stream) {
                return await this.generateStreamingResponse(messages, options);
            }
            const response = await this.client.chatCompletion({
                model: this.modelName,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                max_tokens: maxTokens,
                temperature,
                top_p: topP,
            });
            const content = response.choices?.[0]?.message?.content || '';
            const usage = response.usage ? {
                promptTokens: response.usage.prompt_tokens || 0,
                completionTokens: response.usage.completion_tokens || 0,
                totalTokens: response.usage.total_tokens || 0,
            } : undefined;
            logger.debug('✅ Response generated successfully:', {
                contentLength: content.length,
                usage,
            });
            return {
                content,
                usage,
            };
        }
        catch (error) {
            logger.error('❌ Failed to generate response:', error);
            throw error;
        }
    }
    /**
     * Потоковая генерация ответа
     */
    async generateStreamingResponse(messages, options) {
        const { temperature = 0.7, maxTokens = 1024, topP = 0.9, } = options;
        try {
            const stream = this.client.chatCompletionStream({
                model: this.modelName,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                max_tokens: maxTokens,
                temperature,
                top_p: topP,
            });
            let content = '';
            let usage = undefined;
            for await (const chunk of stream) {
                if (chunk.choices?.[0]?.delta?.content) {
                    content += chunk.choices[0].delta.content;
                }
                if (chunk.usage) {
                    usage = {
                        promptTokens: chunk.usage.prompt_tokens || 0,
                        completionTokens: chunk.usage.completion_tokens || 0,
                        totalTokens: chunk.usage.total_tokens || 0,
                    };
                }
            }
            return {
                content,
                usage,
            };
        }
        catch (error) {
            logger.error('❌ Failed to generate streaming response:', error);
            throw error;
        }
    }
    /**
     * Анализ кода с помощью DeepSeek R1
     */
    async analyzeCode(code, language = 'typescript') {
        const messages = [
            {
                role: 'system',
                content: `Ты эксперт-программист. Проанализируй предоставленный код на ${language} и дай рекомендации по улучшению.`,
            },
            {
                role: 'user',
                content: `Проанализируй этот код:\n\n\`\`\`${language}\n${code}\n\`\`\``,
            },
        ];
        const response = await this.generateResponse(messages, {
            temperature: 0.3,
            maxTokens: 2048,
        });
        return response.content;
    }
    /**
     * Генерация тестов
     */
    async generateTests(code, language = 'typescript') {
        const messages = [
            {
                role: 'system',
                content: `Ты эксперт по тестированию. Создай комплексные unit-тесты для предоставленного кода на ${language}.`,
            },
            {
                role: 'user',
                content: `Создай тесты для этого кода:\n\n\`\`\`${language}\n${code}\n\`\`\``,
            },
        ];
        const response = await this.generateResponse(messages, {
            temperature: 0.2,
            maxTokens: 3072,
        });
        return response.content;
    }
    /**
     * Рефакторинг кода
     */
    async refactorCode(code, language = 'typescript', instructions) {
        const systemPrompt = instructions
            ? `Ты эксперт-программист. Рефактори предоставленный код согласно инструкциям: ${instructions}`
            : `Ты эксперт-программист. Рефактори предоставленный код для улучшения читаемости, производительности и соблюдения best practices.`;
        const messages = [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: `Рефактори этот код:\n\n\`\`\`${language}\n${code}\n\`\`\``,
            },
        ];
        const response = await this.generateResponse(messages, {
            temperature: 0.1,
            maxTokens: 4096,
        });
        return response.content;
    }
    /**
     * Проверка состояния сервиса
     */
    getHealthStatus() {
        return {
            service: 'HuggingFace API Service',
            status: this.isInitialized ? 'healthy' : 'initializing',
            model: this.modelName,
            hasApiKey: !!this.apiKey,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Очистка ресурсов
     */
    async cleanup() {
        logger.info('🧹 Cleaning up HuggingFace API Service...');
        this.isInitialized = false;
        logger.info('✅ HuggingFace API Service cleanup completed');
    }
}
// Экспорт singleton instance
export const huggingFaceApiService = new HuggingFaceApiService();
