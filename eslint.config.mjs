import nxEslintPlugin from '@nx/eslint-plugin';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';

// Import the shared config (returns a Promise that resolves to config array)
import sharedConfigPromise from '@bigcommerce/eslint-config';

// Resolve the async shared config and export
const sharedConfig = await sharedConfigPromise;

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
    ],
  },
  // Spread the shared config from @bigcommerce/eslint-config
  ...sharedConfig,
  // Add Nx-specific configuration and monorepo settings for TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@nx': nxEslintPlugin,
    },
    languageOptions: {
      parserOptions: {
        // Clear the project setting from shared config and use projectService instead
        // projectService is more memory-efficient for monorepos
        project: null,
        projectService: {
          allowDefaultProject: ['*.js', '*.mjs'],
          defaultProject: './tsconfig.base.json',
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        // Add process global for files that use process.env
        process: 'readonly',
      },
    },
    settings: {
      // Configure import resolver to use TypeScript path mappings
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.base.json',
        },
      },
    },
    rules: {
      // Nx module boundary rules
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
    },
  },
  // Ensure jest globals and testing-library plugin are available in test files
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
    plugins: {
      'testing-library': testingLibrary,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      // Testing library rules
      'testing-library/no-container': 'warn',
      'testing-library/no-node-access': 'warn',
    },
  },
];
