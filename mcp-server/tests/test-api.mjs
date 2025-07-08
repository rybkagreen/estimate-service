/**
 * Тест для проверки работы MCP сервера с DeepSeek R1 через Hugging Face API
 */

import { config } from './dist-api/config/index.js';
import { novitaClient } from './dist-api/services/novita-client.service.js';

console.log('🧪 Testing DeepSeek R1 via Hugging Face API...\n');

async function testHuggingFaceApi() {
  try {
    console.log('📋 Configuration:');
    console.log(`  - Model: ${config.ai.huggingface?.modelName}`);
    console.log(`  - Use API: ${config.ai.huggingface?.useApi}`);
    console.log(`  - Mock Mode: ${config.ai.huggingface?.mockMode}`);
    console.log(`  - Has API Key: ${!!config.ai.huggingface?.apiKey}`);
    console.log('');

    if (!config.ai.huggingface?.apiKey) {
      console.log('❌ Ошибка: HF_TOKEN не установлен');
      console.log('Установите HF_TOKEN в .env.api файле или environment variable');
      return;
    }

    // Инициализация сервиса
    console.log('🚀 Testing Novita API connection...');
    await novitaClient.testConnection();
    console.log('✅ Connection test successful\n');

    // Тест 1: Простой чат
    console.log('🗣️  Test 1: Simple chat');
    const chatResponse = await novitaClient.generateResponse([
      {
        role: 'user',
        content: 'Привет! Как дела? Расскажи кратко о себе.',
      },
    ], {
      temperature: 0.7,
      maxTokens: 200,
    });

    console.log('Response:', chatResponse.content);
    if (chatResponse.usage) {
      console.log('Usage:', chatResponse.usage);
    }
    console.log('');

    // Тест 2: Анализ кода
    console.log('🔍 Test 2: Code analysis');
    const codeToAnalyze = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
`;

    const analysisResponse = await novitaClient.generateResponse([
      {
        role: 'system',
        content: 'Ты эксперт по анализу кода. Проанализируй предоставленный код.',
      },
      {
        role: 'user',
        content: `Проанализируй этот JavaScript код:\n\n\`\`\`javascript\n${codeToAnalyze}\n\`\`\``,
      },
    ], {
      temperature: 0.3,
      maxTokens: 500,
    });

    console.log('Analysis:', analysisResponse.content.substring(0, 300) + '...');
    console.log('');

    // Тест 3: Генерация тестов
    console.log('🧪 Test 3: Test generation');
    const testsResponse = await novitaClient.generateResponse([
      {
        role: 'system',
        content: 'Ты эксперт по написанию тестов. Создай тесты для предоставленного кода.',
      },
      {
        role: 'user',
        content: `Создай тесты для этого JavaScript кода:\n\n\`\`\`javascript\n${codeToAnalyze}\n\`\`\``,
      },
    ], {
      temperature: 0.2,
      maxTokens: 800,
    });

    console.log('Generated tests:', testsResponse.content.substring(0, 300) + '...');
    console.log('');

    // Тест 4: Рефакторинг
    console.log('🔧 Test 4: Code refactoring');
    const refactorResponse = await novitaClient.generateResponse([
      {
        role: 'system',
        content: 'Ты эксперт по рефакторингу кода. Улучши предоставленный код.',
      },
      {
        role: 'user',
        content: `Отрефактори этот JavaScript код с инструкцией: Оптимизируй для производительности\n\n\`\`\`javascript\n${codeToAnalyze}\n\`\`\``,
      },
    ], {
      temperature: 0.2,
      maxTokens: 800,
    });

    console.log('Refactored code:', refactorResponse.content.substring(0, 300) + '...');
    console.log('');

    // Тест 5: Health check
    console.log('💚 Test 5: Health check');
    const healthStatus = novitaClient.getHealthStatus();
    console.log('Health status:', JSON.stringify(healthStatus, null, 2));
    console.log('');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);

    if (error.message?.includes('authentication')) {
      console.log('\n💡 Tip: Make sure your HF_TOKEN is valid and has appropriate permissions');
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      console.log('\n💡 Tip: You may have exceeded API rate limits or quota');
    }
  } finally {
    // Cleanup - Novita client не требует специальной очистки
    console.log('🧹 Cleanup completed');
  }
}

// Запуск тестов
testHuggingFaceApi();
