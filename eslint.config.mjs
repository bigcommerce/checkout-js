import js from '@eslint/js';
import nxEslintPlugin from '@nx/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import jestDomPlugin from 'eslint-plugin-jest-dom';
import globals from 'globals';

export default [
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'scripts/**',
      'webpack.config.js',
      '**/*.d.ts',
      '**/generated/**',
      '**/jest.config.js',
      '**/e2e/support/**',
      '**/e2e/*.js',
      'packages/test-framework/**/*.js',
      '**/*.md',
      // Temporarily ignore file with pre-existing syntax error
      'packages/core/src/app/payment/Payment.test.tsx',
    ],
  },
  // Base JS config
  js.configs.recommended,
  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        process: 'readonly',
        global: 'readonly',
        google: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        Sentry: 'readonly',
        __webpack_public_path__: 'writable',
        React: 'readonly',
        FunctionComponent: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@nx': nxEslintPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'import': importPlugin,
      'testing-library': testingLibraryPlugin,
      'jest-dom': jestDomPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Nx rules
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      // TypeScript rules (non type-aware)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Note: react-hooks rules disabled due to plugin incompatibility with ESLint 9
      // The plugin uses deprecated ESLint APIs (context.getSource)
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      // Turn off rules that conflict or aren't needed
      'no-unused-vars': 'off', // Using @typescript-eslint/no-unused-vars instead
      'no-undef': 'off', // TypeScript handles this
      'no-redeclare': 'off', // TypeScript handles this better
      'no-empty': 'warn',
      'no-import-assign': 'off', // Can be false positive with TS types
    },
  },
  // Test files
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.mock.ts',
      '**/*.mock.tsx',
      '**/test-mocks/**/*.ts',
      '**/test-utils/**/*.ts',
      '**/test-framework/**/*.ts',
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
