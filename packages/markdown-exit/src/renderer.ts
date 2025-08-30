/**
 * class Renderer
 *
 * Generates HTML from parsed token stream. Each instance has independent
 * copy of rules. Those can be rewritten with ease. Also, you can add new
 * rules if you create plugin and adds new token types.
 */

import type Token from './token'
import type { HTMLAttribute } from './token'
import { escapeHtml, isPromiseLike, unescapeAll } from './common/utils'

export interface RenderOptions {
  /**
   * Set `true` to add '/' when closing single tags
   * (`<br />`). This is needed only for full CommonMark compatibility. In real
   * world you will need HTML output.
   * @default false
   */
  xhtmlOut?: boolean

  /**
   * Set `true` to convert `\n` in paragraphs into `<br>`.
   * @default false
   */
  breaks?: boolean

  /**
   * CSS language class prefix for fenced blocks.
   * Can be useful for external highlighters.
   * @default 'language-'
   */
  langPrefix?: string

  /**
   * Highlighter function for fenced code blocks.
   * Highlighter `function (str, lang, attrs)` should return escaped HTML. It can
   * also return empty string if the source was not changed and should be escaped
   * externally. If result starts with <pre... internal wrapper is skipped.
   * @default null
   */
  highlight?: ((str: string, lang: string, attrs: string) => string | Promise<string>) | null
}

export type RenderRule = (tokens: Token[], idx: number, options: RenderOptions, env: any, self: Renderer) => string | Promise<string>

export interface RenderRuleRecord {
  [type: string]: RenderRule | undefined
  code_inline?: RenderRule | undefined
  code_block?: RenderRule | undefined
  fence?: RenderRule | undefined
  image?: RenderRule | undefined
  hardbreak?: RenderRule | undefined
  softbreak?: RenderRule | undefined
  text?: RenderRule | undefined
  html_block?: RenderRule | undefined
  html_inline?: RenderRule | undefined
}

const default_rules: Record<string, RenderRule> = {}

default_rules.code_inline = function (tokens, idx, options, env, slf) {
  const token = tokens[idx]

  return `<code${slf.renderAttrs(token)}>${
    escapeHtml(token.content)
  }</code>`
}

default_rules.code_block = function (tokens, idx, options, env, slf) {
  const token = tokens[idx]

  return `<pre${slf.renderAttrs(token)}><code>${
    escapeHtml(tokens[idx].content)
  }</code></pre>\n`
}

