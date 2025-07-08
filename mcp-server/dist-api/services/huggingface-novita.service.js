/**
 * Hugging Face Novita API Service for DeepSeek R1
 * Сервис для работы с моделью DeepSeek R1 через Hugging Face Novita провайдер
 */
import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
/**
 * Сервис для работы с DeepSeek R1 через Hugging Face Novita API
 */
export class HuggingFaceNovitaService {
    client;
    modelName;
    apiKey;
    apiUrl;
    isInitialized = false;
    constructor() {
        this.apiKey = config.ai.huggingface?.apiKey || process.env.HF_TOKEN || '';
        this.modelName = config.ai.huggingface?.modelName || 'deepseek/deepseek-r1-turbo';
        this.apiUrl = 'https://router.huggingface.co/novita/v3/openai/chat/completions';
        if (!this.apiKey) {
            throw new Error('HF_TOKEN environment variable is required for Hugging Face Novita API');
        }
        this.client = axios.create({
            baseURL: this.apiUrl,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: parseInt(process.env.REQUEST_TIMEOUT || '60000'),
        });
        logger.info(`🤗 HuggingFace Novita API Service initialized`);
        logger.debug('🔧 HuggingFace Novita API config:', {
            modelName: this.modelName,
            apiUrl: this.apiUrl,
            hasApiKey: !!this.apiKey,
        });
    }
    /**
     * Инициализация сервиса
     */
    async initialize() {
        try {
            logger.info('🚀 Initializing HuggingFace Novita API Service...');
            // Проверяем доступность API
            await this.testConnection();
            this.isInitialized = true;
            logger.info('✅ HuggingFace Novita API Service initialized successfully');
        }
        catch (error) {
            logger.error('❌ Failed to initialize HuggingFace Novita API Service:', error);
            throw error;
        }
    }
    /**
     * Проверка подключения к API
     */
    async testConnection() {
        try {
            const response = await this.client.post('', {
                model: this.modelName,
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10,
                temperature: 0.1,
                stream: false,
            });
            logger.info('🔗 HuggingFace Novita API connection test successful');
        }
        catch (error) {
            logger.error('🔗 HuggingFace Novita API connection test failed:', error);
            throw new Error(`Failed to connect to HuggingFace Novita API: ${error.message}`);
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
            logger.debug('🤖 Generating response with DeepSeek R1 via Novita:', {
                modelName: this.modelName,
                messagesCount: messages.length,
                options,
            });
            if (stream) {
                return await this.generateStreamingResponse(messages, options);
            }
            const response = await this.client.post('', {
                model: this.modelName,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                max_tokens: maxTokens,
                temperature,
                top_p: topP,
                stream: false,
            });
            const content = response.data.choices?.[0]?.message?.content || '';
            const usage = response.data.usage ? {
                promptTokens: response.data.usage.prompt_tokens || 0,
                completionTokens: response.data.usage.completion_tokens || 0,
                totalTokens: response.data.usage.total_tokens || 0,
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
            const response = await this.client.post('', {
                model: this.modelName,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                max_tokens: maxTokens,
                temperature,
                top_p: topP,
                stream: true,
            }, {
                responseType: 'stream',
            });
            let content = '';
            let usage = undefined;
            return new Promise((resolve, reject) => {
                response.data.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n');
                    for (const line of lines) {
                        if (!line.startsWith('data:'))
                            continue;
                        if (line.trim() === 'data: [DONE]') {
                            resolve({ content, usage });
                            return;
                        }
                        try {
                            const data = JSON.parse(line.replace('data:', '').trim());
                            if (data.choices?.[0]?.delta?.content) {
                                content += data.choices[0].delta.content;
                            }
                            if (data.usage) {
                                usage = {
                                    promptTokens: data.usage.prompt_tokens || 0,
                                    completionTokens: data.usage.completion_tokens || 0,
                                    totalTokens: data.usage.total_tokens || 0,
                                };
                            }
                        }
                        catch (parseError) {
                            // Игнорируем ошибки парсинга отдельных чанков
                        }
                    }
                });
                response.data.on('error', (error) => {
                    reject(error);
                });
                response.data.on('end', () => {
                    resolve({ content, usage });
                });
            });
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
            service: 'HuggingFace Novita API Service',
            status: this.isInitialized ? 'healthy' : 'initializing',
            model: this.modelName,
            provider: 'novita',
            apiUrl: this.apiUrl,
            hasApiKey: !!this.apiKey,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Очистка ресурсов
     */
    async cleanup() {
        logger.info('🧹 Cleaning up HuggingFace Novita API Service...');
        this.isInitialized = false;
        logger.info('✅ HuggingFace Novita API Service cleanup completed');
    }
}
// Экспорт singleton instance
export const huggingFaceNovitaService = new HuggingFaceNovitaService();
