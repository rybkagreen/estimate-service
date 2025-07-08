#!/usr/bin/env node
"use strict";
/**
 * Estimate Service MCP Server with Local DeepSeek R1
 * MCP сервер с поддержкой локальной модели DeepSeek R1 через Hugging Face
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
exports.createServer = createServer;
exports.main = main;
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var huggingface_local_service_js_1 = require("./services/huggingface-local.service.js");
var logger_js_1 = require("./utils/logger.js");
/**
 * Local DeepSeek R1 tools definitions
 */
var LOCAL_DEEPSEEK_TOOLS = [
    {
        name: 'local_deepseek_analyze_code',
        description: 'Анализ кода с помощью локальной модели DeepSeek R1',
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'Код для анализа' },
                context: { type: 'string', description: 'Контекст анализа' },
                language: { type: 'string', enum: ['typescript', 'javascript', 'react', 'nestjs', 'python'], description: 'Язык программирования' }
            },
            required: ['code']
        }
    },
    {
        name: 'local_deepseek_generate_docs',
        description: 'Генерация документации с помощью локальной модели DeepSeek R1',
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'Код для документирования' },
                type: { type: 'string', enum: ['function', 'class', 'component', 'api', 'module'], description: 'Тип документации' },
                format: { type: 'string', enum: ['jsdoc', 'markdown', 'typescript'], description: 'Формат документации', default: 'jsdoc' }
            },
            required: ['code']
        }
    },
    {
        name: 'local_deepseek_generate_tests',
        description: 'Генерация тестов с помощью локальной модели DeepSeek R1',
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'Код для создания тестов' },
                framework: { type: 'string', enum: ['jest', 'vitest', 'playwright', 'cypress'], description: 'Тестовый фреймворк' },
                testType: { type: 'string', enum: ['unit', 'integration', 'e2e'], description: 'Тип тестов' },
                coverage: { type: 'boolean', description: 'Включить покрытие кода', default: true }
            },
            required: ['code']
        }
    },
    {
        name: 'local_deepseek_refactor_code',
        description: 'Рефакторинг кода с помощью локальной модели DeepSeek R1',
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'Код для рефакторинга' },
                goals: { type: 'array', items: { type: 'string' }, description: 'Цели рефакторинга' },
                style: { type: 'string', enum: ['clean-code', 'performance', 'maintainability', 'readability'], description: 'Стиль рефакторинга' }
            },
            required: ['code']
        }
    },
    {
        name: 'local_deepseek_architecture_advice',
        description: 'Архитектурные советы от локальной модели DeepSeek R1',
        inputSchema: {
            type: 'object',
            properties: {
                description: { type: 'string', description: 'Описание задачи или проблемы' },
                constraints: { type: 'array', items: { type: 'string' }, description: 'Технические ограничения' },
                domain: { type: 'string', enum: ['frontend', 'backend', 'fullstack', 'database', 'devops', 'mobile'], description: 'Область разработки' },
                scale: { type: 'string', enum: ['small', 'medium', 'large', 'enterprise'], description: 'Масштаб проекта' }
            },
            required: ['description']
        }
    },
    {
        name: 'local_deepseek_chat',
        description: 'Общение с локальной моделью DeepSeek R1',
        inputSchema: {
            type: 'object',
            properties: {
                message: { type: 'string', description: 'Сообщение для DeepSeek R1' },
                context: { type: 'string', description: 'Дополнительный контекст' },
                temperature: { type: 'number', minimum: 0, maximum: 1, description: 'Температура для генерации', default: 0.7 },
                maxTokens: { type: 'number', minimum: 1, maximum: 2048, description: 'Максимальное количество токенов', default: 512 }
            },
            required: ['message']
        }
    },
    {
        name: 'local_deepseek_health_check',
        description: 'Проверка работоспособности локальной модели DeepSeek R1',
        inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false
        }
    },
    {
        name: 'local_deepseek_code_review',
        description: 'Код-ревью с помощью локальной модели DeepSeek R1',
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'Код для ревью' },
                checklist: { type: 'array', items: { type: 'string' }, description: 'Пункты для проверки' },
                severity: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Уровень строгости проверки', default: 'medium' }
            },
            required: ['code']
        }
    }
];
/**
 * Создание и настройка MCP сервера
 */
