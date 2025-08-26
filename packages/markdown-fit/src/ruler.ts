export interface RuleOptions {
  /**
   * array with names of "alternate" chains.
   */
  alt?: string[]
}

/**
 * Helper class, used by {@link MarkdownIt#core}, {@link MarkdownIt#block} and
 * {@link MarkdownIt#inline} to manage sequences of functions (rules):
 *
 * - keep rules in defined order
 * - assign the name to each rule
 * - enable/disable rules
 * - add/replace rules
 * - allow assign rules to additional named chains (in the same)
 * - caching lists of active rules
 *
 * You will not need use this class directly until write plugins. For simple
 * rules control use {@link MarkdownIt.disable}, {@link MarkdownIt.enable} and
 * {@link MarkdownIt.use}.
 */
export default class Ruler<T> {
  private __rules__: Array<{
    name: string
    enabled: boolean
    fn: T
    alt: string[]
  }>

  private __cache__: Record<string, T[]> | null

  constructor() {
    // List of added rules. Each element is:
    //
    // {
    //   name: XXX,
    //   enabled: Boolean,
    //   fn: Function(),
    //   alt: [ name2, name3 ]
    // }
    //
    this.__rules__ = []

    // Cached rule chains.
    //
    // First level - chain name, '' for default.
    // Second level - diginal anchor for fast filtering by charcodes.
    //
    this.__cache__ = null
  }

  // Helper methods, should not be used directly

  // Find rule index by name
  //
  private __find__(name: string): number {
    for (let i = 0; i < this.__rules__.length; i++) {
      if (this.__rules__[i].name === name) {
        return i
      }
    }
    return -1
  }

  // Build rules lookup cache
  //
  private __compile__(): void {
    const chains = ['']

    // collect unique names
    for (const rule of this.__rules__) {
      if (!rule.enabled)
        continue

      for (const altName of rule.alt) {
        if (!chains.includes(altName)) {
          chains.push(altName)
        }
      }
    }

    this.__cache__ = {}

    for (const chain of chains) {
      this.__cache__[chain] = []
      for (const rule of this.__rules__) {
        if (!rule.enabled)
          continue

        if (chain && !rule.alt.includes(chain))
          continue

        this.__cache__[chain].push(rule.fn)
      }
    }
  }

  /**
   * Ruler.at(name, fn [, options])
   * - name (String): rule name to replace.
   * - fn (Function): new rule function.
   * - options (Object): new rule options (not mandatory).
   *
   * Replace rule by name with new function & options. Throws error if name not
   * found.
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * Replace existing typographer replacement rule with new one:
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.core.ruler.at('replacements', function replace(state) {
   *   //...
   * });
   * ```
   */
  at(name: string, fn: T, options: RuleOptions = {}): void {
    const index = this.__find__(name)
    const opt = options || {}

    if (index === -1)
      throw new Error(`Parser rule not found: ${name}`)

    this.__rules__[index].fn = fn
    this.__rules__[index].alt = opt.alt || []
    this.__cache__ = null
  }

  /**
   * Ruler.before(beforeName, ruleName, fn [, options])
   * - beforeName (String): new rule will be added before this one.
   * - ruleName (String): name of added rule.
   * - fn (Function): rule function.
   * - options (Object): rule options (not mandatory).
   *
   * Add new rule to chain before one with given name. See also
   * [[Ruler.after]], [[Ruler.push]].
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
   *   //...
   * });
   * ```
   */
  before(beforeName: string, ruleName: string, fn: T, options?: RuleOptions): void {
    const index = this.__find__(beforeName)
    const opt = options || {}

    if (index === -1)
      throw new Error(`Parser rule not found: ${beforeName}`)

    this.__rules__.splice(index, 0, {
      name: ruleName,
      enabled: true,
      fn,
      alt: opt.alt || [],
    })

    this.__cache__ = null
  }

