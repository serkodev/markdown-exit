import type { Rollup } from 'vite'
import { fileURLToPath } from 'node:url'
import { LinkifyIt } from 'linkify-it'
import { build } from 'vite'
import { assert, describe, it } from 'vitest'
import MarkdownExit from '../src/index.core'

async function bundleImports(entry: string): Promise<string[]> {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      lib: { entry: fileURLToPath(new URL(entry, import.meta.url)), formats: ['es'] },
      rollupOptions: { external: id => !id.startsWith('.') && !id.startsWith('/') },
    },
  }) as Rollup.RollupOutput[]
  return result[0].output.flatMap(chunk => chunk.type === 'chunk' ? chunk.imports : [])
}

const ENTRY = 'virtual:entry'

// Maps each bundled module id to the length of its code left after tree-shaking.
async function bundleRenderedLengths(code: string): Promise<Map<string, number>> {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [{
      name: 'virtual-entry',
      resolveId: id => id === ENTRY ? id : null,
      load: id => id === ENTRY ? code : null,
    }],
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        input: ENTRY,
        external: id => id !== ENTRY && !id.startsWith('.') && !id.startsWith('/'),
      },
    },
  }) as Rollup.RollupOutput | Rollup.RollupOutput[]
  const chunks = [result].flat()[0].output.filter(chunk => chunk.type === 'chunk')
  return new Map(chunks.flatMap(chunk => Object.entries(chunk.modules).map(([id, module]) => [id, module.renderedLength])))
}

describe('markdown-exit/core', () => {
  it('does not bundle linkify-it', async () => {
    assert.include(await bundleImports('../src/index.ts'), 'linkify-it')
    assert.notInclude(await bundleImports('../src/index.core.ts'), 'linkify-it')
  })

  it('tree-shakes the renderer and presets when only `Parser` is imported', async () => {
    const core = fileURLToPath(new URL('../src/index.core.ts', import.meta.url))
    const lengths = await bundleRenderedLengths(`import { Parser } from ${JSON.stringify(core)}\nconsole.log(new Parser().parse('# a'))`)
    const rendered = (path: string) => [...lengths].reduce((sum, [id, length]) => id.includes(path) ? sum + length : sum, 0)

    assert.isAbove(rendered('/src/parser/parser.ts'), 0)
    assert.strictEqual(rendered('/src/renderer.ts'), 0)
    assert.strictEqual(rendered('/src/presets/'), 0)
  })

  it('renders without linkify-it', () => {
    const md = MarkdownExit()

    assert.strictEqual(md.render('https://example.com'), '<p>https://example.com</p>\n')
  })

  it('needs a linkify-it instance to enable linkify', () => {
    const md = MarkdownExit({ linkify: true })

    assert.throws(() => md.render('https://example.com'), /linkify-it/)

    md.linkify = new LinkifyIt()
    assert.strictEqual(md.render('https://example.com'), '<p><a href="https://example.com">https://example.com</a></p>\n')
  })
})
