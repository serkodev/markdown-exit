import type { PluginWithOptions } from '../src'
import type { Token } from '../src/token'
import { assert, describe, expect, it } from 'vitest'
import MarkdownExit from '../src'

describe('aPI', () => {
  it('constructor', () => {
    assert.throws(() => {
      // @ts-expect-error throw
      MarkdownExit('bad preset')
    })

    // options should override preset
    const md = MarkdownExit('commonmark', { html: false })
    assert.strictEqual(md.render('<!-- -->'), '<p>&lt;!-- --&gt;</p>\n')
  })

  it('configure coverage', () => {
    const md = MarkdownExit()

    // conditions coverage
    // @ts-expect-error empty preset
    md.configure({})
    assert.strictEqual(md.render('123'), '<p>123</p>\n')

    assert.throws(() => {
      // @ts-expect-error throw
      md.configure()
    })
  })

  it('plugin', () => {
    let succeeded = false

    const plugin: PluginWithOptions<string> = function (_, opts) {
      if (opts === 'bar') {
        succeeded = true
      }
    }

    const md = MarkdownExit()

    md.use(plugin, 'foo')
    assert.strictEqual(succeeded, false)
    md.use(plugin, 'bar')
    assert.strictEqual(succeeded, true)
  })

  it('highlight', () => {
    const md = MarkdownExit({
      highlight(str) {
        return `<pre><code>==${str}==</code></pre>`
      },
    })

    assert.strictEqual(md.render('```\nhl\n```'), '<pre><code>==hl\n==</code></pre>\n')
  })

  it('highlight escape by default', () => {
    const md = MarkdownExit({
      highlight() {
        return ''
      },
    })

    assert.strictEqual(md.render('```\n&\n```'), '<pre><code>&amp;\n</code></pre>\n')
  })

  it('highlight arguments', () => {
    const md = MarkdownExit({
      highlight(str, lang, attrs) {
        assert.strictEqual(lang, 'a')
        assert.strictEqual(attrs, 'b  c  d')
        return `<pre><code>==${str}==</code></pre>`
      },
    })

    assert.strictEqual(md.render('``` a  b  c  d \nhl\n```'), '<pre><code>==hl\n==</code></pre>\n')
  })

  it('force hardbreaks', () => {
    const md = MarkdownExit({ breaks: true })

    assert.strictEqual(md.render('a\nb'), '<p>a<br>\nb</p>\n')
    md.set({ xhtmlOut: true })
    assert.strictEqual(md.render('a\nb'), '<p>a<br />\nb</p>\n')
  })

  it('xhtmlOut enabled', () => {
    const md = MarkdownExit({ xhtmlOut: true })

    assert.strictEqual(md.render('---'), '<hr />\n')
    assert.strictEqual(md.render('![]()'), '<p><img src="" alt="" /></p>\n')
    assert.strictEqual(md.render('a  \\\nb'), '<p>a  <br />\nb</p>\n')
  })

  it('xhtmlOut disabled', () => {
    const md = MarkdownExit()

    assert.strictEqual(md.render('---'), '<hr>\n')
    assert.strictEqual(md.render('![]()'), '<p><img src="" alt=""></p>\n')
    assert.strictEqual(md.render('a  \\\nb'), '<p>a  <br>\nb</p>\n')
  })

  it('bulk enable/disable rules in different chains', () => {
    const md = MarkdownExit()

    const was = {
      core: md.core.ruler.getRules('').length,
      block: md.block.ruler.getRules('').length,
      inline: md.inline.ruler.getRules('').length,
    }

    // Disable 2 rule in each chain & compare result
    md.disable(['block', 'inline', 'code', 'fence', 'emphasis', 'entity'])

    const now = {
      core: md.core.ruler.getRules('').length + 2,
      block: md.block.ruler.getRules('').length + 2,
      inline: md.inline.ruler.getRules('').length + 2,
    }

    assert.deepEqual(was, now)

    // Enable the same rules back
    md.enable(['block', 'inline', 'code', 'fence', 'emphasis', 'entity'])

    const back = {
      core: md.core.ruler.getRules('').length,
      block: md.block.ruler.getRules('').length,
      inline: md.inline.ruler.getRules('').length,
    }

    assert.deepEqual(was, back)
  })

  it('bulk enable/disable with errors control', () => {
    const md = MarkdownExit()

    assert.throws(() => {
      md.enable(['link', 'code', 'invalid'])
    })
    assert.throws(() => {
      md.disable(['link', 'code', 'invalid'])
    })
    assert.doesNotThrow(() => {
      md.enable(['link', 'code'])
    })
    assert.doesNotThrow(() => {
      md.disable(['link', 'code'])
    })
  })

  it('bulk enable/disable should understand strings', () => {
    const md = MarkdownExit()

    md.disable('emphasis')
    assert(md.renderInline('_foo_'), '_foo_')

    md.enable('emphasis')
    assert(md.renderInline('_foo_'), '<em>foo</em>')
  })

  it('input type check', () => {
    const md = MarkdownExit()

    assert.throws(
      // @ts-expect-error throw
      () => { md.render(null) },
      /Input data should be a String/,
    )
  })
})

