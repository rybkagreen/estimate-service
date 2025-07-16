// Check if the file exists
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Validating MCP Server Local Simple...\n');

const serverPath = join(process.cwd(), 'dist-simple', 'index-local-simple.js');

console.log(`📍 Checking path: ${serverPath}`);

if (existsSync(serverPath)) {
  console.log('✅ Server file exists');

  // Try to import and check the module
  try {
    console.log('\n📦 Testing module import...');
    const fileUrl = new URL(`file:///${serverPath.replace(/\\/g, '/')}`);
    const module = await import(fileUrl.href);

    console.log('✅ Module imported successfully');
    console.log('📋 Module exports:', Object.keys(module));
  } catch (error) {
    console.error('❌ Failed to import module:', error.message);
  }
} else {
  console.error('❌ Server file not found!');
}

console.log('\n✨ Validation complete');
