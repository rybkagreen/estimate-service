const axios = require('axios');

async function testDeepSeekAPI() {
  console.log('🧪 Testing DeepSeek API with proper model names...\n');

  const apiKey = 'sk-aeaf60f610ee429892a113b1f4e20960';
  const baseUrl = 'https://api.deepseek.com/v1';

  // Test with deepseek-chat model
  console.log('🔍 Testing deepseek-chat model...');
  try {
    const chatResponse = await axios.post(`${baseUrl}/chat/completions`, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: 'Hello! Please respond with "DeepSeek Chat API is working" to confirm connectivity.'
        }
      ],
      temperature: 0.1,
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ deepseek-chat response:', chatResponse.data.choices[0].message.content);
  } catch (error) {
    console.error('❌ deepseek-chat error:', error.response?.data || error.message);
  }

  // Test with deepseek-reasoner model (DeepSeek-R1)
  console.log('\n🧠 Testing deepseek-reasoner model (DeepSeek-R1)...');
  try {
    const reasonerResponse = await axios.post(`${baseUrl}/chat/completions`, {
      model: 'deepseek-reasoner',
      messages: [
        {
          role: 'user',
          content: 'Hello! Please respond with "DeepSeek Reasoner (R1) API is working" to confirm connectivity.'
        }
      ],
      temperature: 0.1,
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ deepseek-reasoner response:', reasonerResponse.data.choices[0].message.content);
  } catch (error) {
    console.error('❌ deepseek-reasoner error:', error.response?.data || error.message);
  }

  console.log('\n🎉 API tests completed!');
}

testDeepSeekAPI().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