function createServer() {
    return __awaiter(this, void 0, void 0, function () {
        var server;
        var _this = this;
        return __generator(this, function (_a) {
            server = new index_js_1.Server({
                name: 'estimate-service-local-deepseek',
                version: '1.0.0',
                description: 'MCP server with local DeepSeek R1 model support',
            });
            // Обработчик списка инструментов
            server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    logger_js_1.logger.debug('📋 Listing available tools');
                    return [2 /*return*/, {
                            tools: LOCAL_DEEPSEEK_TOOLS,
                        }];
                });
            }); });
            // Обработчик вызова инструментов
            server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(_this, void 0, void 0, function () {
                var _a, name, args, _b, error_1;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _a = request.params, name = _a.name, args = _a.arguments;
                            logger_js_1.logger.info("\uD83D\uDD27 Tool called: ".concat(name));
                            logger_js_1.logger.debug('🔧 Tool arguments:', args);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 20, , 21]);
                            _b = name;
                            switch (_b) {
                                case 'local_deepseek_analyze_code': return [3 /*break*/, 2];
                                case 'local_deepseek_generate_docs': return [3 /*break*/, 4];
                                case 'local_deepseek_generate_tests': return [3 /*break*/, 6];
                                case 'local_deepseek_refactor_code': return [3 /*break*/, 8];
                                case 'local_deepseek_architecture_advice': return [3 /*break*/, 10];
                                case 'local_deepseek_chat': return [3 /*break*/, 12];
                                case 'local_deepseek_health_check': return [3 /*break*/, 14];
                                case 'local_deepseek_code_review': return [3 /*break*/, 16];
                            }
                            return [3 /*break*/, 18];
                        case 2: return [4 /*yield*/, handleCodeAnalysis(args)];
                        case 3: return [2 /*return*/, _c.sent()];
                        case 4: return [4 /*yield*/, handleDocumentationGeneration(args)];
                        case 5: return [2 /*return*/, _c.sent()];
                        case 6: return [4 /*yield*/, handleTestGeneration(args)];
                        case 7: return [2 /*return*/, _c.sent()];
                        case 8: return [4 /*yield*/, handleCodeRefactoring(args)];
                        case 9: return [2 /*return*/, _c.sent()];
                        case 10: return [4 /*yield*/, handleArchitectureAdvice(args)];
                        case 11: return [2 /*return*/, _c.sent()];
                        case 12: return [4 /*yield*/, handleChat(args)];
                        case 13: return [2 /*return*/, _c.sent()];
                        case 14: return [4 /*yield*/, handleHealthCheck()];
                        case 15: return [2 /*return*/, _c.sent()];
                        case 16: return [4 /*yield*/, handleCodeReview(args)];
                        case 17: return [2 /*return*/, _c.sent()];
                        case 18: throw new Error("Unknown tool: ".concat(name));
                        case 19: return [3 /*break*/, 21];
                        case 20:
                            error_1 = _c.sent();
                            logger_js_1.logger.error("\u274C Tool execution error for ".concat(name, ":"), error_1);
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: 'text',
                                            text: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430 ".concat(name, ": ").concat(error_1 instanceof Error ? error_1.message : String(error_1)),
                                        },
                                    ],
                                }];
                        case 21: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/, server];
        });
    });
}
/**
 * Обработка анализа кода
 */
