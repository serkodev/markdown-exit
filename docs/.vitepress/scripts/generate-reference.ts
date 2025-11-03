/* eslint-disable no-console */
import type { TypeDocOptions } from 'typedoc'
import { rm } from 'node:fs/promises'
import { Application } from 'typedoc'

const tsconfig = '../tsconfig.json'

console.log('📚 Generating reference...')

// Generate API documentation
await runTypedoc(tsconfig)
console.log('✅ Reference generated successfully!')

console.log('📚 Beautifying reference structure...')
await rm('reference/api/index.md', { force: true })
await rm('reference/api/_media', { recursive: true, force: true })

/**
 * Run TypeDoc with the specified tsconfig
 */
async function runTypedoc(tsconfig: string): Promise<void> {
  type TypeDocOptionsWithPlugins = TypeDocOptions &
    import('typedoc-plugin-markdown').PluginOptions &
      import('typedoc-plugin-frontmatter').PluginOptions

  const options: TypeDocOptionsWithPlugins = {
    tsconfig,
    plugin: [
      'typedoc-plugin-markdown',
      'typedoc-vitepress-theme',
      'typedoc-plugin-frontmatter',
    ],
    out: './reference/api',
    entryPoints: ['../packages/markdown-exit/src/index.ts'],
    excludeInternal: true,

    hideBreadcrumbs: true,
    useCodeBlocks: true,
    flattenOutputFiles: true,

    frontmatterGlobals: {
      outline: [2, 3],
    },

    // @ts-expect-error VitePress config
    docsRoot: './reference',
  }
  const app = await Application.bootstrapWithPlugins(options)

  // May be undefined if errors are encountered.
  const project = await app.convert()

  if (!project)
    throw new Error('Failed to generate TypeDoc output')

  // Generate configured outputs
  await app.generateOutputs(project)
}
