import configPromise from '@bigcommerce/eslint-config';
import globals from 'globals';
import nxEslintPlugin from '@nx/eslint-plugin';

const baseConfig = await configPromise;

export default [
  ...(Array.isArray(baseConfig) ? baseConfig : []),
  {
    plugins: {
      '@nx': nxEslintPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        project: ['./packages/*/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./packages/*/tsconfig.json'],
        },
      },
    },
    rules: {
      // NX rules
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
  // Test files override
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'scripts/**',
      'webpack.config.js',
      '**/*.d.ts',
    ],
  },
];
