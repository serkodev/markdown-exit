import antfu from '@antfu/eslint-config'

export default antfu(
  {
    pnpm: true,
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