function handleCodeAnalysis(args) {
    return __awaiter(this, void 0, void 0, function () {
        var code, _a, context, _b, language, systemPrompt, response;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    code = args.code, _a = args.context, context = _a === void 0 ? '' : _a, _b = args.language, language = _b === void 0 ? 'typescript' : _b;
                    systemPrompt = "\u0422\u044B - \u044D\u043A\u0441\u043F\u0435\u0440\u0442 \u043F\u043E \u0430\u043D\u0430\u043B\u0438\u0437\u0443 \u043A\u043E\u0434\u0430. \u041F\u0440\u043E\u0430\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u0443\u0439 \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043D\u044B\u0439 \u043A\u043E\u0434 \u0438 \u0434\u0430\u0439 \u043F\u043E\u0434\u0440\u043E\u0431\u043D\u0443\u044E \u043E\u0446\u0435\u043D\u043A\u0443:\n\n1. \u041A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u043A\u043E\u0434\u0430 (\u0447\u0438\u0442\u0430\u0435\u043C\u043E\u0441\u0442\u044C, \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430)\n2. \u041F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u044B \u0438 \u0431\u0430\u0433\u0438\n3. \u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C\n4. \u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C\n5. \u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435 best practices\n6. \u041A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u044B\u0435 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438 \u043F\u043E \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044E\n\n\u042F\u0437\u044B\u043A \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F: ".concat(language, "\n").concat(context ? "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442: ".concat(context) : '', "\n\n\u041A\u043E\u0434 \u0434\u043B\u044F \u0430\u043D\u0430\u043B\u0438\u0437\u0430:");
                    return [4 /*yield*/, huggingface_local_service_js_1.huggingFaceLocalService.generateResponse([
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: code }
                        ])];
                case 1:
                    response = _c.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: "# \uD83D\uDD0D \u0410\u043D\u0430\u043B\u0438\u0437 \u043A\u043E\u0434\u0430 (".concat(language, ")\n\n").concat(response),
                                },
                            ],
                        }];
            }
        });
    });
}
/**
 * Обработка генерации документации
 */
function handleDocumentationGeneration(args) {
    return __awaiter(this, void 0, void 0, function () {
        var code, _a, type, _b, format, systemPrompt, response;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    code = args.code, _a = args.type, type = _a === void 0 ? 'function' : _a, _b = args.format, format = _b === void 0 ? 'jsdoc' : _b;
                    systemPrompt = "\u0422\u044B - \u044D\u043A\u0441\u043F\u0435\u0440\u0442 \u043F\u043E \u043D\u0430\u043F\u0438\u0441\u0430\u043D\u0438\u044E \u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u0438. \u0421\u043E\u0437\u0434\u0430\u0439 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u0443\u044E \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044E \u0434\u043B\u044F \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u043E\u0434\u0430:\n\n\u0422\u0438\u043F: ".concat(type, "\n\u0424\u043E\u0440\u043C\u0430\u0442: ").concat(format, "\n\n\u0422\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F:\n- \u041F\u043E\u0434\u0440\u043E\u0431\u043D\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F\n- \u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u0432\u0441\u0435\u0445 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u0432\n- \u041F\u0440\u0438\u043C\u0435\u0440\u044B \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F\n- \u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u043C\u044B\u0445 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0439\n- \u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u043E\u0448\u0438\u0431\u043E\u043A (\u0435\u0441\u043B\u0438 \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u043C\u043E)\n\n\u041A\u043E\u0434 \u0434\u043B\u044F \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F:");
                    return [4 /*yield*/, huggingface_local_service_js_1.huggingFaceLocalService.generateResponse([
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: code }
                        ])];
                case 1:
                    response = _c.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: "# \uD83D\uDCDA \u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F (".concat(type, ", ").concat(format, ")\n\n").concat(response),
                                },
                            ],
                        }];
            }
        });
    });
}
/**
 * Обработка генерации тестов
 */
function handleTestGeneration(args) {
    return __awaiter(this, void 0, void 0, function () {
        var code, _a, framework, _b, testType, _c, coverage, systemPrompt, response;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    code = args.code, _a = args.framework, framework = _a === void 0 ? 'jest' : _a, _b = args.testType, testType = _b === void 0 ? 'unit' : _b, _c = args.coverage, coverage = _c === void 0 ? true : _c;
                    systemPrompt = "\u0422\u044B - \u044D\u043A\u0441\u043F\u0435\u0440\u0442 \u043F\u043E \u043D\u0430\u043F\u0438\u0441\u0430\u043D\u0438\u044E \u0442\u0435\u0441\u0442\u043E\u0432. \u0421\u043E\u0437\u0434\u0430\u0439 comprehensive \u0442\u0435\u0441\u0442\u044B \u0434\u043B\u044F \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u043E\u0434\u0430:\n\n\u0424\u0440\u0435\u0439\u043C\u0432\u043E\u0440\u043A: ".concat(framework, "\n\u0422\u0438\u043F \u0442\u0435\u0441\u0442\u043E\u0432: ").concat(testType, "\n\u041F\u043E\u043A\u0440\u044B\u0442\u0438\u0435 \u043A\u043E\u0434\u0430: ").concat(coverage ? 'включено' : 'выключено', "\n\n\u0422\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F:\n- \u041F\u043E\u043B\u043D\u043E\u0435 \u043F\u043E\u043A\u0440\u044B\u0442\u0438\u0435 \u0444\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438\n- \u0422\u0435\u0441\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 edge cases\n- \u041F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u0442\u0435\u0441\u0442\u043E\u0432\n- \u041C\u043E\u043A\u0438 \u0438 \u0441\u0442\u0430\u0431\u044B \u0433\u0434\u0435 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E\n- \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043E\u0448\u0438\u0431\u043E\u043A\n\n\u041A\u043E\u0434 \u0434\u043B\u044F \u0442\u0435\u0441\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F:");
                    return [4 /*yield*/, huggingface_local_service_js_1.huggingFaceLocalService.generateResponse([
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: code }
                        ])];
                case 1:
                    response = _d.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: "# \uD83E\uDDEA \u0422\u0435\u0441\u0442\u044B (".concat(framework, ", ").concat(testType, ")\n\n").concat(response),
                                },
                            ],
                        }];
            }
        });
    });
}
/**
 * Обработка рефакторинга кода
 */
