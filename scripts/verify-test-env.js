#!/usr/bin/env node

/**
 * Verification script for test environment
 * Checks that all services are running and accessible
 */

const { Client } = require('pg');
const redis = require('redis');
const Minio = require('minio');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

// Helper function to print colored output
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test PostgreSQL connection
async function testPostgreSQL() {
  print('\n🔍 Testing PostgreSQL connection...', 'yellow');
  
  const client = new Client({
    host: 'localhost',
    port: 5433,
    database: 'testdb',
    user: 'testuser',
    password: 'testpass',
  });

  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    print(`✅ PostgreSQL is working! Server time: ${result.rows[0].now}`, 'green');
    
    // Check if test data exists
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    print(`   Found ${userCount.rows[0].count} test users`, 'green');
    
    await client.end();
    return true;
  } catch (error) {
    print(`❌ PostgreSQL connection failed: ${error.message}`, 'red');
    return false;
  }
}

// Test Redis connection
async function testRedis() {
  print('\n🔍 Testing Redis connection...', 'yellow');
  
  const client = redis.createClient({
    socket: {
      host: 'localhost',
      port: 6380,
    },
    password: 'testredispass',
  });

  try {
    await client.connect();
    await client.set('test:key', 'test-value');
    const value = await client.get('test:key');
    
    if (value === 'test-value') {
      print('✅ Redis is working! Successfully set and retrieved test value', 'green');
      await client.del('test:key');
    }
    
    await client.quit();
    return true;
  } catch (error) {
    print(`❌ Redis connection failed: ${error.message}`, 'red');
    return false;
  }
}

// Test MinIO connection
async function testMinIO() {
  print('\n🔍 Testing MinIO connection...', 'yellow');
  
  const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9001,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin123',
  });

  try {
    // Check if bucket exists
    const bucketExists = await minioClient.bucketExists('test-files');
    
    if (bucketExists) {
      print('✅ MinIO is working! Bucket "test-files" exists', 'green');
      
      // Try to list objects
      const stream = minioClient.listObjects('test-files', '', true);
      let objectCount = 0;
      
      stream.on('data', () => objectCount++);
      stream.on('end', () => {
        print(`   Found ${objectCount} objects in bucket`, 'green');
      });
      
      return true;
    } else {
      print('⚠️  MinIO is running but bucket "test-files" not found', 'yellow');
      return true;
    }
  } catch (error) {
    print(`❌ MinIO connection failed: ${error.message}`, 'red');
    return false;
  }
}

// Main verification function
async function verifyTestEnvironment() {
  print('🚀 Verifying test environment setup...', 'yellow');
  print('=' .repeat(50));
  
  const results = {
    postgresql: await testPostgreSQL(),
    redis: await testRedis(),
    minio: await testMinIO(),
  };
  
  print('\n' + '=' .repeat(50));
  print('📊 Verification Summary:', 'yellow');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    print('\n✅ All services are working correctly!', 'green');
    print('🎉 Test environment is ready for use!', 'green');
    process.exit(0);
  } else {
    print('\n❌ Some services are not working properly', 'red');
    print('Please check the logs with: ./scripts/test-env.sh logs', 'yellow');
    process.exit(1);
  }
}

// Run verification
verifyTestEnvironment().catch(error => {
  print(`\n❌ Verification failed: ${error.message}`, 'red');
  process.exit(1);
});
