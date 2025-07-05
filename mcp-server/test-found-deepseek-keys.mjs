#!/usr/bin/env node

/**
 * Тест найденных DeepSeek API ключей из переписки
 */

const apiKeys = [
  { name: 'Key from .env', key: 'sk-196bc37b6d7347f4bb8fcda9c40be4da' },
  { name: 'Key from mcp-client-config.json', key: 'sk-aeaf60f610ee429892a113b1f4e20960' }
];

const baseUrl = 'https://api.deepseek.com/v1';

console.log('🔍 Testing found DeepSeek API keys from conversation...\n');

for (const apiData of apiKeys) {
  console.log(`\n🧪 Testing: ${apiData.name}`);
  console.log(`🔑 Key: ${apiData.key.slice(0, 8)}...${apiData.key.slice(-8)}`);

  try {
    // Тест доступности моделей
    console.log('📋 Testing /models endpoint...');
    const modelsResponse = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiData.key}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(`   Status: ${modelsResponse.status} ${modelsResponse.statusText}`);

    if (modelsResponse.ok) {
      const models = await modelsResponse.json();
      console.log('   ✅ Models endpoint works!');
      if (models.data) {
        console.log(`   📋 Available models: ${models.data.map(m => m.id).join(', ')}`);
      }

      // Тест chat completion
      console.log('💬 Testing /chat/completions endpoint...');
      const chatResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiData.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Say "API works" if you can respond.' }],
          max_tokens: 10,
          temperature: 0
        })
      });

      console.log(`   Status: ${chatResponse.status} ${chatResponse.statusText}`);

      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        console.log('   ✅ Chat endpoint works!');
        console.log(`   💬 Response: "${chatData.choices[0]?.message?.content}"`);
        console.log(`   📊 Usage: ${JSON.stringify(chatData.usage)}`);
        console.log(`\n🎉 ${apiData.name} is WORKING! ✅`);
      } else {
        const errorText = await chatResponse.text();
        console.log(`   ❌ Chat failed: ${errorText}`);

        if (chatResponse.status === 402) {
          console.log(`   💰 Issue: Insufficient balance - add credits to DeepSeek account`);
        }
      }
    } else {
      const errorText = await modelsResponse.text();
      console.log(`   ❌ Models failed: ${errorText}`);

      if (modelsResponse.status === 401) {
        console.log(`   🔑 Issue: Invalid API key`);
      }
    }

  } catch (error) {
    console.error(`   ❌ Network error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
}

console.log('\n🏁 API key testing completed!');
console.log('\n📝 Summary:');
console.log('- If you see "API works" response - the key has sufficient balance');
console.log('- If you see "Insufficient balance" - add credits to that account');
console.log('- If you see "Invalid API key" - the key is not working');
