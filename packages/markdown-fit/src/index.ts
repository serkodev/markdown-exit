/**
 * markdown-fit notes:
 * - TODO: call markdown-it without new
 */

// Main parser class

import type { Preset } from './types/preset'
import LinkifyIt from 'linkify-it'
import * as mdurl from 'mdurl'
import punycode from 'punycode.js'
import * as utils from './common/utils'
import * as helpers from './helpers/index'
import ParserBlock from './parser_block'
import ParserCore from './parser_core'
import ParserInline from './parser_inline'
import cfg_commonmark from './presets/commonmark'

import cfg_default from './presets/default'
import cfg_zero from './presets/zero'
import Renderer from './renderer'

/**
 * MarkdownIt provides named presets as a convenience to quickly
 * enable/disable active syntax rules and options for common use cases.
 *
 * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.js) -
 *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
 * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.js) -
 *   similar to GFM, used when no preset name given. Enables all available rules,
 *   but still without html, typographer & autolinker.
 * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.js) -
 *   all rules disabled. Useful to quickly setup your config via `.enable()`.
 *   For example, when you need only `bold` and `italic` markup and nothing else.
 */
export type PresetName = 'default' | 'zero' | 'commonmark'

export interface Options {
  /**
   * Set `true` to enable HTML tags in source. Be careful!
   * That's not safe! You may need external sanitizer to protect output from XSS.
   * It's better to extend features via plugins, instead of enabling HTML.
   * @default false
   */
  html?: boolean | undefined

  /**
   * Set `true` to add '/' when closing single tags
   * (`<br />`). This is needed only for full CommonMark compatibility. In real
   * world you will need HTML output.
   * @default false
   */
  xhtmlOut?: boolean | undefined

  /**
   * Set `true` to convert `\n` in paragraphs into `<br>`.
   * @default false
   */
  breaks?: boolean | undefined

  /**
   * CSS language class prefix for fenced blocks.
   * Can be useful for external highlighters.
   * @default 'language-'
   */
  langPrefix?: string | undefined

  /**
   * Set `true` to autoconvert URL-like text to links.
   * @default false
   */
  linkify?: boolean | undefined

  /**
   * Set `true` to enable [some language-neutral replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js) +
   * quotes beautification (smartquotes).
   * @default false
   */
  typographer?: boolean | undefined

  /**
   * Double + single quotes replacement
   * pairs, when typographer enabled and smartquotes on. For example, you can
   * use `'«»„“'` for Russian, `'„“‚‘'` for German, and
   * `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (including nbsp).
   * @default '“”‘’'
   */
  quotes?: string | string[]

  /**
   * Highlighter function for fenced code blocks.
   * Highlighter `function (str, lang, attrs)` should return escaped HTML. It can
   * also return empty string if the source was not changed and should be escaped
   * externally. If result starts with <pre... internal wrapper is skipped.
   * @default null
   */
  highlight?: ((str: string, lang: string, attrs: string) => string) | null | undefined

  /**
   * Internal protection, recursion limit
   */
  maxNesting?: number
}

const config: Record<string, Preset> = {
  default: cfg_default,
  zero: cfg_zero,
  commonmark: cfg_commonmark,
}

//
// This validator can prohibit more than really needed to prevent XSS. It's a
// tradeoff to keep code simple and to be secure by default.
//
// If you need different setup - override validator method as you wish. Or
// replace it with dummy function and use external sanitizer.
//

// eslint-disable-next-line regexp/no-unused-capturing-group
const BAD_PROTO_RE = /^(vbscript|javascript|file|data):/

// eslint-disable-next-line regexp/no-unused-capturing-group
const GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/

function validateLink(url: string) {
  // url should be normalized at this point, and existing entities are decoded
  const str = url.trim().toLowerCase()

  return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) : true
}

const RECODE_HOSTNAME_FOR = ['http:', 'https:', 'mailto:']

function normalizeLink(url: string) {
  const parsed = mdurl.parse(url, true)

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.includes(parsed.protocol)) {
      try {
        parsed.hostname = punycode.toASCII(parsed.hostname)
      } catch { /**/ }
    }
  }

  return mdurl.encode(mdurl.format(parsed))
}

function normalizeLinkText(url: string) {
  const parsed = mdurl.parse(url, true)

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.includes(parsed.protocol)) {
      try {
        parsed.hostname = punycode.toUnicode(parsed.hostname)
      } catch (er) { /**/ }
    }
  }

  // add '%' to exclude list because of https://github.com/markdown-it/markdown-it/issues/720
  return mdurl.decode(mdurl.format(parsed), `${mdurl.decode.defaultChars}%`)
}