default_rules.fence = function (tokens, idx, options, env, slf): string | Promise<string> {
  const token = tokens[idx]
  const info = token.info ? unescapeAll(token.info).trim() : ''
  let langName = ''
  let langAttrs = ''

  if (info) {
    const arr = info.split(/(\s+)/g)
    langName = arr[0]
    langAttrs = arr.slice(2).join('')
  }

  function finalize(highlighted: string): string {
    if (highlighted.indexOf('<pre') === 0) {
      return `${highlighted}\n`
    }

    // If language exists, inject class gently, without modifying original token.
    // May be, one day we will add .deepClone() for token and simplify this part, but
    // now we prefer to keep things local.
    if (info) {
      const i = token.attrIndex('class')
      const tmpAttrs: HTMLAttribute[] = token.attrs ? token.attrs.slice() : []

      if (i < 0) {
        tmpAttrs.push(['class', options.langPrefix + langName])
      } else {
        tmpAttrs[i] = tmpAttrs[i].slice() as HTMLAttribute
        tmpAttrs[i][1] += ` ${options.langPrefix}${langName}`
      }

      // Fake token just to render attributes
      const tmpToken = {
        attrs: tmpAttrs,
      }

      return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>\n`
    }

    return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>\n`
  }

  const resolveHighlighted = () => {
    if (!options.highlight)
      return escapeHtml(token.content)

    const highlighted = options.highlight(token.content, langName, langAttrs)
    if (isPromiseLike<string | undefined>(highlighted)) {
      return highlighted.then(v => v || escapeHtml(token.content))
    }
    return highlighted || escapeHtml(token.content)
  }

  const highlighted = resolveHighlighted()

  return isPromiseLike<string>(highlighted)
    ? (highlighted.then(finalize))
    : finalize(highlighted as string)
}

default_rules.image = function (tokens, idx, options, env, slf) {
  const token = tokens[idx]

  // "alt" attr MUST be set, even if empty. Because it's mandatory and
  // should be placed on proper position for tests.
  //
  // Replace content with actual value

  token.attrs![token.attrIndex('alt')][1] =
    slf.renderInlineAsText(token.children!, options, env)

  return slf.renderToken(tokens, idx, options)
}

default_rules.hardbreak = function (tokens, idx, options /* , env */) {
  return options.xhtmlOut ? '<br />\n' : '<br>\n'
}
default_rules.softbreak = function (tokens, idx, options /* , env */) {
  return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n'
}

default_rules.text = function (tokens, idx /* , options, env */) {
  return escapeHtml(tokens[idx].content)
}

default_rules.html_block = function (tokens, idx /* , options, env */) {
  return tokens[idx].content
}
default_rules.html_inline = function (tokens, idx /* , options, env */) {
  return tokens[idx].content
}

export default class Renderer {
  /**
   * Contains render rules for tokens. Can be updated and extended.
   *
   * ##### Example
   *
   * ```javascript
   * md.renderer.rules.strong_open = () => '<b>';
   * md.renderer.rules.strong_close = () => '</b>';
   *
   * var result = md.renderInline(...);
   * ```
   *
   * @see https://github.com/serkodev/markdown-exit/tree/main/packages/markdown-exit/src/renderer.ts
   */
  rules: RenderRuleRecord = Object.assign({}, default_rules)

  /**
   * Creates new {@link Renderer} instance and fill {@link Renderer#rules} with defaults.
   */
  constructor() {
  }

  /**
   * Render token attributes to string.
   */
  renderAttrs(token: Pick<Token, 'attrs'>): string {
    let i, l, result

    if (!token.attrs)
      return ''

    result = ''

    for (i = 0, l = token.attrs.length; i < l; i++) {
      result += ` ${escapeHtml(token.attrs[i][0])}="${escapeHtml(token.attrs[i][1])}"`
    }

    return result
  }

  /**
   * Default token renderer. Can be overriden by custom function
   * in {@link Renderer#rules}.
   *
   * @param tokens list of tokens
   * @param idx token index to render
   * @param options params of parser instance
   * @param env additional data from parsed input (references, for example)
   */
  // eslint-disable-next-line unused-imports/no-unused-vars
  renderToken(tokens: Token[], idx: number, options: RenderOptions, env?: any): string {
    const token = tokens[idx]
    let result = ''

    // Tight list paragraphs
    if (token.hidden) {
      return ''
    }

    // Insert a newline between hidden paragraph and subsequent opening
    // block-level tag.
    //
    // For example, here we should insert a newline before blockquote:
    //  - a
    //    >
    //
    if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
      result += '\n'
    }

    // Add token name, e.g. `<img`
    result += (token.nesting === -1 ? '</' : '<') + token.tag

    // Encode attributes, e.g. `<img src="foo"`
    result += this.renderAttrs(token)

    // Add a slash for self-closing tags, e.g. `<img src="foo" /`
    if (token.nesting === 0 && options.xhtmlOut) {
      result += ' /'
    }

    // Check if we need to add a newline after this tag
    let needLf = false
    if (token.block) {
      needLf = true

      if (token.nesting === 1) {
        if (idx + 1 < tokens.length) {
          const nextToken = tokens[idx + 1]

          if (nextToken.type === 'inline' || nextToken.hidden) {
            // Block-level tag containing an inline tag.
            //
            needLf = false
          } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
            // Opening tag + closing tag of the same type. E.g. `<li></li>`.
            //
            needLf = false
          }
        }
      }
    }

    result += needLf ? '>\n' : '>'

    return result
  }

  /**
   * The same as {@link Renderer.render}, but for single token of `inline` type.
   *
   * @param tokens list of block tokens to render
   * @param options params of parser instance
   * @param env additional data from parsed input (references, for example)
   */
  renderInline(tokens: Token[], options: RenderOptions, env?: any): string {
    let result = ''
    const rules = this.rules

    for (let i = 0, len = tokens.length; i < len; i++) {
      const type = tokens[i].type

      const rule = rules[type]
      if (rule) {
        const _result = rule(tokens, i, options, env, this)
        if (isPromiseLike<string>(_result))
          throw new Error('Renderer.renderInline: async rule detected, use renderInlineAsync()')
        result += _result
      } else {
        result += this.renderToken(tokens, i, options, env)
      }
    }

    return result
  }

  /**
   * Special kludge for image `alt` attributes to conform CommonMark spec.
   * Don't try to use it! Spec requires to show `alt` content with stripped markup,
   * instead of simple escaping.
   *
   * @param tokens list of block tokens to render
   * @param options params of parser instance
   * @param env additional data from parsed input (references, for example)
   */
  renderInlineAsText(tokens: Token[], options: RenderOptions, env?: any): string {
    let result = ''

    for (let i = 0, len = tokens.length; i < len; i++) {
      switch (tokens[i].type) {
        case 'text':
          result += tokens[i].content
          break
        case 'image':
          result += this.renderInlineAsText(tokens[i].children!, options, env)
          break
        case 'html_inline':
        case 'html_block':
          result += tokens[i].content
          break
        case 'softbreak':
        case 'hardbreak':
          result += '\n'
          break
        default:
        // all other tokens are skipped
      }
    }

    return result
  }

  /**
   * Takes token stream and generates HTML. Probably, you will never need to call
   * this method directly.
   *
   * @param tokens list of block tokens to render
   * @param options params of parser instance
   * @param env additional data from parsed input (references, for example)
   */
  render(tokens: Token[], options: RenderOptions, env?: any): string {
    let result = ''
    const rules = this.rules

    for (let i = 0, len = tokens.length; i < len; i++) {
      const type = tokens[i].type

      if (type === 'inline') {
        result += this.renderInline(tokens[i].children!, options, env)
      } else {
        const rule = rules[type]
        if (rule) {
          const _result = rule(tokens, i, options, env, this)
          if (isPromiseLike<string>(_result))
            throw new Error('Renderer.render: async rule detected, use renderAsync()')
          result += _result
        } else {
          result += this.renderToken(tokens, i, options, env)
        }
      }
    }

    return result
  }

  /**
   * Async version of {@link Renderer.renderInline}. Runs all render rules in parallel
   * (Promise.all) and preserves output order.
   */
  async renderInlineAsync(tokens: Token[], options: RenderOptions, env?: any): Promise<string> {
    const tasks: Array<Promise<string>> = []
    const rules = this.rules

    for (let i = 0, len = tokens.length; i < len; i++) {
      const type = tokens[i].type
      const rule = rules[type]

      if (rule) {
        tasks.push(Promise.resolve(rule(tokens, i, options, env, this)))
      } else {
        tasks.push(Promise.resolve(this.renderToken(tokens, i, options, env)))
      }
    }

    const parts = await Promise.all(tasks)
    return parts.join('')
  }

  /**
   * Async version of {@link Renderer.render}. Runs all render rules in parallel
   * (Promise.all) and preserves output order.
   */
  async renderAsync(tokens: Token[], options: RenderOptions, env?: any): Promise<string> {
    const tasks: Array<Promise<string>> = []
    const rules = this.rules

    for (let i = 0, len = tokens.length; i < len; i++) {
      const tok = tokens[i]
      const type = tok.type

      if (type === 'inline') {
        tasks.push(this.renderInlineAsync(tok.children!, options, env))
      } else {
        const rule = rules[type]
        if (rule) {
          tasks.push(Promise.resolve(rule(tokens, i, options, env, this)))
        } else {
          tasks.push(Promise.resolve(this.renderToken(tokens, i, options, env)))
        }
      }
    }

    const parts = await Promise.all(tasks)
    return parts.join('')
  }
}
