import nx from '@nx/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import securityPlugin from 'eslint-plugin-security';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/build',
      '**/coverage',
      '**/.nx',
      '**/node_modules',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      // Документация и Markdown файлы
      '**/*.md',
      '**/*.mdx',
      'docs/**',
      'README*',
      // Генерируемые файлы
      '**/*.d.ts',
      '**/*.tsbuildinfo',
      // Конфигурационные файлы
      '.env*',
      'docker-compose*.yml',
      'Dockerfile*',
      '**/eslint.config.mjs',
      '**/playwright.config.ts',
      '**/jest.config.ts',
      '**/vitest.config.ts',
      '**/tailwind.config.js',
      '**/next.config.js',
      '**/webpack.config.js',
      // Логи и временные файлы
      '**/*.log',
      '**/*.tmp',
      '**/*.temp',
      '.DS_Store',
      // Статические ресурсы
      'assets/static/**',
      'public/**',
      '**/*.min.js',
      '**/*.min.css',
      // Внешние библиотеки
      'vendor/**',
      '**/*.vendor.js',
      // Шаблоны и миграции
      'prisma/migrations/**',
      'templates/**',
      '**/*.template.*',
      // Тестовые файлы отчетов
      'test-reports/**',
      '**/*.json',
      '**/*.xml',
      // E2E тесты (но включаем unit тесты для проверки качества)
      '**/*-e2e/**',
      '**/e2e/**',
      '**/*.e2e.ts',
      '**/*.e2e-spec.ts',
      // Специфичные для Azure и CI/CD
      'azure/**',
      '.github/**',
      '**/*.yml',
      '**/*.yaml',
      // Скрипты развертывания
      'scripts/**',
      '**/*.sh',
      '**/*.ps1',
      '**/*.bat',
      // Мониторинг и метрики
      'monitoring/**',
      'logs/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      import: importPlugin,
      jsdoc: jsdocPlugin,
      security: securityPlugin,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // Сервисы могут зависеть только от shared библиотек и пакетов
            {
              sourceTag: 'service',
              onlyDependOnLibsWithTags: ['shared', 'package'],
            },
            // Пакеты могут зависеть только от других пакетов
            {
              sourceTag: 'package',
              onlyDependOnLibsWithTags: ['package'],
            },
            // Shared библиотеки могут зависеть от shared и пакетов
            {
              sourceTag: 'shared',
              onlyDependOnLibsWithTags: ['shared', 'package'],
            },
            // UI компоненты могут зависеть от shared и пакетов
            {
              sourceTag: 'ui',
              onlyDependOnLibsWithTags: ['shared', 'package', 'ui'],
            },
            // AI компоненты могут зависеть от shared, пакетов и ai
            {
              sourceTag: 'ai',
              onlyDependOnLibsWithTags: ['shared', 'package', 'ai'],
            },
            // Бэкенд сервисы не могут зависеть от фронтенд компонентов
            {
              sourceTag: 'backend',
              bannedExternalImports: [
                'react',
                'react-dom',
                '@angular/*',
                'vue',
              ],
            },
            // Фронтенд не может зависеть от серверных библиотек
            {
              sourceTag: 'frontend',
              bannedExternalImports: ['@nestjs/*', 'express', 'fastify'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.base.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.base.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      // Контроль качества кода и предотвращение дублирования

      // Предотвращение дублирования логики
      'no-duplicate-imports': 'error',
      'no-duplicate-case': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-class-members': 'error',

      // Стандарты именования для предотвращения дублирования сервисов
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'memberLike',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
        {
          selector: 'method',
          format: ['camelCase'],
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'objectLiteralProperty',
          format: null,
        },
      ],

      // Централизованное управление кодом
      'max-classes-per-file': ['error', 1],
      'max-lines-per-function': ['warn', { max: 50, skipComments: true }],
      'max-lines': ['warn', { max: 300, skipComments: true }],
      complexity: ['warn', 10],
      'max-depth': ['error', 4],
      'max-nested-callbacks': ['error', 3],
      'max-params': ['error', 5],

      // Предотвращение создания избыточных файлов
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unreachable': 'error',
      'no-dead-code': 'off',

      // Управление зависимостями
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-relative-parent-imports': 'warn',

      // Контроль качества кода
      'prefer-const': 'error',
      'no-var': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',

      // Архитектурные правила
      'consistent-return': 'error',
      'default-case': 'error',
      'no-fallthrough': 'error',
      'no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1, 2, 100, 1000],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
        },
      ],

      // TypeScript специфичные правила
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      // Предотвращение дублирования кода
      'no-duplicate-imports': 'error',
      'import/no-duplicates': 'error',

      // DDD и модульная архитектура
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],

      // Документирование кода
      // 'jsdoc/require-jsdoc': [
      //   'warn',
      //   {
      //     require: {
      //       FunctionDeclaration: true,
      //       MethodDefinition: true,
      //       ClassDeclaration: true,
      //       ArrowFunctionExpression: false,
      //       FunctionExpression: false,
      //     },
      //   },
      // ],
      'jsdoc/check-param-names': 'off',
      'jsdoc/check-tag-names': 'off',
      'jsdoc/check-types': 'off',

      // Безопасность
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-script-url': 'error',
      'no-void': 'error',

      // Производительность
      'prefer-template': 'error',
      'prefer-spread': 'error',
      'prefer-rest-params': 'error',
      'prefer-arrow-callback': 'error',

      // Конвенции именования файлов и сервисов
      'filenames/match-regex': 'off', // Будет настроено через nx

      // Контроль архитектуры API Gateway
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/services/**/src/**'],
              message:
                'Прямой импорт из internal модулей сервисов запрещен. Используйте API Gateway.',
            },
            {
              group: ['**/packages/**/lib/**'],
              message:
                'Импорт из lib директорий запрещен. Используйте публичные API.',
            },
          ],
        },
      ],
    },
  },

  // Специальные правила для NestJS сервисов
  {
    files: ['**/services/**/*.ts', '**/services/**/*.js'],
    rules: {
      // Предотвращение дублирования сервисов
      'class-methods-use-this': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Именование для NestJS
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        {
          selector: 'method',
          modifiers: ['public'],
          format: ['camelCase'],
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],

      // Архитектурные ограничения для сервисов
      'max-classes-per-file': ['error', 1],
      complexity: ['error', 8],
      'max-lines-per-function': ['error', { max: 30, skipComments: true }],

      // Dependency Injection
      'no-magic-numbers': 'off', // Порты и коды статусов
      '@typescript-eslint/explicit-function-return-type': 'error',
    },
  },

  // Правила для shared библиотек
  {
    files: ['**/packages/**/*.ts', '**/libs/**/*.ts'],
    rules: {
      // Только некритичная логика в shared
      'no-process-exit': 'error',
      'no-process-env': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',

      // Строгие правила для shared кода
      complexity: ['error', 5],
      'max-lines-per-function': ['error', { max: 20, skipComments: true }],
      'max-params': ['error', 3],

      // Предотвращение side effects
      'no-console': 'error',
      'no-alert': 'error',
      'no-debugger': 'error',
    },
  },

  // Правила для API Gateway
  {
    files: ['**/api-gateway/**/*.ts'],
    rules: {
      // Централизованное управление
      'max-lines': ['error', { max: 200, skipComments: true }],
      complexity: ['error', 15],

      // Роутинг и middleware
      '@typescript-eslint/explicit-function-return-type': 'error',
      'consistent-return': 'error',

      // Безопасность Gateway
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
    },
  },

  // Правила для тестов
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/__tests__/**/*.ts'],
    rules: {
      // Более мягкие правила для тестов
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-magic-numbers': 'off',

      // Качество тестов
      'no-duplicate-imports': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Предотвращение дублирования тестов
      'no-duplicate-case': 'error',
      'no-dupe-keys': 'error',
    },
  },

  // Правила для конфигурационных файлов
  {
    files: ['**/*.config.ts', '**/*.config.js', '**/*.config.mjs'],
    rules: {
      // Разрешаем некоторые паттерны в конфигах
      'no-magic-numbers': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'max-lines': 'off',

      // Безопасность конфигов
      'no-process-env': 'off', // Переменные окружения в конфигах
      'no-console': 'warn',
    },
  },

  // Правила для документации
  {
    files: ['**/*.md'],
    rules: {
      // Отключаем JS правила для markdown
    },
  },

  // Дополнительные правила
  {
    files: ['**/*'],
    plugins: {
      import: importPlugin,
    },
    rules: {
      // AI-инструменты и автоматизация
      'no-todo-comments': 'off', // Заменяется на более строгое правило ниже
      'no-warning-comments': [
        'error',
        {
          terms: ['todo', 'fixme', 'hack', 'xxx', 'bug', 'deprecated'],
          location: 'start',
        },
      ],

      // Контроль качества для ИИ анализа
      complexity: ['error', 8], // Снижено для лучшего ИИ анализа
      'max-statements': ['error', 15], // Максимум операторов в функции
      'max-statements-per-line': ['error', { max: 1 }],
      'max-len': [
        'error',
        {
          code: 120,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreComments: false,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],

      // Управление техническим долгом
      'no-process-exit': 'error',
      'no-process-env': 'warn', // Для централизованного управления конфигурацией
      'no-sync': 'error', // Предотвращение блокирующих операций

      // Контроль версий и совместимости
      'import/no-dynamic-require': 'error',
      'import/no-internal-modules': [
        'error',
        {
          forbid: ['@nestjs/*/dist/**', 'react/lib/**', 'lodash/**'],
        },
      ],

      // Централизованное управление логированием
      'no-console': [
        'error',
        {
          allow: ['warn', 'error', 'info', 'time', 'timeEnd', 'timeStamp'],
        },
      ],

      // Предотвращение небезопасных паттернов
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: [
            'acc', // for reduce accumulators
            'accumulator', // for reduce accumulators
            'e', // for e.returnvalue
            'ctx', // for Koa routing
            'context', // for Koa routing
            'req', // for Express requests
            'request', // for Express requests
            'res', // for Express responses
            'response', // for Express responses
            '$scope', // for Angular 1 scopes
            'staticContext', // for ReactRouter context
          ],
        },
      ],

      // Контроль мутаций для функционального программирования
      'no-multi-assign': 'error',
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'no-mixed-operators': 'error',

      // Автоматизация рефакторинга
      'prefer-destructuring': [
        'error',
        {
          VariableDeclarator: {
            array: false,
            object: true,
          },
          AssignmentExpression: {
            array: true,
            object: false,
          },
        },
        {
          enforceForRenamedProperties: false,
        },
      ],

      // Стандартизация API проектирования
      'consistent-this': ['error', 'self'],
      'func-name-matching': 'error',
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'no-invalid-this': 'error',
      'no-loop-func': 'error',

      // Контроль производительности
      'no-extend-native': 'error',
      'no-iterator': 'error',
      'no-proto': 'error',
      'no-prototype-builtins': 'error',

      // ИИ-совместимые комментарии и документация
      'capitalized-comments': [
        'error',
        'always',
        {
          ignorePattern: 'pragma|ignored|prettier-ignore|webpack\\w+:|c8',
          ignoreInlineComments: true,
        },
      ],
      'line-comment-position': ['error', { position: 'above' }],
      'multiline-comment-style': ['error', 'starred-block'],
      'spaced-comment': [
        'error',
        'always',
        {
          line: {
            exceptions: ['-', '+'],
            markers: ['=', '!', '/'],
          },
          block: {
            exceptions: ['-', '+'],
            markers: ['=', '!', ':', '::'],
            balanced: true,
          },
        },
      ],

      // Контроль зависимостей для автоматического анализа
      'import/no-unresolved': [
        'error',
        {
          commonjs: true,
          caseSensitive: true,
          ignore: ['^@/', '^~/', '^#/'],
        },
      ],
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-absolute-path': 'error',
      'import/no-webpack-loader-syntax': 'error',
      'import/no-self-import': 'error',
      'import/no-cycle': ['error', { maxDepth: 10 }],
      'import/no-useless-path-segments': ['error', { commonjs: true }],
      'import/consistent-type-specifier-style': ['error', 'prefer-inline'],

      // Автоматическое управление импортами
      'import/first': 'error',
      'import/exports-last': 'error',
      'import/no-duplicates': ['error', { considerQueryString: true }],
      'import/no-namespace': 'error',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          mjs: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import/newline-after-import': ['error', { count: 1 }],
      'import/prefer-default-export': 'off', // Предпочитаем именованные экспорты
      'import/no-default-export': 'off', // Будет переопределено для конкретных файлов

      // Контроль для CI/CD автоматизации
      'no-process-exit': 'error',
      'no-buffer-constructor': 'error',
      'no-new-require': 'error',
      'no-path-concat': 'error',

      // Метрики для автоматического мониторинга
      'max-classes-per-file': ['error', 1],
      'max-lines-per-function': [
        'error',
        { max: 50, skipComments: true, skipBlankLines: true },
      ],
      'max-statements-per-line': ['error', { max: 1 }],
      'max-params': ['error', 4],
      'max-depth': ['error', 4],
      'max-nested-callbacks': ['error', 3],

      // Контроль совместимости версий
      'no-restricted-globals': [
        'error',
        {
          name: 'isFinite',
          message: 'Use Number.isFinite instead',
        },
        {
          name: 'isNaN',
          message: 'Use Number.isNaN instead',
        },
        {
          name: 'addEventListener',
          message: 'Use modern event handling',
        },
        {
          name: 'blur',
          message: 'Use modern focus management',
        },
        {
          name: 'close',
          message: 'Be explicit about what you are closing',
        },
        {
          name: 'closed',
          message: 'Be explicit about what is closed',
        },
        {
          name: 'confirm',
          message: 'Use modern confirmation dialogs',
        },
        {
          name: 'defaultStatus',
          message: 'Deprecated browser API',
        },
        {
          name: 'defaultstatus',
          message: 'Deprecated browser API',
        },
        {
          name: 'event',
          message: 'Use local parameter instead',
        },
        {
          name: 'external',
          message: 'Be explicit about external dependencies',
        },
        {
          name: 'find',
          message: 'Use Array.prototype.find',
        },
        {
          name: 'focus',
          message: 'Use modern focus management',
        },
        {
          name: 'frameElement',
          message: 'Deprecated browser API',
        },
        {
          name: 'frames',
          message: 'Deprecated browser API',
        },
        {
          name: 'history',
          message: 'Use modern history management',
        },
        {
          name: 'innerHeight',
          message: 'Use modern viewport detection',
        },
        {
          name: 'innerWidth',
          message: 'Use modern viewport detection',
        },
        {
          name: 'length',
          message: 'Be explicit about what length',
        },
        {
          name: 'location',
          message: 'Use modern location management',
        },
        {
          name: 'locationbar',
          message: 'Deprecated browser API',
        },
        {
          name: 'menubar',
          message: 'Deprecated browser API',
        },
        {
          name: 'moveBy',
          message: 'Deprecated browser API',
        },
        {
          name: 'moveTo',
          message: 'Deprecated browser API',
        },
        {
          name: 'name',
          message: 'Be explicit about what name',
        },
        {
          name: 'onblur',
          message: 'Use modern event handling',
        },
        {
          name: 'onerror',
          message: 'Use modern error handling',
        },
        {
          name: 'onfocus',
          message: 'Use modern event handling',
        },
        {
          name: 'onload',
          message: 'Use modern event handling',
        },
        {
          name: 'onresize',
          message: 'Use modern event handling',
        },
        {
          name: 'onunload',
          message: 'Use modern event handling',
        },
        {
          name: 'open',
          message: 'Be explicit about what you are opening',
        },
        {
          name: 'opener',
          message: 'Deprecated browser API',
        },
        {
          name: 'opera',
          message: 'Deprecated browser API',
        },
        {
          name: 'outerHeight',
          message: 'Use modern viewport detection',
        },
        {
          name: 'outerWidth',
          message: 'Use modern viewport detection',
        },
        {
          name: 'pageXOffset',
          message: 'Use modern scroll detection',
        },
        {
          name: 'pageYOffset',
          message: 'Use modern scroll detection',
        },
        {
          name: 'parent',
          message: 'Be explicit about parent relationship',
        },
        {
          name: 'print',
          message: 'Use modern printing APIs',
        },
        {
          name: 'removeEventListener',
          message: 'Use modern event handling',
        },
        {
          name: 'resizeBy',
          message: 'Deprecated browser API',
        },
        {
          name: 'resizeTo',
          message: 'Deprecated browser API',
        },
        {
          name: 'screen',
          message: 'Use modern screen detection',
        },
        {
          name: 'screenLeft',
          message: 'Use modern screen detection',
        },
        {
          name: 'screenTop',
          message: 'Use modern screen detection',
        },
        {
          name: 'screenX',
          message: 'Use modern screen detection',
        },
        {
          name: 'screenY',
          message: 'Use modern screen detection',
        },
        {
          name: 'scroll',
          message: 'Use modern scrolling APIs',
        },
        {
          name: 'scrollbars',
          message: 'Deprecated browser API',
        },
        {
          name: 'scrollBy',
          message: 'Use modern scrolling APIs',
        },
        {
          name: 'scrollTo',
          message: 'Use modern scrolling APIs',
        },
        {
          name: 'scrollX',
          message: 'Use modern scroll detection',
        },
        {
          name: 'scrollY',
          message: 'Use modern scroll detection',
        },
        {
          name: 'self',
          message: 'Be explicit about self reference',
        },
        {
          name: 'status',
          message: 'Deprecated browser API',
        },
        {
          name: 'statusbar',
          message: 'Deprecated browser API',
        },
        {
          name: 'stop',
          message: 'Be explicit about what you are stopping',
        },
        {
          name: 'toolbar',
          message: 'Deprecated browser API',
        },
        {
          name: 'top',
          message: 'Be explicit about top reference',
        },
      ],

      // Автоматизация форматирования для CI/CD
      'array-bracket-newline': ['error', 'consistent'],
      'array-element-newline': ['error', 'consistent'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'always-multiline',
        },
      ],
      'comma-spacing': ['error', { before: false, after: true }],
      'comma-style': ['error', 'last'],
      'computed-property-spacing': ['error', 'never'],
      'eol-last': ['error', 'always'],
      'function-call-argument-newline': ['error', 'consistent'],
      'function-paren-newline': ['error', 'consistent'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'jsx-quotes': ['error', 'prefer-double'],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'linebreak-style': ['error', 'unix'],
      'lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: false },
      ],
      'newline-per-chained-call': ['error', { ignoreChainWithDepth: 4 }],
      'no-multiple-empty-lines': ['error', { max: 2, maxBOF: 0, maxEOF: 1 }],
      'no-trailing-spaces': 'error',
      'no-whitespace-before-property': 'error',
      'object-curly-newline': ['error', { consistent: true }],
      'object-curly-spacing': ['error', 'always'],
      'object-property-newline': [
        'error',
        { allowAllPropertiesOnSameLine: true },
      ],
      'operator-linebreak': ['error', 'before'],
      'padded-blocks': ['error', 'never'],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['case', 'default'], next: '*' },
        { blankLine: 'always', prev: '*', next: ['case', 'default'] },
      ],
      quotes: [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
      semi: ['error', 'always'],
      'semi-spacing': ['error', { before: false, after: true }],
      'semi-style': ['error', 'last'],
      'space-before-blocks': 'error',
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'space-unary-ops': ['error', { words: true, nonwords: false }],
      'switch-colon-spacing': ['error', { after: true, before: false }],
      'template-curly-spacing': ['error', 'never'],
      'unicode-bom': ['error', 'never'],
      'wrap-regex': 'error',
    },
  },

  // Специальные правила для ИИ-инструментов анализа
  {
    files: ['**/*.ai.ts', '**/*-ai.ts', '**/ai/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.base.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      jsdoc: jsdocPlugin,
    },
    rules: {
      // Более строгие правила для ИИ-кода
      complexity: ['error', 5],
      'max-lines-per-function': ['error', { max: 30, skipComments: true }],
      'max-statements': ['error', 10],
      'no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: false,
          ignoreDefaultValues: false,
          enforceConst: true,
        },
      ],
      // Обязательная документация для ИИ-функций
      // 'jsdoc/require-jsdoc': [
      //   'error',
      //   {
      //     require: {
      //       FunctionDeclaration: true,
      //       MethodDefinition: true,
      //       ClassDeclaration: true,
      //       ArrowFunctionExpression: true,
      //       FunctionExpression: true,
      //     },
      //   },
      // ],
      // Строгая типизация для ИИ
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'error',
    },
  },

  // Правила для автоматически генерируемого кода
  {
    files: [
      '**/*.generated.ts',
      '**/*-generated.ts',
      '**/generated/**/*.ts',
      '**/__generated__/**/*.ts',
      '**/types/generated/**/*.ts',
    ],
    rules: {
      // Более мягкие правила для сгенерированного кода
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      complexity: 'off',
      '@typescript-eslint/naming-convention': 'off',
      'prefer-const': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      // Но все еще проверяем на безопасность
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'security/detect-eval-with-expression': 'error',
    },
  },

  // Правила для файлов миграции и схем БД
  {
    files: [
      '**/migrations/**/*.ts',
      '**/prisma/**/*.ts',
      '**/*.migration.ts',
      '**/*.schema.ts',
      '**/database/**/*.ts',
    ],
    rules: {
      // Специфичные правила для БД кода
      'no-magic-numbers': 'off', // Номера версий миграций
      '@typescript-eslint/explicit-function-return-type': 'off',
      'max-lines': 'off', // Миграции могут быть длинными
      'no-console': 'off', // Логирование миграций
      'import/no-default-export': 'off', // Prisma использует default export
      // Но строго контролируем безопасность
      'no-eval': 'error',
      'no-process-exit': 'error',
      'security/detect-non-literal-fs-filename': 'error',
    },
  },

  // Правила для Docker и инфраструктурных файлов
  {
    files: [
      '**/docker/**/*.ts',
      '**/infrastructure/**/*.ts',
      '**/*.docker.ts',
      '**/*.k8s.ts',
      '**/deployment/**/*.ts',
    ],
    rules: {
      'no-process-env': 'off', // Переменные окружения в инфраструктуре
      'no-console': ['warn'], // Логирование деплоя
      'no-magic-numbers': 'off', // Порты и таймауты
      '@typescript-eslint/explicit-function-return-type': 'off',
      'import/no-nodejs-modules': 'off', // fs, path и др.
      'security/detect-child-process': 'warn', // Может быть необходимо
    },
  },

  // Правила для файлов мониторинга и метрик
  {
    files: [
      '**/monitoring/**/*.ts',
      '**/metrics/**/*.ts',
      '**/*.metrics.ts',
      '**/*.monitor.ts',
      '**/observability/**/*.ts',
    ],
    rules: {
      'no-console': 'off', // Метрики могут логировать
      'no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1, 100, 200, 300, 400, 500, 1000, 3000, 5000],
          ignoreArrayIndexes: true,
        },
      ],
      'max-lines-per-function': ['warn', { max: 100 }], // Сложная логика мониторинга
    },
  },

  // Правила для Webpack и сборочных файлов
  {
    files: [
      '**/*.config.ts',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/webpack.*.ts',
      '**/vite.*.ts',
      '**/rollup.*.ts',
      '**/build/**/*.ts',
    ],
    rules: {
      'no-magic-numbers': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'max-lines': 'off',
      'import/no-nodejs-modules': 'off',
      'unicorn/prefer-module': 'off',
      'functional/no-mutation': 'off',
      'no-process-env': 'off',
      'import/no-default-export': 'off', // Конфиги часто используют default export
    },
  },

  // Правила для E2E тестов
  {
    files: [
      '**/*.e2e.ts',
      '**/*.e2e-spec.ts',
      '**/e2e/**/*.ts',
      '**/playwright/**/*.ts',
      '**/cypress/**/*.ts',
    ],
    plugins: {
      jsdoc: jsdocPlugin,
    },
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'max-statements': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-magic-numbers': 'off',
      'jsdoc/require-jsdoc': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'functional/no-let': 'off',
      'functional/no-mutation': 'off',
      'prefer-arrow/prefer-arrow-functions': 'off',
      'no-console': 'off', // Отладка E2E тестов
      // Специфичные для E2E
      'no-await-in-loop': 'off', // Последовательные действия в E2E
      'no-restricted-syntax': 'off',
    },
  },

  // Правила для интеграционных тестов
  {
    files: ['**/*.integration.ts', '**/*.int.ts', '**/integration/**/*.ts'],
    plugins: {
      jsdoc: jsdocPlugin,
    },
    rules: {
      'max-lines-per-function': ['warn', { max: 100 }],
      'max-lines': ['warn', { max: 500 }],
      'no-magic-numbers': 'off',
      'jsdoc/require-jsdoc': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'functional/no-let': 'off',
      'functional/no-mutation': 'off',
      'no-console': 'warn', // Логирование интеграционных тестов
    },
  },

  // Правила для performance тестов
  {
    files: [
      '**/*.perf.ts',
      '**/*.performance.ts',
      '**/performance/**/*.ts',
      '**/benchmark/**/*.ts',
    ],
    rules: {
      'no-console': 'off', // Результаты бенчмарков
      'no-magic-numbers': 'off', // Метрики производительности
      'max-lines-per-function': 'off',
      complexity: 'off',
      'prefer-const': 'off', // Мутации для измерений
      'functional/no-let': 'off',
      'functional/no-mutation': 'off',
    },
  },

  // Правила для файлов локализации
  {
    files: [
      '**/locales/**/*.ts',
      '**/i18n/**/*.ts',
      '**/*.i18n.ts',
      '**/*.locale.ts',
    ],
    rules: {
      'max-lines': 'off', // Файлы переводов могут быть большими
      'sonarjs/no-duplicate-string': 'off', // Повторы в переводах нормальны
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'objectLiteralProperty',
          format: ['camelCase', 'snake_case', 'UPPER_CASE'],
        },
      ],
      'quote-props': ['error', 'consistent'], // Ключи локализации
    },
  },

  // Правила для API клиентов и SDK
  {
    files: [
      '**/api/**/*.ts',
      '**/sdk/**/*.ts',
      '**/client/**/*.ts',
      '**/*.api.ts',
      '**/*.client.ts',
    ],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'error',
      'max-params': ['error', 3], // API методы должны быть простыми
      complexity: ['error', 8],
      // Строгий контроль ошибок в API
      'require-await': 'error',
      'no-return-await': 'error',
      'prefer-promise-reject-errors': 'error',
    },
  },
];
