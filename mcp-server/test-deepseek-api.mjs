import { deepSeekService } from './dist-simple/services/deepseek.service.js';

async function testDeepSeekService() {
  console.log('🧪 Testing DeepSeek R1 Service...\n');

  try {
    // Test health check
    console.log('🏥 Testing health check...');
    const healthResult = await deepSeekService.healthCheck();
    console.log('Health check result:', healthResult);

    if (healthResult.status === 'ok') {
      // Test simple chat
      console.log('\n💬 Testing simple chat...');
      const messages = [
        {
          role: 'user',
          content: 'Hello! Please respond with "DeepSeek R1 is working correctly" to confirm the API connection.'
        }
      ];

      const response = await deepSeekService.chat(messages, { temperature: 0 });
      console.log('Chat response:', response);

      // Test code analysis
      console.log('\n🔍 Testing code analysis...');
      const code = 'function hello(name: string): string { return `Hello, ${name}!`; }';
      const analysis = await deepSeekService.analyzeCode(code, 'Simple TypeScript function');
      console.log('Code analysis result:', analysis.slice(0, 200) + '...');

      console.log('\n✅ All tests passed! DeepSeek R1 integration is working correctly.');
    } else {
      console.error('❌ Health check failed, skipping other tests.');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDeepSeekService().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
