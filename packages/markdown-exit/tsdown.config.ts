import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: { index: './src/index.ts', core: './src/index.core.ts' },
    platform: 'neutral',
    dts: true,
  },
])
