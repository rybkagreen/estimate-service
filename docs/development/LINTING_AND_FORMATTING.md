# Конфигурация линтинга и форматирования

## ESLint правила

Проект использует расширенную конфигурацию ESLint для обеспечения качества кода.

### Основные правила

#### 1. TypeScript
- `@typescript-eslint/explicit-function-return-type`: Обязательное указание типов возвращаемых значений
- `@typescript-eslint/no-explicit-any`: Запрет использования `any`
- `@typescript-eslint/strict-boolean-expressions`: Строгие булевы выражения
- `@typescript-eslint/no-floating-promises`: Обработка всех промисов

#### 2. Именование
- Переменные и функции: `camelCase`
- Классы и интерфейсы: `PascalCase`
- Константы: `UPPER_CASE`
- Приватные свойства: `_camelCase`
- Файлы: `kebab-case`

#### 3. Безопасность
- Запрет использования `eval()`
- Контроль импортов между модулями
- Валидация пользовательских данных

### Настройка IDE

#### VS Code (.vscode/settings.json)
```json
{
  "eslint.workingDirectories": ["./"],
  "eslint.format.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true
}
```

## Prettier конфигурация

### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": true,
  "bracketSameLine": false
}
```

### .prettierignore
```
# Build directories
dist/
build/
coverage/
.nx/

# Node modules
node_modules/

# Logs
*.log

# Generated files
*.d.ts
*.tsbuildinfo

# Configuration files
*.config.js
*.config.ts

# Documentation
*.md
docs/

# Static assets
public/
assets/
```

## Husky и lint-staged

### package.json scripts
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "pre-commit": "lint-staged",
    "prepare": "husky install"
  }
}
```

### .husky/pre-commit
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run pre-commit
```

### lint-staged.config.js
```javascript
module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    'git add'
  ],
  '*.{json,md,html,css,scss}': [
    'prettier --write',
    'git add'
  ]
};
```

## Commitizen и Conventional Commits

### .commitizenrc.json
```json
{
  "path": "cz-conventional-changelog",
  "types": {
    "feat": {
      "description": "Новая функциональность",
      "title": "Features"
    },
    "fix": {
      "description": "Исправление ошибки",
      "title": "Bug Fixes"
    },
    "docs": {
      "description": "Изменения в документации",
      "title": "Documentation"
    },
    "style": {
      "description": "Изменения в форматировании кода",
      "title": "Styles"
    },
    "refactor": {
      "description": "Рефакторинг кода",
      "title": "Code Refactoring"
    },
    "perf": {
      "description": "Улучшение производительности",
      "title": "Performance Improvements"
    },
    "test": {
      "description": "Добавление или изменение тестов",
      "title": "Tests"
    },
    "build": {
      "description": "Изменения в сборке или зависимостях",
      "title": "Builds"
    },
    "ci": {
      "description": "Изменения в CI/CD",
      "title": "Continuous Integrations"
    },
    "chore": {
      "description": "Другие изменения",
      "title": "Chores"
    }
  }
}
```

## SonarQube конфигурация

### sonar-project.properties
```properties
sonar.projectKey=estimate-service
sonar.projectName=Estimate Service
sonar.projectVersion=1.0.0

# Источники
sonar.sources=apps,services,libs
sonar.tests=apps,services,libs
sonar.test.inclusions=**/*.spec.ts,**/*.test.ts,**/*.e2e.spec.ts

# Исключения
sonar.exclusions=**/node_modules/**,**/dist/**,**/build/**,**/coverage/**,**/*.d.ts

# Покрытие тестами
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.testExecutionReportPaths=test-results/sonar-report.xml

# Качество кода
sonar.qualitygate.wait=true
```

## Настройки проекта

### .editorconfig
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

### tsconfig.json правила
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitOverride": true
  }
}
```

## Проверка качества в CI/CD

### GitHub Actions
```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:coverage
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

## Правила для коммитов

### Conventional Commits формат
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Примеры коммитов
```
feat(estimate): add auto-calculation for FSBTS items
fix(ai): resolve memory leak in chat service
docs(api): update estimate endpoints documentation
test(estimate): add unit tests for calculation service
refactor(fsbts): optimize search algorithm
perf(db): add indexes for faster queries
style(ui): format estimate editor components
ci: update node version in github actions
```

### Правила для Pull Request
1. Название должно следовать Conventional Commits
2. Обязательное описание изменений
3. Прохождение всех проверок CI/CD
4. Code review от минимум одного разработчика
5. Покрытие тестами новой функциональности
6. Обновление документации при необходимости

### Запрещенные практики
- Коммиты прямо в main/master ветку
- Коммиты без описания
- Большие коммиты (>500 строк изменений)
- Незакрытые TODO комментарии в продакшн коде
- Использование console.log в продакшн коде
- Отключение ESLint правил без обоснования
