import antfu from '@antfu/eslint-config'

export default antfu(
  {
    pnpm: true,
    ignores: [
      'packages/bench/samples/**/*',
      'packages/markdown-exit/tests/fixtures/**/*',
    ],
  },
  {
    rules: {
      'no-console': 'warn',
      'no-alert': 'warn',
      'curly': 'off',
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'unused-imports/no-unused-vars': 'warn',
      'style/operator-linebreak': 'off',
    },
  },
  {
    files: ['**/*.md'],
    rules: {
      // allows line break with two spaces
      'style/no-trailing-spaces': 'off',
    },
  },
)
