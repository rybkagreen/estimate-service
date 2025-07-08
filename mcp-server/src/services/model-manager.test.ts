/**
 * Test examples for ModelManagerService
 * Demonstrates how the service dynamically selects between DeepSeek-R1 and Claude 3.5 Sonnet
 */

import { ModelManagerService } from './model-manager.service.js';

// Test cases that demonstrate model selection logic
const testCases = [
  {
    name: "Simple Definition Query",
    request: {
      prompt: "What is TypeScript?",
      maxTokens: 150
    },
    expectedModel: "deepseek-r1",
    reason: "Simple definitional query - DeepSeek is fast and efficient"
  },
  {
    name: "Complex Architecture Design",
    request: {
      prompt: "Design a comprehensive microservices architecture for a real-time trading platform with high-frequency transactions, including detailed analysis of scaling strategies, performance optimization, and fault tolerance mechanisms",
      maxTokens: 3000
    },
    expectedModel: "claude-3.5-sonnet",
    reason: "Complex architectural design requiring deep reasoning"
  },
  {
    name: "Code Analysis Task",
    request: {
      prompt: `Analyze this TypeScript function and identify potential bugs:
\`\`\`typescript
async function processUserData(users: any[]) {
  const results = [];
  for (let user of users) {
    const processed = await fetchUserDetails(user.id);
    results.push(processed);
  }
  return results.filter(r => r.active = true);
}
\`\`\``,
      maxTokens: 500
    },
    expectedModel: "deepseek-r1",
    reason: "Code analysis task - DeepSeek specializes in code understanding"
  },
  {
    name: "Creative Strategy Development",
    request: {
      prompt: "Propose innovative strategies for improving developer experience in a large-scale monorepo, considering unique approaches to code organization, tooling, and team collaboration",
      maxTokens: 2000
    },
    expectedModel: "claude-3.5-sonnet",
    reason: "Creative strategic thinking required"
  },
  {
    name: "Simple List Request",
    request: {
      prompt: "List 5 popular JavaScript frameworks",
      maxTokens: 200
    },
    expectedModel: "deepseek-r1",
    reason: "Simple enumeration task - quick response needed"
  },
  {
    name: "Performance Analysis",
    request: {
      prompt: "Analyze the performance implications of using React Context vs Redux for state management in a large-scale application, including detailed benchmarks and architectural trade-offs",
      maxTokens: 2500
    },
    expectedModel: "claude-3.5-sonnet",
    reason: "Deep performance analysis with trade-offs"
  },
  {
    name: "Debug Error Message",
    request: {
      prompt: "Debug this error: TypeError: Cannot read property 'map' of undefined at UserList.render",
      maxTokens: 300
    },
    expectedModel: "deepseek-r1",
    reason: "Quick debugging task - DeepSeek handles errors efficiently"
  },
  {
    name: "Best Practices Review",
    request: {
      prompt: "Review and suggest best practices for implementing authentication and authorization in a microservices architecture, considering security standards, compliance requirements, and scalability",
      maxTokens: 3000
    },
    expectedModel: "claude-3.5-sonnet",
    reason: "Best practices and standards review - requires comprehensive analysis"
  },
  {
    name: "Function Documentation",
    request: {
      prompt: "Generate JSDoc documentation for a function that calculates compound interest",
      maxTokens: 400
    },
    expectedModel: "deepseek-r1",
    reason: "Code documentation task - DeepSeek handles well"
  },
  {
    name: "System Design Trade-offs",
    request: {
      prompt: "Evaluate the pros and cons of using GraphQL vs REST API for a multi-tenant SaaS platform, considering factors like caching, real-time updates, and developer experience",
      maxTokens: 2000
    },
    expectedModel: "claude-3.5-sonnet",
    reason: "Complex comparison requiring reasoning about trade-offs"
  }
];

// Example usage function
async function demonstrateModelSelection() {
  const modelManager = new ModelManagerService();
  
  console.log("🧪 Model Selection Test Cases\n");
  console.log("=" .repeat(80));
  
  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`📝 Prompt: "${testCase.request.prompt.substring(0, 100)}..."`);
    
    // Simulate model selection (without actually calling the AI)
    const criteria = modelManager['analyzeCriteria'](testCase.request);
    const selection = await modelManager['selectModel'](testCase.request);
    
    console.log(`🤖 Selected Model: ${selection.selectedModel}`);
    console.log(`📊 Confidence: ${(selection.confidence * 100).toFixed(0)}%`);
    console.log(`💡 Reason: ${selection.reason}`);
    console.log(`📈 Complexity: ${criteria.complexity}`);
    console.log(`🔍 Analysis:`, {
      hasCode: criteria.hasCodeAnalysis,
      requiresCreativity: criteria.requiresCreativity,
      requiresReasoning: criteria.requiresReasoning,
      estimatedTokens: criteria.estimatedTokens
    });
    console.log(`✅ Expected: ${testCase.expectedModel} - ${testCase.reason}`);
    console.log("-".repeat(80));
  }
}

// Model selection rules summary
function printModelSelectionRules() {
  console.log("\n📚 Model Selection Rules Summary");
  console.log("=" .repeat(80));
  
  console.log("\n🚀 DeepSeek-R1 is preferred for:");
  console.log("  • Simple queries (definitions, lists, basic explanations)");
  console.log("  • Code analysis and debugging tasks");
  console.log("  • Quick responses (< 100 chars, simple complexity)");
  console.log("  • Technical documentation generation");
  console.log("  • Error debugging and troubleshooting");
  
  console.log("\n🧠 Claude 3.5 Sonnet is preferred for:");
  console.log("  • Complex architectural designs");
  console.log("  • Strategic planning and creative solutions");
  console.log("  • Deep reasoning and analysis");
  console.log("  • Best practices and standards reviews");
  console.log("  • Trade-off evaluations and comparisons");
  console.log("  • Large responses (> 2000 estimated tokens)");
  
  console.log("\n⚡ Selection Factors:");
  console.log("  • Prompt length and complexity keywords");
  console.log("  • Presence of code blocks");
  console.log("  • Requirements for creativity or reasoning");
  console.log("  • Estimated response size");
  console.log("  • User preferences (if specified)");
  
  console.log("\n🔄 Fallback Strategy:");
  console.log("  • If Claude is unavailable, DeepSeek handles all requests");
  console.log("  • If primary model fails, automatic fallback occurs");
  console.log("  • All failures are logged with detailed error information");
}

// Run demonstration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateModelSelection().then(() => {
    printModelSelectionRules();
  }).catch(console.error);
}

export { testCases, demonstrateModelSelection, printModelSelectionRules };
