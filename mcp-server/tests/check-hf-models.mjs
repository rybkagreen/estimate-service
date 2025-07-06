/**
 * Диагностический скрипт для проверки доступных моделей в Hugging Face
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.api' });

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.log('❌ HF_TOKEN не найден в .env.api');
  process.exit(1);
}

console.log('🔍 Проверка доступных моделей в Hugging Face...\n');

async function checkHuggingFaceModels() {
  const models = [
    'deepseek/deepseek-r1-0528',
    'deepseek/deepseek-r1-turbo',
    'deepseek-ai/DeepSeek-R1',
    'deepseek-ai/deepseek-coder-6.7b-instruct',
    'microsoft/DialoGPT-medium',
    'gpt2',
    'facebook/opt-350m'
  ];

  console.log(`🔑 Используется ключ: ${HF_TOKEN.substring(0, 10)}...`);
  console.log('');

  for (const model of models) {
    try {
      console.log(`🧪 Тестирование модели: ${model}`);

      const url = `https://api-inference.huggingface.co/models/${model}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'Hello, how are you?',
          parameters: {
            max_new_tokens: 10,
            temperature: 0.7,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${model} - Доступна!`);
        console.log(`   Пример ответа: ${JSON.stringify(result).substring(0, 100)}...`);
      } else {
        const error = await response.text();
        console.log(`❌ ${model} - Недоступна (${response.status}): ${error.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`❌ ${model} - Ошибка: ${error.message}`);
    }

    console.log('');

    // Пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Дополнительная проверка API ключа
async function checkApiKey() {
  try {
    console.log('🔐 Проверка валидности API ключа...');

    const response = await fetch('https://huggingface.co/api/whoami', {
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
      },
    });

    if (response.ok) {
      const userInfo = await response.json();
      console.log('✅ API ключ валиден');
      console.log(`👤 Пользователь: ${userInfo.name || userInfo.id || 'Unknown'}`);
      console.log(`📧 Email: ${userInfo.email || 'Not provided'}`);
      console.log(`💰 Тип: ${userInfo.type || 'Unknown'}`);
      console.log('');
    } else {
      console.log(`❌ API ключ невалиден (${response.status})`);
      const error = await response.text();
      console.log(`   Ошибка: ${error}`);
      console.log('');
    }
  } catch (error) {
    console.log(`❌ Ошибка проверки API ключа: ${error.message}`);
    console.log('');
  }
}

async function main() {
  await checkApiKey();
  await checkHuggingFaceModels();

  console.log('🎯 Рекомендации:');
  console.log('1. Если все модели недоступны - проверьте API ключ');
  console.log('2. Если только DeepSeek модели недоступны - возможно нужна подписка');
  console.log('3. Попробуйте использовать доступные альтернативы');
  console.log('4. Проверьте статус модели на https://huggingface.co/models');
}

main().catch(console.error);
