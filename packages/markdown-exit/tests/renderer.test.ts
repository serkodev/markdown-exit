import { codeToHtml, createHighlighter } from 'shiki'
import { describe, expect, it } from 'vitest'
import { createMarkdownExit } from '../src'
import { Renderer } from '../src/renderer'

describe('renderAsync', () => {
  it('basic usage: renders paragraph with inline text', async () => {
    const tokens = createMarkdownExit().parse('# markdown-exit')

    const r = new Renderer()
    const html = await r.renderAsync(tokens, {})
    expect(html).toBe('<h1>markdown-exit</h1>\n')
  })

  it('supports async render rules and runs them in parallel while preserving order', async () => {
    const r = new Renderer()

    const log: string[] = []
    const delays = [30, 10, 20]

    // Override code_inline rule with async
    r.rules.code_inline = (tokens, idx) => {
      log.push(`start-${idx}`)
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          log.push(`done-${idx}`)
          resolve(tokens[idx].content)
        }, delays[idx] ?? 0)
      })
    }

    const tokens = createMarkdownExit().parse('`A` `B` `C`')

    const p = r.renderAsync(tokens, {})

    // Immediately after kicking off renderAsync, all text rules should have started
    expect(log).toEqual(['start-0', 'start-2', 'start-4'])

    const html = await p
    expect(html).toBe('<p>A B C</p>\n')

    // Evidence of parallel start: a later task started before the first resolved
    const start2 = log.indexOf('start-4')
    const done0 = log.indexOf('done-0')
    expect(start2).toBeGreaterThanOrEqual(0)
    expect(done0).toBeGreaterThanOrEqual(0)
    expect(start2).toBeLessThan(done0)
  })

  async function asyncHighlight(str: string, lang: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 5))
    return `<pre class="hl ${lang}"><code>${str}</code></pre>`
  }

  it('supports async highlighter for fenced code blocks', async () => {
    const tokens = createMarkdownExit().parse('```js\nconsole.log(1)\n```')

    const r = new Renderer()
    const html = await r.renderAsync(tokens, {
      langPrefix: 'language-',
      highlight: asyncHighlight,
    })

    expect(html).toMatchInlineSnapshot(`
      "<pre class="hl js"><code>console.log(1)
      </code></pre>
      "
    `)

    expect(html.endsWith('\n')).toBe(true)
  })

  it('throws if async rule is used with sync render', () => {
    const tokens = createMarkdownExit().parse('```js\nconsole.log(1)\n```')

    const r = new Renderer()
    expect(() => r.render(tokens, {
      langPrefix: 'language-',
      highlight: asyncHighlight,
    })).toThrow()
  })

  it('honors a monkey-patched render method', async () => {
    const md = createMarkdownExit()
    const original = md.renderer.render.bind(md.renderer)
    md.renderer.render = (tokens, options, env) => {
      env!.patched = 'yes'
      return original(tokens, options, env)
    }

    const env: Record<string, unknown> = {}
    const html = await md.renderAsync('# hi', env)
    expect(env.patched).toBe('yes')
    expect(html).toBe('<h1>hi</h1>\n')
  })

  it('runs the parallel path when render is not patched', async () => {
    const md = createMarkdownExit({ highlight: asyncHighlight })
    const html = await md.renderAsync('```js\nconsole.log(1)\n```')
    expect(html).toContain('<pre class="hl js">')
  })

  it('honors a monkey-patched renderInline method', async () => {
    const md = createMarkdownExit()
    const original = md.renderer.renderInline.bind(md.renderer)
    md.renderer.renderInline = (tokens, options, env) => {
      env!.marks = 'yes'
      return original(tokens, options, env)
    }

    const env: Record<string, unknown> = {}
    const html = await md.renderAsync('*hi*', env)
    expect(env.marks).toBe('yes')
    expect(html).toBe('<p><em>hi</em></p>\n')

    const inlineEnv: Record<string, unknown> = {}
    const inline = await md.renderInlineAsync('*hi*', inlineEnv)
    expect(inlineEnv.marks).toBe('yes')
    expect(inline).toBe('<em>hi</em>')
  })

  it('renders async inline rules when a plugin wraps both renderInline and renderInlineAsync', async () => {
    // Reproduces https://github.com/serkodev/markdown-exit/issues/35
    // A plugin (e.g. @comark/markdown-it) wraps BOTH inline render methods,
    // only preprocessing tokens then delegating. renderInlineAsync must not
    // route the async render back through the patched sync renderInline, which
    // would throw on async inline rules (Shiki, KaTeX, etc.).
    const md = createMarkdownExit({ html: true })

    const wrapped: string[] = []
    const wrap = <T extends (...args: any[]) => any>(fn: T): T =>
      (function (this: unknown, tokens: unknown, options: unknown, env: unknown) {
        wrapped.push(fn.name || 'wrapped')
        return fn.call(this, tokens, options, env)
      }) as unknown as T

    md.renderer.renderInline = wrap(md.renderer.renderInline)
    md.renderer.renderInlineAsync = wrap(md.renderer.renderInlineAsync)

    md.renderer.rules.code_inline = async (tokens, idx) => {
      await Promise.resolve()
      return `<code>${tokens[idx].content}</code>`
    }

    const html = await md.renderAsync('a `b` c\n')
    expect(html).toBe('<p>a <code>b</code> c</p>\n')
    // The async-aware wrapper still runs (its preprocessing is honored).
    expect(wrapped.length).toBeGreaterThan(0)
  })

  it('fallback supplies an empty env when none is given', async () => {
    const md = createMarkdownExit()
    const original = md.renderer.render.bind(md.renderer)
    md.renderer.render = (tokens, options, env) => {
      env!.patched = 'yes'
      return original(tokens, options, env)
    }

    const html = await md.renderer.renderAsync(md.parse('# hi', {}), md.options, {})
    expect(html).toBe('<h1>hi</h1>\n')
  })
})

/**
 * original from markdown-it-async
 * @see https://github.com/antfu/markdown-it-async/blob/main/test/index.test.ts
 */
describe('renderAsync (markdown-it-async)', async () => {
  const fixture = `
# Hello

Some code 

\`\`\`ts
console.log('Hello')
\`\`\`
`

  using shiki = await createHighlighter({
    themes: ['vitesse-light'],
    langs: ['ts'],
  })

  const mds = createMarkdownExit({
    highlight(str, lang) {
      return shiki.codeToHtml(str, { lang, theme: 'vitesse-light' })
    },
  })
  const expectedResult = mds.render(fixture)

  it('exported', async () => {
    const mda = createMarkdownExit({
      async highlight(str, lang) {
        return await codeToHtml(str, {
          lang,
          theme: 'vitesse-light',
        })
      },
    })

    expect(expectedResult)
      .toEqual(await mda.renderAsync(fixture))
  })

  it('via optons set', async () => {
    const mda = createMarkdownExit()

    mda.use((md) => {
      md.options.highlight = async (str, lang) => {
        return await codeToHtml(str, {
          lang,
          theme: 'vitesse-light',
        })
      }
    })

    expect(expectedResult).toEqual(await mda.renderAsync(fixture))
  })
})