function handleCodeRefactoring(args) {
    return __awaiter(this, void 0, void 0, function () {
        var code, _a, goals, _b, style, goalsText, systemPrompt, response;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    code = args.code, _a = args.goals, goals = _a === void 0 ? [] : _a, _b = args.style, style = _b === void 0 ? 'clean-code' : _b;
                    goalsText = goals.length > 0 ? goals.join(', ') : 'улучшение качества кода';
                    systemPrompt = "\u0422\u044B - \u044D\u043A\u0441\u043F\u0435\u0440\u0442 \u043F\u043E \u0440\u0435\u0444\u0430\u043A\u0442\u043E\u0440\u0438\u043D\u0433\u0443 \u043A\u043E\u0434\u0430. \u041F\u0440\u0435\u0434\u043B\u043E\u0436\u0438 \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u043D\u0443\u044E \u0432\u0435\u0440\u0441\u0438\u044E \u043A\u043E\u0434\u0430:\n\n\u0426\u0435\u043B\u0438 \u0440\u0435\u0444\u0430\u043A\u0442\u043E\u0440\u0438\u043D\u0433\u0430: ".concat(goalsText, "\n\u0421\u0442\u0438\u043B\u044C: ").concat(style, "\n\n\u0422\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F:\n- \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0444\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C\n- \u0423\u043B\u0443\u0447\u0448\u0438\u0442\u044C \u0447\u0438\u0442\u0430\u0435\u043C\u043E\u0441\u0442\u044C\n- \u041E\u043F\u0442\u0438\u043C\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C\n- \u0421\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u0438\u043D\u0446\u0438\u043F\u0430\u043C ").concat(style, "\n- \u041E\u0431\u044A\u044F\u0441\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F\n\n\u041A\u043E\u0434 \u0434\u043B\u044F \u0440\u0435\u0444\u0430\u043A\u0442\u043E\u0440\u0438\u043D\u0433\u0430:");
                    return [4 /*yield*/, huggingface_local_service_js_1.huggingFaceLocalService.generateResponse([
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: code }
                        ])];
                case 1:
                    response = _c.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: "# \uD83D\uDD04 \u0420\u0435\u0444\u0430\u043A\u0442\u043E\u0440\u0438\u043D\u0433 (".concat(style, ")\n\n\u0426\u0435\u043B\u0438: ").concat(goalsText, "\n\n").concat(response),
                                },
                            ],
                        }];
            }
        });
    });
}
/**
 * Обработка архитектурных советов
 */