export type PluginSimple = (md: MarkdownIt) => void
export type PluginWithOptions<T = any> = (md: MarkdownIt, options?: T) => void
export type PluginWithParams = (md: MarkdownIt, ...params: any[]) => void

/**
 * class MarkdownIt
 *
 * Main parser/renderer class.
 *
 * ##### Usage
 *
 * ```javascript
 * // node.js, "classic" way:
 * var MarkdownIt = require('markdown-it'),
 *     md = new MarkdownIt();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // node.js, the same, but with sugar:
 * var md = require('markdown-it')();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // browser without AMD, added to "window" on script load
 * // Note, there are no dash.
 * var md = window.markdownit();
 * var result = md.render('# markdown-it rulezz!');
 * ```
 *
 * Single line rendering, without paragraph wrap:
 *
 * ```javascript
 * var md = require('markdown-it')();
 * var result = md.renderInline('__markdown-it__ rulezz!');
 * ```
 */
class MarkdownIt {
  /**
   * Instance of {@link ParserInline}. You may need it to add new rules when
   * writing plugins. For simple rules control use {@link MarkdownIt.disable} and
   * {@link MarkdownIt.enable}.
   */
  inline: ParserInline = new ParserInline()

  /**
   * Instance of {@link ParserBlock}. You may need it to add new rules when
   * writing plugins. For simple rules control use {@link MarkdownIt.disable} and
   * {@link MarkdownIt.enable}.
   */
  block: ParserBlock = new ParserBlock()

  /**
   * Instance of {@link Core} chain executor. You may need it to add new rules when
   * writing plugins. For simple rules control use {@link MarkdownIt.disable} and
   * {@link MarkdownIt.enable}.
   */
  core: ParserCore = new ParserCore()

  /**
   * Instance of {@link Renderer}. Use it to modify output look. Or to add rendering
   * rules for new token types, generated by plugins.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * function myToken(tokens, idx, options, env, self) {
   *   //...
   *   return result;
   * };
   *
   * md.renderer.rules['my_token'] = myToken
   * ```
   *
   * See {@link Renderer} docs and [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js).
   */
  renderer: Renderer = new Renderer()

  /**
   * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
   * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/linkify.js)
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
   * var md = require('markdown-it')();
   * // enable everything
   * md.validateLink = function () { return true; }
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

  // Expose utils & helpers for easy acces from plugins

  /**
   * MarkdownIt#utils -> utils
   *
   * Assorted utility functions, useful to write plugins. See details
   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.mjs).
   */
  utils: typeof utils = utils

  /**
   * MarkdownIt#helpers -> helpers
   *
   * Link components parser functions, useful to write plugins. See details
   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/helpers).
   */
  helpers: typeof helpers = Object.assign({}, helpers)

  options: Options = {}

  // Overloads for constructor
  constructor()
  constructor(options: Options)
  constructor(presetName: PresetName, options?: Options)
  constructor(presetName?: PresetName | Options, options?: Options) {
    if (!options) {
      if (!utils.isString(presetName as any)) {
        options = (presetName as Options) || {}
        presetName = 'default' as PresetName
      }
    }

    this.configure(presetName as PresetName)

    if (options) { this.set(options) }
  }

  /**
   * chainable*
   *
   * Set parser options (in the same format as in constructor). Probably, you
   * will never need it, but you can change options after constructor call.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')()
   *             .set({ html: true, breaks: true })
   *             .set({ typographer: true });
   * ```
   *
   * __Note:__ To achieve the best possible performance, don't modify a
   * `markdown-it` instance options on the fly. If you need multiple configurations
   * it's best to create multiple instances and initialize each with separate
   * config.
   */
  set(options: Options): this {
    Object.assign(this.options, options)
    return this
  }

  /**
   * chainable*, *internal*
   *
   * Batch load of all options and compenent settings. This is internal method,
   * and you probably will not need it. But if you with - see available presets
   * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/lib/presets)
   *
   * We strongly recommend to use presets instead of direct config loads. That
   * will give better compatibility with next versions.
   */
  configure(presets: PresetName | Preset): this {
    const self = this

    if (utils.isString(presets)) {
      const presetName = presets
      presets = config[presetName]
      if (!presets) { throw new Error(`Wrong \`markdown-it\` preset "${presetName}", check name`) }
    }

    if (!presets) { throw new Error('Wrong `markdown-it` preset, can\'t be empty') }

    if (presets.options) { self.set(presets.options) }

    if (presets.components) {
      for (const name of Object.keys(presets.components)) {
        if (presets.components[name].rules) {
          self[name].ruler.enableOnly(presets.components[name].rules)
        }
        if (presets.components[name].rules2) {
          self[name].ruler2.enableOnly(presets.components[name].rules2)
        }
      }
    }
    return this
  }

