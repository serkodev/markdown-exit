import type { Rollup } from 'vite'
import { fileURLToPath } from 'node:url'
import { LinkifyIt } from 'linkify-it'
import * as ucmicro from 'uc.micro'
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

describe('markdown-exit/core', () => {
  it('does not bundle linkify-it', async () => {
    assert.include(await bundleImports('../src/index.ts'), 'linkify-it')
    assert.notInclude(await bundleImports('../src/index.core.ts'), 'linkify-it')
  })

  it('does not bundle uc.micro', async () => {
    assert.include(await bundleImports('../src/index.ts'), 'uc.micro')
    assert.notInclude(await bundleImports('../src/index.core.ts'), 'uc.micro')
  })

  it('needs uc.micro for `md.utils.lib.ucmicro`', () => {
    const md = MarkdownExit()

    assert.throws(() => md.utils.lib.ucmicro, /uc\.micro/)

    md.utils.lib.ucmicro = ucmicro
    assert.strictEqual(md.utils.lib.ucmicro.P, ucmicro.P)
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
