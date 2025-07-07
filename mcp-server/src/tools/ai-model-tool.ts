/**
 * AI Model Tool - Demonstrates integration with ModelManagerService
 * This tool shows how to use the dynamic model selection in MCP server tools
 */

import { z } from 'zod';
import { ToolDefinition } from '@modelcontextprotocol/sdk/types.js';
import { modelManager } from '../services/model-manager.service.js';
import { logger } from '../utils/logger.js';

// Schema for the AI model tool
const aiModelSchema = z.object({
  prompt: z.string().describe('The prompt to send to the AI model'),
  preferredModel: z.enum(['deepseek-r1', 'claude-3.5-sonnet']).optional()
    .describe('Optional: Force a specific model instead of automatic selection'),
  maxTokens: z.number().optional().default(1000)
    .describe('Maximum tokens for the response'),
  temperature: z.number().min(0).max(1).optional().default(0.7)
    .describe('Temperature for response generation'),
  includeMetadata: z.boolean().optional().default(false)
    .describe('Include model selection metadata in response')
});

// Tool definition
export const aiModelTool: ToolDefinition = {
  name: 'ai_model_query',
  description: 'Query AI models with automatic selection between DeepSeek-R1 and Claude 3.5 Sonnet based on prompt complexity',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'The prompt to send to the AI model'
      },
      preferredModel: {
        type: 'string',
        enum: ['deepseek-r1', 'claude-3.5-sonnet'],
        description: 'Optional: Force a specific model'
      },
      maxTokens: {
        type: 'number',
        description: 'Maximum tokens for the response',
        default: 1000
      },
      temperature: {
        type: 'number',
        description: 'Temperature for response generation',
        minimum: 0,
        maximum: 1,
        default: 0.7
      },
      includeMetadata: {
        type: 'boolean',
        description: 'Include model selection metadata',
        default: false
      }
    },
    required: ['prompt']
  }
};

// Tool handler
export async function handleAiModelQuery(input: unknown) {
  try {
    // Validate input
    const params = aiModelSchema.parse(input);
    
    logger.info('🤖 Processing AI model query', {
      promptLength: params.prompt.length,
      preferredModel: params.preferredModel,
      maxTokens: params.maxTokens
    });

    // Process request through ModelManager
    const response = await modelManager.processRequest({
      prompt: params.prompt,
      preferredModel: params.preferredModel,
      maxTokens: params.maxTokens,
      temperature: params.temperature
    });

    // Format response based on metadata preference
    if (params.includeMetadata) {
      return {
        content: response.content,
        model: response.model,
        tokensUsed: response.tokensUsed,
        responseTime: response.responseTime,
        selectionReason: response.selectionReason,
        metadata: response.metadata
      };
    }

    // Simple response without metadata
    return {
      content: response.content,
      model: response.model,
      tokensUsed: response.tokensUsed
    };

  } catch (error) {
    logger.error('❌ Error in AI model query:', error);
    throw new Error(`AI model query failed: ${error.message}`);
  }
}

// Example usage scenarios
export const aiModelExamples = [
  {
    name: 'Simple Query',
    input: {
      prompt: 'What is TypeScript?',
      maxTokens: 200
    },
    expectedModel: 'deepseek-r1',
    description: 'Simple definitional query - DeepSeek handles efficiently'
  },
  {
    name: 'Complex Architecture',
    input: {
      prompt: 'Design a comprehensive microservices architecture for an e-commerce platform with high availability requirements',
      maxTokens: 3000,
      includeMetadata: true
    },
    expectedModel: 'claude-3.5-sonnet',
    description: 'Complex architectural design - Claude provides deep analysis'
  },
  {
    name: 'Code Analysis',
    input: {
      prompt: `Review this code for bugs:
\`\`\`typescript
function calculateTotal(items) {
  let total = 0;
  items.forEach(item => {
    total += item.price * item.quantity;
  });
  return total.toFixed(2);
}
\`\`\``,
      maxTokens: 500
    },
    expectedModel: 'deepseek-r1',
    description: 'Code review task - DeepSeek specializes in code analysis'
  },
  {
    name: 'Force Model Selection',
    input: {
      prompt: 'Explain React hooks',
      preferredModel: 'claude-3.5-sonnet',
      maxTokens: 1000
    },
    expectedModel: 'claude-3.5-sonnet',
    description: 'User preference overrides automatic selection'
  }
];

// Helper function for testing model selection
export async function testModelSelection() {
  console.log('🧪 Testing AI Model Selection\n');
  
  for (const example of aiModelExamples) {
    console.log(`📋 ${example.name}`);
    console.log(`📝 ${example.description}`);
    console.log(`🎯 Expected: ${example.expectedModel}`);
    
    try {
      const result = await handleAiModelQuery(example.input);
      console.log(`✅ Actual: ${result.model}`);
      console.log(`📊 Tokens: ${result.tokensUsed}`);
      
      if (example.input.includeMetadata && result.metadata) {
        console.log(`💡 Selection reason: ${result.metadata.selection.reason}`);
        console.log(`🎲 Confidence: ${(result.metadata.selection.confidence * 100).toFixed(0)}%`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('-'.repeat(60));
  }
}

// Export for use in MCP server
export default {
  tool: aiModelTool,
  handler: handleAiModelQuery,
  examples: aiModelExamples
};
