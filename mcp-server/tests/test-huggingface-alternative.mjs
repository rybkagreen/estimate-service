#!/usr/bin/env node

/**
 * Тест для Hugging Face API как альтернатива DeepSeek
 * Использует Hugging Face Inference API
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve('../.env') });

const hfApiKey = process.env.HUGGINGFACE_API_KEY || 'your-huggingface-api-key';
const baseUrl = 'https://api-inference.huggingface.co/models';

console.log('🧪 Testing Hugging Face API as DeepSeek alternative...\n');
console.log(`🔗 Base URL: ${baseUrl}`);
console.log(`🔑 HF API Key: ${hfApiKey.slice(0, 8)}...${hfApiKey.slice(-4)}`);

// Список популярных моделей на Hugging Face для тестирования
const modelsToTest = [
  'microsoft/DialoGPT-medium',
  'facebook/blenderbot-400M-distill',
  'microsoft/DialoGPT-small',
  'deepseek-ai/deepseek-coder-6.7b-instruct', // Если доступна на HF
  'deepseek-ai/deepseek-llm-7b-chat' // Если доступна на HF
];

async function testHuggingFaceModel(modelName) {
  try {
    console.log(`\n🔍 Testing model: ${modelName}`);

    const response = await fetch(`${baseUrl}/${modelName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: 'Hello! Please respond with "API working" if you can hear me.',
        parameters: {
          max_length: 50,
          temperature: 0.1
        }
      })
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ ${modelName}: ERROR - ${errorText}`);
      return false;
    }

    const result = await response.json();

    if (Array.isArray(result) && result[0]?.generated_text) {
      console.log(`✅ ${modelName}: SUCCESS`);
      console.log(`   Response: "${result[0].generated_text}"`);
      return true;
    } else {
      console.log(`⚠️ ${modelName}: Unexpected response format:`, result);
      return false;
    }

  } catch (error) {
    console.log(`❌ ${modelName}: Network error - ${error.message}`);
    return false;
  }
}

// Тест доступности API
console.log('\n📋 Testing Hugging Face API access...');

let successCount = 0;
for (const model of modelsToTest) {
  const success = await testHuggingFaceModel(model);
  if (success) successCount++;

  // Пауза между запросами, чтобы не превысить rate limit
  await new Promise(resolve => setTimeout(resolve, 1000));
}

console.log(`\n🏁 Test completed!`);
console.log(`✅ Successful models: ${successCount}/${modelsToTest.length}`);

if (successCount > 0) {
  console.log('\n💡 Hugging Face API is working! You could use it as an alternative to DeepSeek.');
  console.log('📝 To integrate with the MCP server, you would need to:');
  console.log('1. Update the DeepSeekService to use Hugging Face API format');
  console.log('2. Modify the request/response handling for HF models');
  console.log('3. Update environment variables for HF configuration');
} else {
  console.log('\n❌ No models worked. This could be due to:');
  console.log('1. Invalid API key');
  console.log('2. Models not available or loading');
  console.log('3. Rate limiting');
}

console.log('\n🎯 Recommendation: Get a proper DeepSeek API key from platform.deepseek.com');
console.log('   DeepSeek offers better performance and is specifically designed for this use case.');
