import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generate } from '@markdown-exit/testgen'
import { assert, describe, it } from 'vitest'
import MarkdownExit from '../src'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('markdown-it', () => {
  const md = MarkdownExit({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true,
  })
  const path = resolve(__dirname, './fixtures/markdown-it/*')

  for (const { skip, desc, header, first, second } of generate(path)) {
    it.skipIf(skip)(`${desc}: ${header}`, () => {
      assert.strictEqual(md.render(first), second)
    })
  }
})

describe('commonmark', () => {
  function normalize(text: string) {
    return text.replace(/<blockquote>\n<\/blockquote>/g, '<blockquote></blockquote>')
  }

  const md = MarkdownExit('commonmark')
  const path = resolve(__dirname, './fixtures/commonmark/*')

  for (const { skip, desc, header, first, second } of generate(path)) {
    it.skipIf(skip)(`${desc}: ${header}`, () => {
      assert.strictEqual(md.render(first), normalize(second))
    })
  }
})
