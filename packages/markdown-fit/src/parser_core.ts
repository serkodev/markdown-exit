/**
 * internal
 * class Core
 *
 * Top-level rules executor. Glues block/inline parsers and does intermediate
 * transformations.
 */

import Ruler from './ruler'
import r_block from './rules_core/block'

import r_inline from './rules_core/inline'
import r_linkify from './rules_core/linkify'
import r_normalize from './rules_core/normalize'
import r_replacements from './rules_core/replacements'
import r_smartquotes from './rules_core/smartquotes'
import StateCore from './rules_core/state_core'
import r_text_join from './rules_core/text_join'

const _rules = [
  ['normalize', r_normalize],
  ['block', r_block],
  ['inline', r_inline],
  ['linkify', r_linkify],
  ['replacements', r_replacements],
  ['smartquotes', r_smartquotes],
  // `text_join` finds `text_special` tokens (for escape sequences)
  // and joins them with the rest of the text
  ['text_join', r_text_join],
]

/**
 * new Core()
 */
function Core() {
  /**
   * Core#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of core rules.
   */
  this.ruler = new Ruler()

  for (let i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1])
  }
}

/**
 * Core.process(state)
 *
 * Executes core chain rules.
 */
Core.prototype.process = function (state) {
  const rules = this.ruler.getRules('')

  for (let i = 0, l = rules.length; i < l; i++) {
    rules[i](state)
  }
}

Core.prototype.State = StateCore

export default Core
