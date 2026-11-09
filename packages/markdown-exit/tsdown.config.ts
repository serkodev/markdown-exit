import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: { index: './src/index.ts', core: './src/index.core.ts', parser: './src/index.parser.ts' },
    platform: 'neutral',
    dts: true,
  },
])
