import type { Rollup } from 'vite'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { assert, describe, it } from 'vitest'
import MarkdownExit from '../src/index.core'
import linkifyGfm, { GfmLinkify } from '../src/linkify-gfm'

const md = MarkdownExit().use(linkifyGfm)

// The autolink examples of the GFM spec 0.29, https://github.github.com/gfm/#autolinks-extension-
const spec: [string, string][] = [
  ['www.commonmark.org', '<p><a href="http://www.commonmark.org">www.commonmark.org</a></p>\n'],
  ['Visit www.commonmark.org/help for more information.', '<p>Visit <a href="http://www.commonmark.org/help">www.commonmark.org/help</a> for more information.</p>\n'],
  ['Visit www.commonmark.org.\n\nVisit www.commonmark.org/a.b.', '<p>Visit <a href="http://www.commonmark.org">www.commonmark.org</a>.</p>\n<p>Visit <a href="http://www.commonmark.org/a.b">www.commonmark.org/a.b</a>.</p>\n'],
  ['www.google.com/search?q=Markup+(business)\n\nwww.google.com/search?q=Markup+(business)))\n\n(www.google.com/search?q=Markup+(business))\n\n(www.google.com/search?q=Markup+(business)', '<p><a href="http://www.google.com/search?q=Markup+(business)">www.google.com/search?q=Markup+(business)</a></p>\n<p><a href="http://www.google.com/search?q=Markup+(business)">www.google.com/search?q=Markup+(business)</a>))</p>\n<p>(<a href="http://www.google.com/search?q=Markup+(business)">www.google.com/search?q=Markup+(business)</a>)</p>\n<p>(<a href="http://www.google.com/search?q=Markup+(business)">www.google.com/search?q=Markup+(business)</a></p>\n'],
  ['www.google.com/search?q=(business))+ok', '<p><a href="http://www.google.com/search?q=(business))+ok">www.google.com/search?q=(business))+ok</a></p>\n'],
  ['www.google.com/search?q=commonmark&hl=en\n\nwww.google.com/search?q=commonmark&hl;', '<p><a href="http://www.google.com/search?q=commonmark&amp;hl=en">www.google.com/search?q=commonmark&amp;hl=en</a></p>\n<p><a href="http://www.google.com/search?q=commonmark">www.google.com/search?q=commonmark</a>&amp;hl;</p>\n'],
  ['www.commonmark.org/he<lp', '<p><a href="http://www.commonmark.org/he">www.commonmark.org/he</a>&lt;lp</p>\n'],
  ['foo@bar.baz', '<p><a href="mailto:foo@bar.baz">foo@bar.baz</a></p>\n'],
  ['hello@mail+xyz.example isn\'t valid, but hello+xyz@mail.example is.', '<p>hello@mail+xyz.example isn\'t valid, but <a href="mailto:hello+xyz@mail.example">hello+xyz@mail.example</a> is.</p>\n'],
  ['a.b-c_d@a.b\n\na.b-c_d@a.b.\n\na.b-c_d@a.b-\n\na.b-c_d@a.b_', '<p><a href="mailto:a.b-c_d@a.b">a.b-c_d@a.b</a></p>\n<p><a href="mailto:a.b-c_d@a.b">a.b-c_d@a.b</a>.</p>\n<p>a.b-c_d@a.b-</p>\n<p>a.b-c_d@a.b_</p>\n'],
]

describe('markdown-exit/linkify-gfm', () => {
  it.each(spec)('links GFM spec example %j', (src, html) => {
    assert.strictEqual(md.render(src), html)
  })

  it('links http(s):// but not ftp://, the same as remark-gfm', () => {
    assert.strictEqual(
      md.render('(Visit https://encrypted.google.com/search?q=Markup+(business))\n\nftp://foo.bar.baz.'),
      '<p>(Visit <a href="https://encrypted.google.com/search?q=Markup+(business)">https://encrypted.google.com/search?q=Markup+(business)</a>)</p>\n<p>ftp://foo.bar.baz.</p>\n',
    )
  })

  it('leaves bare domains and mentions as text', () => {
    assert.strictEqual(md.render('see hackmd.io/@x/abc cc @alice'), '<p>see hackmd.io/@x/abc cc @alice</p>\n')
  })

  it('reads fuzzyLink and fuzzyEmail', () => {
    const urls = (linkify: GfmLinkify) => linkify.match('www.a.com b@c.de mailto:e@f.gh https://i.jk')?.map(m => m.url)
    assert.deepEqual(urls(new GfmLinkify()), ['http://www.a.com', 'mailto:b@c.de', 'mailto:e@f.gh', 'https://i.jk'])
    assert.deepEqual(urls(new GfmLinkify({ fuzzyLink: false })), ['mailto:b@c.de', 'mailto:e@f.gh', 'https://i.jk'])
    assert.deepEqual(urls(new GfmLinkify().set({ fuzzyEmail: false })), ['http://www.a.com', 'mailto:e@f.gh', 'https://i.jk'])
  })

  it('returns linkify-it\'s match fields', () => {
    const linkify = new GfmLinkify()
    assert.isTrue(linkify.test('see www.example.com.'))
    assert.deepEqual(linkify.match('see www.example.com.'), [
      { schema: '', index: 4, lastIndex: 19, raw: 'www.example.com', text: 'www.example.com', url: 'http://www.example.com' },
    ])
    assert.isNull(linkify.match('@alice see you'))
    assert.deepEqual(linkify.matchAtStart('https://a.com/b_c_ and more'), {
      schema: 'https:',
      index: 0,
      lastIndex: 17,
      raw: 'https://a.com/b_c',
      text: 'https://a.com/b_c',
      url: 'https://a.com/b_c',
    })
    assert.isNull(linkify.matchAtStart('www.a.com'))
  })

  it('throws on tlds and add', () => {
    assert.throws(() => new GfmLinkify().tlds(), /TLD/)
    assert.throws(() => new GfmLinkify().add(), /schemas/)
  })

  it('does not bundle linkify-it', async () => {
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      build: {
        write: false,
        lib: { entry: fileURLToPath(new URL('../src/linkify-gfm.ts', import.meta.url)), formats: ['es'] },
        rollupOptions: { external: id => !id.startsWith('.') && !id.startsWith('/') },
      },
    }) as Rollup.RollupOutput[]
    assert.notInclude(result[0].output.flatMap(chunk => chunk.type === 'chunk' ? chunk.imports : []), 'linkify-it')
  })
})
