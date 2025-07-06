#!/usr/bin/env node

/**
 * Тест для проверки доступных моделей DeepSeek API
 */

import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve('../.env') });

const apiKey = process.env.DEEPSEEK_API_KEY;
const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

console.log('🧪 Testing DeepSeek API models...\n');

if (!apiKey) {
  console.error('❌ DEEPSEEK_API_KEY is required');
  process.exit(1);
}

const client = new OpenAI({
  apiKey,
  baseUrl,
});

console.log(`🔗 Base URL: ${baseUrl}`);
console.log(`🔑 API Key: ${apiKey.slice(0, 8)}...`);

// Test list models
console.log('\n📋 Getting available models...');
try {
  const models = await client.models.list();
  console.log('✅ Available models:');
  models.data.forEach(model => {
    console.log(`  - ${model.id} (created: ${new Date(model.created * 1000).toISOString()})`);
  });
} catch (error) {
  console.error('❌ Error listing models:', error.message);
}

// Test specific models
const modelsToTest = [
  'deepseek-reasoner',
  'deepseek-chat',
  'deepseek-r1',
  'deepseek-r1-lite-preview',
  'deepseek-r1-preview'
];

console.log('\n🧪 Testing specific models...');

for (const model of modelsToTest) {
  console.log(`\n🔍 Testing model: ${model}`);

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'user',
          content: 'Hello! Please respond with just "OK" to test connectivity.'
        }
      ],
      max_tokens: 10,
      temperature: 0
    });

    if (response.choices && response.choices[0] && response.choices[0].message) {
      console.log(`✅ ${model}: SUCCESS - Response: "${response.choices[0].message.content}"`);
      console.log(`   Usage: ${JSON.stringify(response.usage)}`);
    } else {
      console.log(`⚠️ ${model}: Empty response`);
    }
  } catch (error) {
    console.log(`❌ ${model}: ERROR - ${error.message}`);
  }
}

console.log('\n🏁 Test completed!');
