#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Common TypeScript error fixes
const fixes = [
  // Fix nullable string types
  {
    pattern: /Type 'string \| null' is not assignable to type 'string \| undefined'/g,
    fix: (content) => {
      // Replace string | null with string | undefined in DTO responses
      return content.replace(/description\?: string;/g, 'description?: string | null;');
    }
  },
  
  // Fix missing properties in Prisma models
  {
    pattern: /Property '(\w+)' does not exist on type 'PrismaService'/g,
    fix: (content, match) => {
      // These are likely outdated model references
      const modelName = match[1];
      console.log(`Warning: Model ${modelName} not found in Prisma schema`);
      return content;
    }
  },
  
  // Fix optional property access
  {
    pattern: /is possibly 'undefined'/g,
    fix: (content) => {
      // Add optional chaining where needed
      return content.replace(/(\w+)\.(\w+)/g, (match, obj, prop) => {
        if (content.includes(`${obj} is possibly 'undefined'`)) {
          return `${obj}?.${prop}`;
        }
        return match;
      });
    }
  },
  
  // Fix error type issues
  {
    pattern: /'error' is of type 'unknown'/g,
    fix: (content) => {
      // Type guard for error handling
      return content.replace(/catch \(error\) \{/g, 'catch (error) {\n      const errorMessage = error instanceof Error ? error.message : String(error);')
        .replace(/error\.message/g, 'errorMessage');
    }
  },
  
  // Fix missing type imports
  {
    pattern: /Cannot find module '@ez-eco\/shared\/(\w+)'/g,
    fix: (content, match) => {
      const modulePath = match[1];
      console.log(`Fixing import for @ez-eco/shared/${modulePath}`);
      // Update import paths
      return content.replace(/@ez-eco\/shared\/\w+/g, '@ez-eco/shared-contracts');
    }
  }
];

// Process files
async function fixTypeScriptErrors() {
  const files = glob.sync('services/estimate-service/src/**/*.ts', {
    ignore: ['**/node_modules/**', '**/*.spec.ts', '**/*.test.ts']
  });

  let fixedCount = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    let modified = false;

    for (const fix of fixes) {
      const matches = content.match(fix.pattern);
      if (matches) {
        content = fix.fix(content, matches);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(file, content, 'utf-8');
      console.log(`Fixed: ${file}`);
      fixedCount++;
    }
  }

  console.log(`\nTotal files fixed: ${fixedCount}`);
}

fixTypeScriptErrors().catch(console.error);
