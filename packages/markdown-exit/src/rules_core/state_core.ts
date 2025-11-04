// Core state object
//

import type { MarkdownExit } from '..'
import type { MarkdownExitEnv } from '../types/shared'
import { Token } from '../token'

export default class StateCore {
  src: string
  env: MarkdownExitEnv
  tokens: Token[] = []
  inlineMode: boolean = false

  /**
   * link to parser instance
   */
  md: MarkdownExit

  constructor(src: string, md: MarkdownExit, env: MarkdownExitEnv) {
    this.src = src
    this.env = env
    this.md = md
  }

  // re-export Token class to use in core rules
  Token = Token
}