  /**
   * chainable*
   *
   * Enable list or rules. It will automatically find appropriate components,
   * containing rules with given names. If rule not found, and `ignoreInvalid`
   * not set - throws exception.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')()
   *             .enable(['sub', 'sup'])
   *             .disable('smartquotes');
   * ```
   *
   * @param list rule name or list of rule names to enable
   * @param ignoreInvalid set `true` to ignore errors when rule not found.
   */
  enable(list: string | string[], ignoreInvalid?: boolean): this {
    let result: string[] = []

    if (!Array.isArray(list)) { list = [list] }

    const chains = ['core', 'block', 'inline'] as const
    for (const chain of chains) {
      result = result.concat(this[chain].ruler.enable(list, true))
    }

    result = result.concat(this.inline.ruler2.enable(list, true))

    const missed = list.filter((name) => { return !result.includes(name) })

    if (missed.length && !ignoreInvalid) {
      throw new Error(`MarkdownIt. Failed to enable unknown rule(s): ${missed}`)
    }

    return this
  }

  /**
   * chainable*
   *
   * The same as {@link MarkdownIt.enable}, but turn specified rules off.
   *
   * @param list rule name or list of rule names to disable.
   * @param ignoreInvalid set `true` to ignore errors when rule not found.
   */
  disable(list: string | string[], ignoreInvalid?: boolean): this {
    let result: string[] = []

    if (!Array.isArray(list)) { list = [list] }

    const chains = ['core', 'block', 'inline'] as const
    for (const chain of chains) {
      result = result.concat(this[chain].ruler.disable(list, true))
    }

    result = result.concat(this.inline.ruler2.disable(list, true))

    const missed = list.filter((name) => { return !result.includes(name) })

    if (missed.length && !ignoreInvalid) {
      throw new Error(`MarkdownIt. Failed to disable unknown rule(s): ${missed}`)
    }
    return this
  }

  /**
   * chainable*
   *
   * Load specified plugin with given params into current parser instance.
   * It's just a sugar to call `plugin(md, params)` with curring.
   *
   * ##### Example
   *
   * ```javascript
   * var iterator = require('markdown-it-for-inline');
   * var md = require('markdown-it')()
   *             .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
   *               tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
   *             });
   * ```
   */
  use(plugin: PluginSimple): this
  use<T = any>(plugin: PluginWithOptions<T>, options?: T): this
  use(plugin: PluginWithParams): this {
    const args = [this].concat(Array.prototype.slice.call(arguments, 1))
    plugin.apply(plugin, args)
    return this
  }

  /**
   * internal
   *
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
  parse(src: string, env?: any): any[] {
    if (typeof src !== 'string') {
      throw new TypeError('Input data should be a String')
    }

    const state = new this.core.State(src, this, env)

    this.core.process(state)

    return state.tokens
  }

  /**
   * Render markdown string into html. It does all magic for you :).
   *
   * `env` can be used to inject additional metadata (`{}` by default).
   * But you will not need it with high probability. See also comment
   * in {@link MarkdownIt.parse}.
   *
   * @param src source string
   * @param env environment sandbox
   */
  render(src: string, env?: any): string {
    env = env || {}

    return this.renderer.render(this.parse(src, env), this.options, env)
  }

  /**
   * internal*
   *
   * The same as {@link MarkdownIt.parse} but skip all block rules. It returns the
   * block tokens list with the single `inline` element, containing parsed inline
   * tokens in `children` property. Also updates `env` object.
   *
   * @param src source string
   * @param env environment sandbox
   */
  parseInline(src: string, env?: any): any[] {
    const state = new this.core.State(src, this, env)

    state.inlineMode = true
    this.core.process(state)

    return state.tokens
  }

  /**
   * Similar to {@link MarkdownIt.render} but for single paragraph content. Result
   * will NOT be wrapped into `<p>` tags.
   *
   * @param src source string
   * @param env environment sandbox
   */
  renderInline(src: string, env?: any): string {
    env = env || {}

    return this.renderer.render(this.parseInline(src, env), this.options, env)
  }
}

export default MarkdownIt
