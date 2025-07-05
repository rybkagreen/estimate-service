#!/usr/bin/env node

/**
 * Прямой тест DeepSeek API через fetch (без OpenAI SDK)
 * Это поможет диагностировать проблемы с балансом и аутентификацией
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve('../.env') });

const apiKey = process.env.DEEPSEEK_API_KEY;
const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

console.log('🧪 Testing DeepSeek API directly with fetch...\n');
console.log(`🔗 Base URL: ${baseUrl}`);
console.log(`🔑 API Key: ${apiKey?.slice(0, 8)}...${apiKey?.slice(-4)}`);

if (!apiKey) {
  console.error('❌ DEEPSEEK_API_KEY is required');
  process.exit(1);
}

// 1. Тест доступности API (список моделей)
console.log('\n📋 Testing /models endpoint...');
try {
  const response = await fetch(`${baseUrl}/models`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
  });

  console.log(`Status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Models API Error:`, errorText);
  } else {
    const models = await response.json();
    console.log('✅ Available models:');
    if (models.data && Array.isArray(models.data)) {
      models.data.forEach(model => {
        console.log(`  - ${model.id}`);
      });
    } else {
      console.log('Raw response:', models);
    }
  }
} catch (error) {
  console.error('❌ Network error:', error.message);
}

// 2. Тест chat completion
console.log('\n💬 Testing /chat/completions endpoint...');
try {
  const chatResponse = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: 'Hello! Respond with "API working" if you can hear me.'
        }
      ],
      max_tokens: 20,
      temperature: 0
    })
  });

  console.log(`Status: ${chatResponse.status} ${chatResponse.statusText}`);

  if (!chatResponse.ok) {
    const errorText = await chatResponse.text();
    console.error(`❌ Chat API Error:`, errorText);

    // Парсим JSON ошибку для детального анализа
    try {
      const errorData = JSON.parse(errorText);
      console.log('\n🔍 Error details:');
      console.log(`  Type: ${errorData.error?.type}`);
      console.log(`  Code: ${errorData.error?.code}`);
      console.log(`  Message: ${errorData.error?.message}`);

      if (errorData.error?.code === 'insufficient_balance') {
        console.log('\n💳 РЕШЕНИЕ: Пополните баланс аккаунта на https://platform.deepseek.com');
      }
      if (errorData.error?.code === 'invalid_api_key') {
        console.log('\n🔑 РЕШЕНИЕ: Проверьте API ключ на https://platform.deepseek.com/api-keys');
      }
    } catch (parseError) {
      console.log('Could not parse error as JSON');
    }
  } else {
    const chatData = await chatResponse.json();
    console.log('✅ Chat API Success!');
    console.log(`Response: "${chatData.choices[0]?.message?.content}"`);
    console.log(`Usage:`, chatData.usage);
  }
} catch (error) {
  console.error('❌ Network error:', error.message);
}

// 3. Тест пользовательских данных (если доступен)
console.log('\n👤 Testing user info endpoint...');
try {
  const userResponse = await fetch(`${baseUrl}/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
  });

  console.log(`Status: ${userResponse.status} ${userResponse.statusText}`);

  if (!userResponse.ok) {
    const errorText = await userResponse.text();
    console.log(`ℹ️ User info not available: ${errorText}`);
  } else {
    const userData = await userResponse.json();
    console.log('✅ User info:', userData);
  }
} catch (error) {
  console.log('ℹ️ User info endpoint not available');
}

console.log('\n🏁 Direct API test completed!');
console.log('\n📝 Next steps:');
console.log('1. If you see "insufficient_balance" - add credits to your DeepSeek account');
console.log('2. If you see "invalid_api_key" - generate a new key at platform.deepseek.com');
console.log('3. If you see success - your API is working correctly!');
