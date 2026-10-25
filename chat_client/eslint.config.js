// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*'],
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      // --- Arrow functions (callbacks) ---
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'implicit-arrow-linebreak': ['error', 'beside'],
      'no-confusing-arrow': ['error', { allowParens: true }],

      // --- Arrow functions for React components ---
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],

      // --- Arrow functions for custom hooks (and all other functions) ---
      'func-style': ['error', 'expression'],
    },
  },
  {
    // Type-aware rules need the TS program, so they only apply to TS files
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
]);
