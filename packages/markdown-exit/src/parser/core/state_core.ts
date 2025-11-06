// Core state object
//

import type { Parser } from '..'
import type { MarkdownExitEnv } from '../../types/shared'
import { Token } from '../../token'

export default class StateCore<T extends Parser = Parser> {
  src: string
  env: MarkdownExitEnv
  tokens: Token[] = []
  inlineMode: boolean = false

  /**
   * link to parser instance
   */
  md: T

  constructor(src: string, md: T, env: MarkdownExitEnv) {
    this.src = src
    this.env = env
    this.md = md
  }

  // re-export Token class to use in core rules
  Token = Token
}