describe('plugins', () => {
  it('should not loop infinitely if all rules are disabled', () => {
    const md = MarkdownExit()

    md.inline.ruler.enableOnly([])
    md.inline.ruler2.enableOnly([])
    md.block.ruler.enableOnly([])

    assert.throws(() => md.render(' - *foo*\n - `bar`'), /none of the block rules matched/)
  })

  it('should not loop infinitely if inline rule doesn\'t increment pos', () => {
    const md = MarkdownExit()

    md.inline.ruler.after('text', 'custom', (state/* , silent */) => {
      if (state.src.charCodeAt(state.pos) !== 0x40/* @ */)
        return false
      return true
    })

    assert.throws(() => md.render('foo@bar'), /inline rule didn't increment state.pos/)
    assert.throws(() => md.render('[foo@bar]()'), /inline rule didn't increment state.pos/)
  })

  it('should not loop infinitely if block rule doesn\'t increment pos', () => {
    const md = MarkdownExit()

    md.block.ruler.before('paragraph', 'custom', (state, startLine/* , endLine, silent */) => {
      const pos = state.bMarks[startLine] + state.tShift[startLine]
      if (state.src.charCodeAt(pos) !== 0x40/* @ */)
        return false
      return true
    }, { alt: ['paragraph'] })

    assert.throws(() => md.render('foo\n@bar\nbaz'), /block rule didn't increment state.line/)
    assert.throws(() => md.render('foo\n\n@bar\n\nbaz'), /block rule didn't increment state.line/)
  })
})

describe('misc', () => {
  it('should replace NULL characters', () => {
    const md = MarkdownExit()

    assert.strictEqual(md.render('foo\u0000bar'), '<p>foo\uFFFDbar</p>\n')
  })

  it('should correctly parse strings without tailing \n', () => {
    const md = MarkdownExit()

    assert.strictEqual(md.render('123'), '<p>123</p>\n')
    assert.strictEqual(md.render('123\n'), '<p>123</p>\n')

    assert.strictEqual(md.render('    codeblock'), '<pre><code>codeblock\n</code></pre>\n')
    assert.strictEqual(md.render('    codeblock\n'), '<pre><code>codeblock\n</code></pre>\n')
  })

  it('should quickly exit on empty string', () => {
    const md = MarkdownExit()

    assert.strictEqual(md.render(''), '')
  })

  it('should parse inlines only', () => {
    const md = MarkdownExit()

    assert.strictEqual(md.renderInline('a *b* c'), 'a <em>b</em> c')
  })

  it('renderer should have pluggable inline and block rules', () => {
    const md = MarkdownExit()

    md.renderer.rules.em_open = () => '<it>'
    md.renderer.rules.em_close = () => '</it>'
    md.renderer.rules.paragraph_open = () => '<par>'
    md.renderer.rules.paragraph_close = () => '</par>'

    assert.strictEqual(md.render('*b*'), '<par><it>b</it></par>')
  })

  it('zero preset should disable everything', () => {
    const md = MarkdownExit('zero')

    assert.strictEqual(md.render('___foo___'), '<p>___foo___</p>\n')
    assert.strictEqual(md.renderInline('___foo___'), '___foo___')

    md.enable('emphasis')

    assert.strictEqual(md.render('___foo___'), '<p><em><strong>foo</strong></em></p>\n')
    assert.strictEqual(md.renderInline('___foo___'), '<em><strong>foo</strong></em>')
  })

  it('should correctly check block termination rules when those are disabled (#13)', () => {
    const md = MarkdownExit('zero')

    assert.strictEqual(md.render('foo\nbar'), '<p>foo\nbar</p>\n')
  })

  it('should normalize CR to LF', () => {
    const md = MarkdownExit()

    assert.strictEqual(
      md.render('# test\r\r - hello\r - world\r'),
      md.render('# test\n\n - hello\n - world\n'),
    )
  })

  it('should normalize CR+LF to LF', () => {
    const md = MarkdownExit()

    assert.strictEqual(
      md.render('# test\r\n\r\n - hello\r\n - world\r\n'),
      md.render('# test\n\n - hello\n - world\n'),
    )
  })

  it('should escape surrogate pairs (coverage)', () => {
    const md = MarkdownExit()

    assert.strictEqual(md.render('\\\uD835\uDC9C'), '<p>\\\uD835\uDC9C</p>\n')
    assert.strictEqual(md.render('\\\uD835x'), '<p>\\\uD835x</p>\n')
    assert.strictEqual(md.render('\\\uD835'), '<p>\\\uD835</p>\n')
  })
})

describe('url normalization', () => {
  it('should be overridable', () => {
    const md = MarkdownExit({ linkify: true })

    md.normalizeLink = function (url) {
      assert(url.match(/example\.com/), 'wrong url passed')
      return 'LINK'
    }
    md.normalizeLinkText = function (url) {
      assert(url.match(/example\.com/), 'wrong url passed')
      return 'TEXT'
    }

    assert.strictEqual(md.render('foo@example.com'), '<p><a href="LINK">TEXT</a></p>\n')
    assert.strictEqual(md.render('http://example.com'), '<p><a href="LINK">TEXT</a></p>\n')
    assert.strictEqual(md.render('<foo@example.com>'), '<p><a href="LINK">TEXT</a></p>\n')
    assert.strictEqual(md.render('<http://example.com>'), '<p><a href="LINK">TEXT</a></p>\n')
    assert.strictEqual(md.render('[test](http://example.com)'), '<p><a href="LINK">test</a></p>\n')
    assert.strictEqual(md.render('![test](http://example.com)'), '<p><img src="LINK" alt="test"></p>\n')
  })
})

describe('links validation', () => {
  it('override validator, disable everything', () => {
    const md = MarkdownExit({ linkify: true })

    md.validateLink = () => false

    assert.strictEqual(md.render('foo@example.com'), '<p>foo@example.com</p>\n')
    assert.strictEqual(md.render('http://example.com'), '<p>http://example.com</p>\n')
    assert.strictEqual(md.render('<foo@example.com>'), '<p>&lt;foo@example.com&gt;</p>\n')
    assert.strictEqual(md.render('<http://example.com>'), '<p>&lt;http://example.com&gt;</p>\n')
    assert.strictEqual(md.render('[test](http://example.com)'), '<p>[test](http://example.com)</p>\n')
    assert.strictEqual(md.render('![test](http://example.com)'), '<p>![test](http://example.com)</p>\n')
  })
})

describe('maxNesting', () => {
  it('block parser should not nest above limit', () => {
    const md = MarkdownExit({ maxNesting: 2 })
    assert.strictEqual(
      md.render('>foo\n>>bar\n>>>baz'),
      '<blockquote>\n<p>foo</p>\n<blockquote></blockquote>\n</blockquote>\n',
    )
  })

  it('inline parser should not nest above limit', () => {
    const md = MarkdownExit({ maxNesting: 1 })
    assert.strictEqual(
      md.render('[`foo`]()'),
      '<p><a href="">`foo`</a></p>\n',
    )
  })

  it('inline nesting coverage', () => {
    const md = MarkdownExit({ maxNesting: 2 })
    assert.strictEqual(
      md.render('[[[[[[[[[[[[[[[[[[foo]()'),
      '<p>[[[[[[[[[[[[[[[[[[foo]()</p>\n',
    )
  })
})

describe('smartquotes', () => {
  const md = MarkdownExit({
    typographer: true,

    // all strings have different length to make sure
    // we didn't accidentally count the wrong one
    quotes: ['[[[', ']]', '(((((', '))))'],
  })

  it('should support multi-character quotes', () => {
    assert.strictEqual(
      md.render('"foo" \'bar\''),
      '<p>[[[foo]] (((((bar))))</p>\n',
    )
  })

  it('should support nested multi-character quotes', () => {
    assert.strictEqual(
      md.render('"foo \'bar\' baz"'),
      '<p>[[[foo (((((bar)))) baz]]</p>\n',
    )
  })

  it('should support multi-character quotes in different tags', () => {
    assert.strictEqual(
      md.render('"a *b \'c *d* e\' f* g"'),
      '<p>[[[a <em>b (((((c <em>d</em> e)))) f</em> g]]</p>\n',
    )
  })
})

describe('ordered list info', () => {
  const md = MarkdownExit()

  function type_filter(tokens: Token[], type: string) {
    return tokens.filter(t => t.type === type)
  }

  it('should mark ordered list item tokens with info', () => {
    let tokens = md.parse('1. Foo\n2. Bar\n20. Fuzz')
    assert.strictEqual(type_filter(tokens, 'ordered_list_open').length, 1)
    tokens = type_filter(tokens, 'list_item_open')
    assert.strictEqual(tokens.length, 3)
    assert.strictEqual(tokens[0].info, '1')
    assert.strictEqual(tokens[0].markup, '.')
    assert.strictEqual(tokens[1].info, '2')
    assert.strictEqual(tokens[1].markup, '.')
    assert.strictEqual(tokens[2].info, '20')
    assert.strictEqual(tokens[2].markup, '.')

    tokens = md.parse(' 1. Foo\n2. Bar\n  20. Fuzz\n 199. Flp')
    assert.strictEqual(type_filter(tokens, 'ordered_list_open').length, 1)
    tokens = type_filter(tokens, 'list_item_open')
    assert.strictEqual(tokens.length, 4)
    assert.strictEqual(tokens[0].info, '1')
    assert.strictEqual(tokens[0].markup, '.')
    assert.strictEqual(tokens[1].info, '2')
    assert.strictEqual(tokens[1].markup, '.')
    assert.strictEqual(tokens[2].info, '20')
    assert.strictEqual(tokens[2].markup, '.')
    assert.strictEqual(tokens[3].info, '199')
    assert.strictEqual(tokens[3].markup, '.')
  })
})

describe('token attributes', () => {
  it('.attrJoin', () => {
    const md = MarkdownExit()

    const tokens = md.parse('```')
    const t = tokens[0]

    t.attrJoin('class', 'foo')
    t.attrJoin('class', 'bar')

    assert.strictEqual(
      md.renderer.render(tokens, md.options),
      '<pre><code class="foo bar"></code></pre>\n',
    )
  })

  it('.attrSet', () => {
    const md = MarkdownExit()

    const tokens = md.parse('```')
    const t = tokens[0]

    t.attrSet('class', 'foo')

    assert.strictEqual(
      md.renderer.render(tokens, md.options),
      '<pre><code class="foo"></code></pre>\n',
    )

    t.attrSet('class', 'bar')

    assert.strictEqual(
      md.renderer.render(tokens, md.options),
      '<pre><code class="bar"></code></pre>\n',
    )
  })

  it('.attrGet', () => {
    const md = MarkdownExit()

    const tokens = md.parse('```')
    const t = tokens[0]

    assert.strictEqual(t.attrGet('myattr'), null)

    t.attrSet('myattr', 'myvalue')

    assert.strictEqual(t.attrGet('myattr'), 'myvalue')
  })
})

describe('markdown-exit references', () => {
  const md = MarkdownExit()

  it('reference as hidden info', () => {
    const fixture = `\`\`\`js
console.log(1)
\`\`\`
[//]: js

\`\`\`ts
console.log(2)
\`\`\`
[//]: ts
`
    const tokens = md.parse(fixture)

    const firstRefIndex = tokens.findIndex(token => token.type === 'reference')
    if (firstRefIndex === -1)
      throw new Error('No reference token found')
    const firstRef = tokens[firstRefIndex]
    expect(firstRef.info).toEqual('//')
    expect(tokens[firstRefIndex - 1].info).toEqual(firstRef.meta.href)

    const secondRefIndex = tokens.findIndex(token => token.type === 'reference')
    if (secondRefIndex === -1)
      throw new Error('No reference token found')
    const secondRef = tokens[secondRefIndex]
    expect(secondRef.info).toEqual('//')
    expect(tokens[secondRefIndex - 1].info).toEqual(secondRef.meta.href)
  })
})
