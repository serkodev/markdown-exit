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
    const md = createMarkdownExit()
    const env: Record<string, unknown> = {}
    const html = await md.renderAsync('# hi', env)
    expect(html).toBe('<h1>hi</h1>\n')
    expect(env.patched).toBeUndefined()
  })

  it('patched render with an async rule surfaces the async-rule error', async () => {
    const md = createMarkdownExit({
      highlight: async str => `<b>${str}</b>`,
    })
    const original = md.renderer.render.bind(md.renderer)
    md.renderer.render = (tokens, options, env) => original(tokens, options, env)

    await expect(md.renderAsync('```\nhl\n```')).rejects.toThrow(/async rule detected/)
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
