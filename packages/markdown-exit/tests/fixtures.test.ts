import { basename } from 'node:path'
import { generateFromContent } from '@markdown-exit/testgen'
import { assert, describe, it } from 'vitest'
import MarkdownExit from '../src'

describe('markdown-it', async () => {
  const md = MarkdownExit({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true,
  })
  const fixtures = import.meta.glob<string>('./fixtures/markdown-it/*', { query: '?raw', import: 'default' })

  for (const [path, fixture] of Object.entries(fixtures)) {
    for (const { skip, desc, header, first, second } of generateFromContent(await fixture(), { defaultDesc: basename(path) })) {
      it.skipIf(skip)(`${desc}: ${header}`, () => {
        assert.strictEqual(md.render(first), second)
      })
    }
  }
})

describe('commonmark', async () => {
  function normalize(text: string) {
    return text.replace(/<blockquote>\n<\/blockquote>/g, '<blockquote></blockquote>')
  }

  const md = MarkdownExit('commonmark')
  const fixtures = import.meta.glob<string>('./fixtures/commonmark/*', { query: '?raw', import: 'default' })
  for (const [path, fixture] of Object.entries(fixtures)) {
    for (const { skip, desc, header, first, second } of generateFromContent(await fixture(), { defaultDesc: basename(path) })) {
      it.skipIf(skip)(`${desc}: ${header}`, () => {
        assert.strictEqual(md.render(first), normalize(second))
      })
    }
  }
})
