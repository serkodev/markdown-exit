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
  const files = import.meta.glob('./fixtures/markdown-it/*', {
    query: '?raw',
    import: 'default',
    eager: true,
  })
  for (const [path, content] of Object.entries(files)) {
    for (const { skip, desc, header, first, second } of generateFromContent(content as string, { defaultDesc: basename(path) })) {
      it.skipIf(skip)(`${desc}: ${header}`, () => {
        assert.strictEqual(md.render(first), second)
      })
    }
  }
})

describe('commonmark', () => {
  function normalize(text: string) {
    return text.replace(/<blockquote>\n<\/blockquote>/g, '<blockquote></blockquote>')
  }

  const md = MarkdownExit('commonmark')
  const files = import.meta.glob('./fixtures/commonmark/*', {
    query: '?raw',
    import: 'default',
    eager: true,
  })
  for (const [path, content] of Object.entries(files)) {
    for (const { skip, desc, header, first, second } of generateFromContent(content as string, { defaultDesc: basename(path) })) {
      it.skipIf(skip)(`${desc}: ${header}`, () => {
        assert.strictEqual(md.render(first), normalize(second))
      })
    }
  }
})
