"use strict";
/**
 * Local Hugging Face DeepSeek R1 Model Service
 * Сервис для работы с локальной моделью DeepSeek R1 через Hugging Face Transformers
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.huggingFaceLocalService = exports.HuggingFaceLocalService = void 0;
var transformers_1 = require("@huggingface/transformers");
var index_js_1 = require("../config/index.js");
var logger_js_1 = require("../utils/logger.js");
/**
 * Сервис для работы с локальной моделью DeepSeek R1
 */
var HuggingFaceLocalService = /** @class */ (function () {
    function HuggingFaceLocalService() {
        var _a, _b, _c;
        this.model = null;
        this.tokenizer = null;
        this.generator = null;
        this.isInitialized = false;
        // Локальная модель DeepSeek R1
        this.modelName = ((_a = index_js_1.config.ai.huggingface) === null || _a === void 0 ? void 0 : _a.modelName) || 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B';
        this.modelPath = ((_b = index_js_1.config.ai.huggingface) === null || _b === void 0 ? void 0 : _b.modelPath) || './models/deepseek-r1';
        this.mockMode = ((_c = index_js_1.config.ai.huggingface) === null || _c === void 0 ? void 0 : _c.mockMode) || false;
        logger_js_1.logger.info("\uD83E\uDD17 HuggingFace Local Service initialized");
        logger_js_1.logger.debug('🔧 HuggingFace config:', {
            modelName: this.modelName,
            modelPath: this.modelPath,
            mockMode: this.mockMode,
        });
    }
    /**
     * Инициализация локальной модели
     */
    HuggingFaceLocalService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, localError_1, _c, _d, _e, error_1;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (this.isInitialized) {
                            return [2 /*return*/];
                        }
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 10, , 11]);
                        logger_js_1.logger.info('🚀 Initializing local DeepSeek R1 model...');
                        if (this.mockMode) {
                            logger_js_1.logger.info('🎭 Running in mock mode - skipping model loading');
                            this.isInitialized = true;
                            return [2 /*return*/];
                        }
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 5, , 8]);
                        logger_js_1.logger.info("\uD83D\uDCC2 Trying to load model from local path: ".concat(this.modelPath));
                        _a = this;
                        return [4 /*yield*/, transformers_1.AutoTokenizer.from_pretrained(this.modelPath)];
                    case 3:
                        _a.tokenizer = _f.sent();
                        _b = this;
                        return [4 /*yield*/, transformers_1.AutoModelForCausalLM.from_pretrained(this.modelPath)];
                    case 4:
                        _b.model = _f.sent();
                        return [3 /*break*/, 8];
                    case 5:
                        localError_1 = _f.sent();
                        logger_js_1.logger.warn('⚠️ Local model not found, downloading from Hugging Face...');
                        logger_js_1.logger.info("\uD83D\uDCE5 Downloading model: ".concat(this.modelName));
                        // Скачиваем модель с Hugging Face
                        _c = this;
                        return [4 /*yield*/, transformers_1.AutoTokenizer.from_pretrained(this.modelName)];
                    case 6:
                        // Скачиваем модель с Hugging Face
                        _c.tokenizer = _f.sent();
                        _d = this;
                        return [4 /*yield*/, transformers_1.AutoModelForCausalLM.from_pretrained(this.modelName, {
                                // Настройки для экономии памяти
                                // torch_dtype: 'float16', // Не поддерживается в JS версии
                                // device_map: 'auto',     // Не поддерживается в JS версии
                                // Сохраняем модель локально для последующего использования
                                cache_dir: this.modelPath,
                            })];
                    case 7:
                        _d.model = _f.sent();
                        logger_js_1.logger.info("\uD83D\uDCBE Model saved to: ".concat(this.modelPath));
                        return [3 /*break*/, 8];
                    case 8:
                        // Создаем генератор текста
                        _e = this;
                        return [4 /*yield*/, (0, transformers_1.pipeline)('text-generation', this.modelName)];
                    case 9:
                        // Создаем генератор текста
                        _e.generator = _f.sent();
                        this.isInitialized = true;
                        logger_js_1.logger.info('✅ DeepSeek R1 model initialized successfully');
                        return [3 /*break*/, 11];
                    case 10:
                        error_1 = _f.sent();
                        logger_js_1.logger.error('❌ Failed to initialize DeepSeek R1 model:', error_1);
                        // Fallback to mock mode if initialization fails
                        logger_js_1.logger.warn('🎭 Falling back to mock mode');
                        this.mockMode = true;
                        this.isInitialized = true;
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Генерация ответа с помощью локальной модели
     */
    HuggingFaceLocalService.prototype.generateResponse = function (messages_1) {
        return __awaiter(this, arguments, void 0, function (messages, options) {
            var prompt_1, result, generatedText, error_2;
            var _a;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        logger_js_1.logger.debug('🚀 Generating response with DeepSeek R1:', {
                            messagesCount: messages.length,
                            temperature: options.temperature,
                            mockMode: this.mockMode,
                        });
                        // Мок-режим для тестирования
                        if (this.mockMode) {
                            return [2 /*return*/, this.generateMockResponse(messages)];
                        }
                        prompt_1 = this.formatMessagesAsPrompt(messages);
                        return [4 /*yield*/, this.generator(prompt_1, {
                                max_new_tokens: options.maxTokens || 512,
                                temperature: options.temperature || 0.7,
                                top_p: options.topP || 0.9,
                                top_k: options.topK || 50,
                                repetition_penalty: options.repetitionPenalty || 1.1,
                                do_sample: true,
                                return_full_text: false,
                            })];
                    case 3:
                        result = _b.sent();
                        generatedText = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.generated_text) || '';
                        logger_js_1.logger.debug('✅ Response generated successfully');
                        return [2 /*return*/, generatedText.trim()];
                    case 4:
                        error_2 = _b.sent();
                        logger_js_1.logger.error('❌ Error generating response:', error_2);
                        // Fallback to mock response
                        logger_js_1.logger.warn('🎭 Falling back to mock response');
                        return [2 /*return*/, this.generateMockResponse(messages)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Форматирование сообщений в промпт
     */
    HuggingFaceLocalService.prototype.formatMessagesAsPrompt = function (messages) {
        var prompt = '';
        for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
            var message = messages_1[_i];
            switch (message.role) {
                case 'system':
                    prompt += "System: ".concat(message.content, "\n\n");
                    break;
                case 'user':
                    prompt += "Human: ".concat(message.content, "\n\n");
                    break;
                case 'assistant':
                    prompt += "Assistant: ".concat(message.content, "\n\n");
                    break;
            }
        }
        // Добавляем начало ответа ассистента
        prompt += 'Assistant: ';
        return prompt;
    };
    /**
     * Генерация мок-ответа для тестирования
     */
    HuggingFaceLocalService.prototype.generateMockResponse = function (messages) {
        var lastMessage = messages[messages.length - 1];
        var userMessage = (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.content) || '';
        // Базовые мок-ответы в зависимости от типа запроса
        if (userMessage.toLowerCase().includes('анализ') || userMessage.toLowerCase().includes('analyze')) {
            return "\uD83D\uDD0D \u0410\u043D\u0430\u043B\u0438\u0437 \u043A\u043E\u0434\u0430 (Mock Response):\n\n\u041E\u0441\u043D\u043E\u0432\u043D\u044B\u0435 \u043D\u0430\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u044F:\n- \u041A\u043E\u0434 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0438\u0440\u043E\u0432\u0430\u043D \u0438 \u0447\u0438\u0442\u0430\u0435\u043C\n- \u0421\u043E\u0431\u043B\u044E\u0434\u0430\u044E\u0442\u0441\u044F \u043F\u0440\u0438\u043D\u0446\u0438\u043F\u044B \u0447\u0438\u0441\u0442\u043E\u0433\u043E \u043A\u043E\u0434\u0430\n- \u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0442\u0438\u043F\u0438\u0437\u0430\u0446\u0438\u044E TypeScript\n- \u0421\u0442\u043E\u0438\u0442 \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0435 unit-\u0442\u0435\u0441\u0442\u043E\u0432\n\n\u041F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u044F \u043F\u043E \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044E:\n1. \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C JSDoc \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0438\n2. \u0420\u0435\u0430\u043B\u0438\u0437\u043E\u0432\u0430\u0442\u044C error handling\n3. \u041E\u043F\u0442\u0438\u043C\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C";
        }
        if (userMessage.toLowerCase().includes('документаци') || userMessage.toLowerCase().includes('docs')) {
            return "\uD83D\uDCDA \u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F (Mock Response):\n\n## \u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435\n\u0424\u0443\u043D\u043A\u0446\u0438\u044F \u0432\u044B\u043F\u043E\u043B\u043D\u044F\u0435\u0442 \u0441\u043F\u0435\u0446\u0438\u0444\u0438\u0447\u0435\u0441\u043A\u0443\u044E \u0437\u0430\u0434\u0430\u0447\u0443 \u0432 \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F.\n\n## \u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B\n- `param1` - \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0430\n- `param2` - \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0432\u0442\u043E\u0440\u043E\u0433\u043E \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0430\n\n## \u0412\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u043C\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435\n\u0412\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0438 \u0432 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u043E\u043C \u0444\u043E\u0440\u043C\u0430\u0442\u0435.\n\n## \u041F\u0440\u0438\u043C\u0435\u0440 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F\n```typescript\nconst result = functionName(param1, param2);\n```";
        }
        if (userMessage.toLowerCase().includes('тест') || userMessage.toLowerCase().includes('test')) {
            return "\uD83E\uDDEA Unit-\u0442\u0435\u0441\u0442\u044B (Mock Response):\n\n```typescript\ndescribe('Component Tests', () => {\n  test('should handle basic functionality', () => {\n    // Arrange\n    const input = { test: 'data' };\n\n    // Act\n    const result = component.process(input);\n\n    // Assert\n    expect(result).toBeDefined();\n    expect(result.success).toBe(true);\n  });\n\n  test('should handle edge cases', () => {\n    // Arrange\n    const edgeCase = null;\n\n    // Act & Assert\n    expect(() => component.process(edgeCase))\n      .toThrow('Invalid input');\n  });\n});\n```";
        }
        // Общий мок-ответ
        return "\uD83E\uDD16 DeepSeek R1 Response (Mock Mode):\n\n\u041F\u0440\u0438\u0432\u0435\u0442! \u042F DeepSeek R1 \u0432 \u0440\u0435\u0436\u0438\u043C\u0435 \u044D\u043C\u0443\u043B\u044F\u0446\u0438\u0438. \u0412\u0430\u0448 \u0437\u0430\u043F\u0440\u043E\u0441: \"".concat(userMessage, "\"\n\n\u0412 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C \u0440\u0435\u0436\u0438\u043C\u0435 \u044F \u0431\u044B:\n- \u041F\u0440\u043E\u0430\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043B \u0432\u0430\u0448 \u043A\u043E\u0434 \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u043F\u0435\u0440\u0435\u0434\u043E\u0432\u044B\u0445 \u0430\u043B\u0433\u043E\u0440\u0438\u0442\u043C\u043E\u0432\n- \u041F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u0438\u043B \u0434\u0435\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438\n- \u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043B \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u0443\u044E \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044E\n- \u0421\u043E\u0437\u0434\u0430\u043B comprehensive \u0442\u0435\u0441\u0442\u044B\n\n\u0414\u043B\u044F \u043F\u043E\u043B\u043D\u043E\u0439 \u0444\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0443\u044E \u043C\u043E\u0434\u0435\u043B\u044C DeepSeek R1.");
    };
    /**
     * Проверка работоспособности сервиса
     */
    HuggingFaceLocalService.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        status: this.isInitialized ? 'healthy' : 'not_initialized',
                        model: this.modelName,
                        initialized: this.isInitialized,
                        mockMode: this.mockMode,
                    }];
            });
        });
    };
    /**
     * Освобождение ресурсов
     */
    HuggingFaceLocalService.prototype.dispose = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.model) {
                    // Освобождаем память, занятую моделью
                    this.model = null;
                }
                if (this.tokenizer) {
                    this.tokenizer = null;
                }
                if (this.generator) {
                    this.generator = null;
                }
                this.isInitialized = false;
                logger_js_1.logger.info('🧹 HuggingFace Local Service disposed');
                return [2 /*return*/];
            });
        });
    };
    return HuggingFaceLocalService;
}());
exports.HuggingFaceLocalService = HuggingFaceLocalService;
// Экспортируем singleton instance
exports.huggingFaceLocalService = new HuggingFaceLocalService();
