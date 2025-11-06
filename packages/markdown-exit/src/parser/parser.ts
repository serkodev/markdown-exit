import type { Token } from '../token'
import type { MarkdownExitEnv } from '../types/shared'
import LinkifyIt from 'linkify-it'
import ParserBlock from './block/parser_block'
import ParserCore from './core/parser_core'
import { helpers } from './helpers'
import ParserInline from './inline/parser_inline'
import { normalizeLink, normalizeLinkText, validateLink } from './utils/link'

export interface ParserOptions {
  /**
   * Set `true` to enable HTML tags in source. Be careful!
   * That's not safe! You may need external sanitizer to protect output from XSS.
   * It's better to extend features via plugins, instead of enabling HTML.
   * @default false
   */
  html?: boolean

  /**
   * Set `true` to autoconvert URL-like text to links.
   * @default false
   */
  linkify?: boolean

  /**
   * Set `true` to enable [some language-neutral replacement](https://github.com/serkodev/markdown-exit/tree/main/packages/markdown-exit/src/rules_core/replacements.ts) +
   * quotes beautification (smartquotes).
   * @default false
   */
  typographer?: boolean

  /**
   * Double + single quotes replacement
   * pairs, when typographer enabled and smartquotes on. For example, you can
   * use `'«»„“'` for Russian, `'„“‚‘'` for German, and
   * `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (including nbsp).
   * @default '“”‘’'
   */
  quotes?: string | string[]

  /**
   * Internal protection, recursion limit
   */
  maxNesting?: number
}

export const defaultOptions: Required<ParserOptions> = {
  // Enable HTML tags in source
  html: false,

  // autoconvert URL-like texts to links
  linkify: false,

  // Enable some language-neutral replacements + quotes beautification
  typographer: false,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Could be either a String or an Array.
  //
  // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
  // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
  quotes: '\u201C\u201D\u2018\u2019', /* “”‘’ */

  // Internal protection, recursion limit
  maxNesting: 100,
}

export class Parser {
  /**
   * Instance of {@link ParserInline}. You may need it to add new rules when writing plugins.
   */
  inline: ParserInline<typeof this> = new ParserInline()

  /**
   * Instance of {@link ParserBlock}. You may need it to add new rules when writing plugins.
   */
  block: ParserBlock<typeof this> = new ParserBlock()

  /**
   * Instance of {@link Core} chain executor. You may need it to add new rules when writing plugins.
   */
  core: ParserCore<typeof this> = new ParserCore()

  /**
   * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
   * Used by [linkify](https://github.com/serkodev/markdown-exit/tree/main/packages/markdown-exit/src/rules_core/linkify.ts)
   * rule.
   */
  linkify: LinkifyIt = new LinkifyIt()

  /**
   * Link validation function. CommonMark allows too much in links. By default
   * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
   * except some embedded image types.
   *
   * You can change this behaviour:
   *
   * ```javascript
   * // enable everything
   * md.validateLink = () => true
   * ```
   */
  validateLink: (url: string) => boolean = validateLink

  /**
   * Function used to encode link url to a machine-readable format,
   * which includes url-encoding, punycode, etc.
   */
  normalizeLink: (url: string) => string = normalizeLink

  /**
   * Function used to decode link url to a human-readable format`
   */
  normalizeLinkText: (url: string) => string = normalizeLinkText

  /**
   * Link components parser functions, useful to write plugins. See details
   * [here](https://github.com/serkodev/markdown-exit/tree/main/packages/markdown-exit/src/helpers).
   */
  helpers = { ...helpers }

  options: Required<ParserOptions> = { ...defaultOptions }

  /**
   * Parse input string and returns list of block tokens (special token type
   * "inline" will contain list of inline tokens). You should not call this
   * method directly, until you write custom renderer (for example, to produce
   * AST).
   *
   * `env` is used to pass data between "distributed" rules and return additional
   * metadata like reference info, needed for the renderer. It also can be used to
   * inject data in specific cases. Usually, you will be ok to pass `{}`,
   * and then pass updated object to renderer.
   *
   * @param src source string
   * @param env environment sandbox
   */
  parse(src: string, env: MarkdownExitEnv = {}): Token[] {
    if (typeof src !== 'string') {
      throw new TypeError('Input data should be a String')
    }
    const state = new this.core.State(src, this, env)
    this.core.process(state)
    return state.tokens
  }

  /**
   * The same as {@link parse} but skip all block rules. It returns the
   * block tokens list with the single `inline` element, containing parsed inline
   * tokens in `children` property. Also updates `env` object.
   *
   * @param src source string
   * @param env environment sandbox
   */
  parseInline(src: string, env: MarkdownExitEnv = {}): Token[] {
    const state = new this.core.State(src, this, env)
    state.inlineMode = true
    this.core.process(state)
    return state.tokens
  }
}