function handleArchitectureAdvice(args) {
    return __awaiter(this, void 0, void 0, function () {
        var description, _a, constraints, _b, domain, _c, scale, constraintsText, systemPrompt, response;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    description = args.description, _a = args.constraints, constraints = _a === void 0 ? [] : _a, _b = args.domain, domain = _b === void 0 ? 'fullstack' : _b, _c = args.scale, scale = _c === void 0 ? 'medium' : _c;
                    constraintsText = constraints.length > 0 ? constraints.join(', ') : 'нет особых ограничений';
                    systemPrompt = "\u0422\u044B - \u0430\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u043E\u0440 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u043D\u043E\u0433\u043E \u043E\u0431\u0435\u0441\u043F\u0435\u0447\u0435\u043D\u0438\u044F. \u0414\u0430\u0439 \u044D\u043A\u0441\u043F\u0435\u0440\u0442\u043D\u044B\u0439 \u0441\u043E\u0432\u0435\u0442 \u043F\u043E \u0430\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u0435:\n\n\u041E\u0431\u043B\u0430\u0441\u0442\u044C: ".concat(domain, "\n\u041C\u0430\u0441\u0448\u0442\u0430\u0431: ").concat(scale, "\n\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F: ").concat(constraintsText, "\n\n\u0422\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F:\n- \u041F\u043E\u0434\u0445\u043E\u0434\u044F\u0449\u0438\u0435 \u0430\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u043D\u044B\u0435 \u043F\u0430\u0442\u0442\u0435\u0440\u043D\u044B\n- \u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0441\u0442\u0435\u043A\n- \u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u043F\u0440\u043E\u0435\u043A\u0442\u0430\n- \u041C\u0430\u0441\u0448\u0442\u0430\u0431\u0438\u0440\u0443\u0435\u043C\u043E\u0441\u0442\u044C\n- \u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C\n- \u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C\n\n\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0437\u0430\u0434\u0430\u0447\u0438:");
                    return [4 /*yield*/, huggingface_local_service_js_1.huggingFaceLocalService.generateResponse([
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: description }
                        ])];
                case 1:
                    response = _d.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: "# \uD83C\uDFD7\uFE0F \u0410\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u043D\u044B\u0435 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438 (".concat(domain, ", ").concat(scale, ")\n\n").concat(response),
                                },
                            ],
                        }];
            }
        });
    });
}
/**
 * Обработка чата
 */
function handleChat(args) {
    return __awaiter(this, void 0, void 0, function () {
        var message, _a, context, _b, temperature, _c, maxTokens, systemPrompt, response;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    message = args.message, _a = args.context, context = _a === void 0 ? '' : _a, _b = args.temperature, temperature = _b === void 0 ? 0.7 : _b, _c = args.maxTokens, maxTokens = _c === void 0 ? 512 : _c;
                    systemPrompt = "\u0422\u044B - DeepSeek R1, \u043F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u0430\u044F AI-\u043C\u043E\u0434\u0435\u043B\u044C \u0434\u043B\u044F \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u041F\u041E. \u0422\u044B \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0448\u044C \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E \u0438 \u043F\u043E\u043C\u043E\u0433\u0430\u0435\u0448\u044C \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0447\u0438\u043A\u0430\u043C.\n\n".concat(context ? "\u041A\u043E\u043D\u0442\u0435\u043A\u0441\u0442: ".concat(context) : '', "\n\n\u041E\u0442\u0432\u0435\u0447\u0430\u0439 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E, \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u0438\u0432\u043D\u043E \u0438 \u0441 \u043F\u043E\u043D\u0438\u043C\u0430\u043D\u0438\u0435\u043C \u0441\u043F\u0435\u0446\u0438\u0444\u0438\u043A\u0438 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0438.");
                    return [4 /*yield*/, huggingface_local_service_js_1.huggingFaceLocalService.generateResponse([
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: message }
                        ], {
                            temperature: temperature,
                            maxTokens: maxTokens
                        })];
                case 1:
                    response = _d.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: "# \uD83E\uDD16 DeepSeek R1 (Local)\n\n".concat(response),
                                },
                            ],
                        }];
            }
        });
    });
}
/**
 * Обработка проверки здоровья
 */
function handleHealthCheck() {
    return __awaiter(this, void 0, void 0, function () {
        var health;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, huggingface_local_service_js_1.huggingFaceLocalService.healthCheck()];
                case 1:
                    health = _a.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: "# \uD83D\uDC9A \u0421\u0442\u0430\u0442\u0443\u0441 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E\u0439 \u043C\u043E\u0434\u0435\u043B\u0438 DeepSeek R1\n\n**\u0421\u0442\u0430\u0442\u0443\u0441:** ".concat(health.status, "\n**\u041C\u043E\u0434\u0435\u043B\u044C:** ").concat(health.model, "\n**\u0418\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u0430:** ").concat(health.initialized ? '✅' : '❌', "\n**\u0420\u0435\u0436\u0438\u043C \u044D\u043C\u0443\u043B\u044F\u0446\u0438\u0438:** ").concat(health.mockMode ? '🎭' : '🤖', "\n\n").concat(health.mockMode ?
                                        '⚠️ **Работает в режиме эмуляции.** Для полной функциональности загрузите локальную модель.' :
                                        '✅ **Локальная модель готова к работе.**'),
                                },
                            ],
                        }];
            }
        });
    });
}
/**
 * Обработка код-ревью
 */