  /**
   * Ruler.after(afterName, ruleName, fn [, options])
   * - afterName (String): new rule will be added after this one.
   * - ruleName (String): name of added rule.
   * - fn (Function): rule function.
   * - options (Object): rule options (not mandatory).
   *
   * Add new rule to chain after one with given name. See also
   * [[Ruler.before]], [[Ruler.push]].
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.inline.ruler.after('text', 'my_rule', function replace(state) {
   *   //...
   * });
   * ```
   */
  after(afterName: string, ruleName: string, fn: T, options?: RuleOptions): void {
    const index = this.__find__(afterName)
    const opt = options || {}

    if (index === -1)
      throw new Error(`Parser rule not found: ${afterName}`)

    this.__rules__.splice(index + 1, 0, {
      name: ruleName,
      enabled: true,
      fn,
      alt: opt.alt || [],
    })

    this.__cache__ = null
  }

  /**
   * Ruler.push(ruleName, fn [, options])
   * - ruleName (String): name of added rule.
   * - fn (Function): rule function.
   * - options (Object): rule options (not mandatory).
   *
   * Push new rule to the end of chain. See also
   * [[Ruler.before]], [[Ruler.after]].
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.core.ruler.push('my_rule', function replace(state) {
   *   //...
   * });
   * ```
   */
  push(ruleName: string, fn: T, options?: RuleOptions): void {
    const opt = options || {}

    this.__rules__.push({
      name: ruleName,
      enabled: true,
      fn,
      alt: opt.alt || [],
    })

    this.__cache__ = null
  }

  /**
   * Ruler.enable(list [, ignoreInvalid]) -> Array
   * - list (String|Array): list of rule names to enable.
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Enable rules with given names. If any rule name not found - throw Error.
   * Errors can be disabled by second param.
   *
   * Returns list of found rule names (if no exception happened).
   *
   * See also [[Ruler.disable]], [[Ruler.enableOnly]].
   */
  enable(list: string | string[], ignoreInvalid?: boolean): string[] {
    if (!Array.isArray(list))
      list = [list]

    const result: string[] = []

    // Search by name and enable
    for (const name of list) {
      const idx = this.__find__(name)

      if (idx < 0) {
        if (ignoreInvalid)
          continue
        throw new Error(`Rules manager: invalid rule name ${name}`)
      }
      this.__rules__[idx].enabled = true
      result.push(name)
    }

    this.__cache__ = null
    return result
  }

  /**
   * Ruler.enableOnly(list [, ignoreInvalid])
   * - list (String|Array): list of rule names to enable (whitelist).
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Enable rules with given names, and disable everything else. If any rule name
   * not found - throw Error. Errors can be disabled by second param.
   *
   * See also [[Ruler.disable]], [[Ruler.enable]].
   */
  enableOnly(list: string | string[], ignoreInvalid?: boolean): void {
    if (!Array.isArray(list))
      list = [list]

    for (const rule of this.__rules__)
      rule.enabled = false

    this.enable(list, ignoreInvalid)
  }

  /**
   * Ruler.disable(list [, ignoreInvalid]) -> Array
   * - list (String|Array): list of rule names to disable.
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Disable rules with given names. If any rule name not found - throw Error.
   * Errors can be disabled by second param.
   *
   * Returns list of found rule names (if no exception happened).
   *
   * See also [[Ruler.enable]], [[Ruler.enableOnly]].
   */
  disable(list: string | string[], ignoreInvalid?: boolean): string[] {
    if (!Array.isArray(list))
      list = [list]

    const result: string[] = []

    // Search by name and disable
    for (const name of list) {
      const idx = this.__find__(name)

      if (idx < 0) {
        if (ignoreInvalid)
          continue
        throw new Error(`Rules manager: invalid rule name ${name}`)
      }
      this.__rules__[idx].enabled = false
      result.push(name)
    }

    this.__cache__ = null
    return result
  }

  /**
   * Ruler.getRules(chainName) -> Array
   *
   * Return array of active functions (rules) for given chain name. It analyzes
   * rules configuration, compiles caches if not exists and returns result.
   *
   * Default chain name is `''` (empty string). It can't be skipped. That's
   * done intentionally, to keep signature monomorphic for high speed.
   */
  getRules(chainName: string): T[] {
    if (this.__cache__ === null) {
      this.__compile__()
    }

    // Chain can be empty, if rules disabled. But we still have to return Array.
    return this.__cache__![chainName] || []
  }
}
