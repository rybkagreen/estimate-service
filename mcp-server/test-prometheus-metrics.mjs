#!/usr/bin/env node

/**
 * Test script for Prometheus metrics
 */

import fetch from 'node-fetch';

const METRICS_PORT = process.env.METRICS_PORT || 9090;

async function testMetricsEndpoint() {
  console.log(`🧪 Testing Prometheus metrics endpoint on port ${METRICS_PORT}...`);
  
  try {
    // Test health endpoint
    console.log('\n📍 Testing health endpoint...');
    const healthResponse = await fetch(`http://localhost:${METRICS_PORT}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData);
    } else {
      console.error('❌ Health check failed:', healthResponse.status);
    }
    
    // Test metrics endpoint
    console.log('\n📊 Testing metrics endpoint...');
    const metricsResponse = await fetch(`http://localhost:${METRICS_PORT}/metrics`);
    if (metricsResponse.ok) {
      const metricsText = await metricsResponse.text();
      console.log('✅ Metrics endpoint is working!');
      console.log('\n📈 Available metrics:');
      
      // Parse and display metric names
      const metricNames = new Set();
      const lines = metricsText.split('\n');
      for (const line of lines) {
        if (line.startsWith('# TYPE')) {
          const parts = line.split(' ');
          if (parts.length >= 3) {
            metricNames.add(parts[2]);
          }
        }
      }
      
      for (const name of metricNames) {
        console.log(`  - ${name}`);
      }
      
      // Show a sample of the metrics
      console.log('\n📄 Sample metrics output (first 20 lines):');
      console.log(lines.slice(0, 20).join('\n'));
      
    } else {
      console.error('❌ Metrics endpoint failed:', metricsResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing metrics:', error.message);
    console.log('\n💡 Make sure the MCP server is running with: npm run start:simple');
  }
}

// Run the test
testMetricsEndpoint();
