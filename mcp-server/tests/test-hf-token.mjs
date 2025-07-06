/**
 * Диагностический скрипт для проверки Hugging Face API токена
 */

import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config({ path: '.env.api' });

const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;

console.log('🔍 Диагностика Hugging Face API токена\n');

if (!HF_TOKEN) {
  console.log('❌ Токен не найден');
  console.log('Убедитесь, что HF_TOKEN установлен в .env.api файле');
  process.exit(1);
}

console.log('📋 Информация о токене:');
console.log(`  - Длина: ${HF_TOKEN.length} символов`);
console.log(`  - Начинается с: ${HF_TOKEN.substring(0, 10)}...`);
console.log(`  - Формат: ${HF_TOKEN.startsWith('hf_') ? 'Корректный (hf_)' : 'Возможно неверный'}`);
console.log('');

// Тест 1: Проверка токена через whoami API
async function testTokenValidity() {
  console.log('🔐 Тест 1: Проверка валидности токена...');

  try {
    const response = await fetch('https://huggingface.co/api/whoami', {
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Токен валиден');
      console.log(`   - Пользователь: ${userData.name || 'N/A'}`);
      console.log(`   - Тип: ${userData.type || 'N/A'}`);
      console.log(`   - Email подтвержден: ${userData.emailVerified ? 'Да' : 'Нет'}`);
      console.log(`   - Орг.: ${userData.orgs?.length || 0} организаций`);
      return true;
    } else {
      console.log('❌ Токен невалиден');
      console.log(`   - Статус: ${response.status}`);
      console.log(`   - Ответ: ${await response.text()}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Ошибка при проверке токена:', error.message);
    return false;
  }
}

// Тест 2: Проверка доступа к Inference API
async function testInferenceAPI() {
  console.log('\n🧠 Тест 2: Проверка доступа к Inference API...');

  // Попробуем простую модель для тестирования
  const testModel = 'microsoft/DialoGPT-medium';

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${testModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: 'Hello, this is a test',
        options: {
          wait_for_model: true,
          use_cache: false,
        },
      }),
    });

    if (response.ok) {
      console.log('✅ Inference API доступен');
      const result = await response.json();
      console.log(`   - Тестовая модель: ${testModel}`);
      console.log(`   - Ответ получен: ${JSON.stringify(result).substring(0, 100)}...`);
      return true;
    } else {
      console.log('❌ Inference API недоступен');
      console.log(`   - Статус: ${response.status}`);
      const errorText = await response.text();
      console.log(`   - Ошибка: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Ошибка при тестировании Inference API:', error.message);
    return false;
  }
}

// Тест 3: Проверка доступа к DeepSeek моделям
async function testDeepSeekAccess() {
  console.log('\n🤖 Тест 3: Проверка доступа к DeepSeek моделям...');

  const deepseekModels = [
    'deepseek/deepseek-r1-0528',
    'deepseek/deepseek-r1-turbo',
    'deepseek-ai/DeepSeek-R1',
    'deepseek-ai/deepseek-coder-33b-instruct',
  ];

  for (const model of deepseekModels) {
    console.log(`\n   🔍 Проверяем модель: ${model}`);

    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'Test',
          options: {
            wait_for_model: true,
            use_cache: false,
          },
        }),
      });

      if (response.ok) {
        console.log(`   ✅ ${model} - доступна`);
      } else if (response.status === 403) {
        console.log(`   🔒 ${model} - доступ запрещен (возможно нужна подписка)`);
      } else if (response.status === 404) {
        console.log(`   ❓ ${model} - модель не найдена`);
      } else {
        const errorText = await response.text();
        console.log(`   ❌ ${model} - ошибка ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ ${model} - ошибка: ${error.message}`);
    }

    // Небольшая задержка между запросами
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Тест 4: Проверка квот и лимитов
async function testQuotas() {
  console.log('\n📊 Тест 4: Проверка квот и лимитов...');

  try {
    // Этот endpoint может не существовать в публичном API, но попробуем
    const response = await fetch('https://huggingface.co/api/spaces', {
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
      },
    });

    if (response.ok) {
      console.log('✅ API отвечает на базовые запросы');
    } else {
      console.log(`⚠️  Статус ответа: ${response.status}`);
    }
  } catch (error) {
    console.log('⚠️  Не удалось проверить квоты:', error.message);
  }
}

// Выполняем все тесты
async function runDiagnostics() {
  const tokenValid = await testTokenValidity();

  if (tokenValid) {
    await testInferenceAPI();
    await testDeepSeekAccess();
    await testQuotas();
  }

  console.log('\n📋 Резюме:');
  if (!tokenValid) {
    console.log('❌ Основная проблема: Невалидный или неактивный токен');
    console.log('💡 Рекомендации:');
    console.log('   1. Проверьте токен на https://huggingface.co/settings/tokens');
    console.log('   2. Убедитесь, что токен имеет права "Read"');
    console.log('   3. Попробуйте создать новый токен');
  } else {
    console.log('✅ Токен валиден, но возможны проблемы с доступом к конкретным моделям');
    console.log('💡 Рекомендации:');
    console.log('   1. Некоторые модели требуют платной подписки Hugging Face Pro');
    console.log('   2. Попробуйте использовать открытые модели для тестирования');
    console.log('   3. Проверьте https://huggingface.co/pricing для доступа к премиум моделям');
  }
}

runDiagnostics().catch(console.error);