function handleCodeReview(args) {
    return __awaiter(this, void 0, void 0, function () {
        var code, _a, checklist, _b, severity, checklistText, systemPrompt, response;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    code = args.code, _a = args.checklist, checklist = _a === void 0 ? [] : _a, _b = args.severity, severity = _b === void 0 ? 'medium' : _b;
                    checklistText = checklist.length > 0 ?
                        "\n\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043F\u0443\u043D\u043A\u0442\u044B \u0434\u043B\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438: ".concat(checklist.join(', ')) : '';
                    systemPrompt = "\u0422\u044B - \u043E\u043F\u044B\u0442\u043D\u044B\u0439 \u043A\u043E\u0434-\u0440\u0435\u0432\u044C\u044E\u0435\u0440. \u041F\u0440\u043E\u0432\u0435\u0434\u0438 \u0434\u0435\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u0434-\u0440\u0435\u0432\u044C\u044E:\n\n\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0441\u0442\u0440\u043E\u0433\u043E\u0441\u0442\u0438: ".concat(severity, "\n").concat(checklistText, "\n\n\u041F\u0440\u043E\u0432\u0435\u0440\u044C:\n- \u041A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u043E\u0441\u0442\u044C \u043B\u043E\u0433\u0438\u043A\u0438\n- \u0427\u0438\u0442\u0430\u0435\u043C\u043E\u0441\u0442\u044C \u0438 \u0441\u0442\u0438\u043B\u044C\n- \u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C\n- \u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C\n- \u0422\u0435\u0441\u0442\u0438\u0440\u0443\u0435\u043C\u043E\u0441\u0442\u044C\n- \u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435 \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u0430\u043C\n\n\u0414\u0430\u0439 \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0438 \u0438 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u044F \u043F\u043E \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044E.\n\n\u041A\u043E\u0434 \u0434\u043B\u044F \u0440\u0435\u0432\u044C\u044E:");
                    return [4 /*yield*/, huggingface_local_service_js_1.huggingFaceLocalService.generateResponse([
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: code }
                        ])];
                case 1:
                    response = _c.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: "# \uD83D\uDC40 \u041A\u043E\u0434-\u0440\u0435\u0432\u044C\u044E (\u0443\u0440\u043E\u0432\u0435\u043D\u044C: ".concat(severity, ")\n\n").concat(response),
                                },
                            ],
                        }];
            }
        });
    });
}
/**
 * Основная функция запуска сервера
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var server, transport, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_js_1.logger.info('🚀 Starting Estimate Service MCP Server with Local DeepSeek R1...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, createServer()];
                case 2:
                    server = _a.sent();
                    transport = new stdio_js_1.StdioServerTransport();
                    logger_js_1.logger.info('✅ MCP Server ready with local DeepSeek R1 support');
                    logger_js_1.logger.info('🤗 Available tools: code analysis, documentation, tests, refactoring, architecture advice, chat, health check, code review');
                    return [4 /*yield*/, server.connect(transport)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    logger_js_1.logger.error('❌ Failed to start MCP server:', error_2);
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Обработка сигналов завершения
process.on('SIGINT', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger_js_1.logger.info('🛑 Shutting down MCP server...');
                return [4 /*yield*/, huggingface_local_service_js_1.huggingFaceLocalService.dispose()];
            case 1:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
process.on('SIGTERM', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger_js_1.logger.info('🛑 Shutting down MCP server...');
                return [4 /*yield*/, huggingface_local_service_js_1.huggingFaceLocalService.dispose()];
            case 1:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
// Запуск сервера
if (import.meta.url === "file://".concat(process.argv[1])) {
    main().catch(function (error) {
        logger_js_1.logger.error('❌ Fatal error:', error);
        process.exit(1);
    });
}
