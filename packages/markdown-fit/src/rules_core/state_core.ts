// Core state object
//

import type { MarkdownIt } from '..'
import Token from '../token'

export default class StateCore {
  src: string
  env: any
  tokens: Token[] = []
  inlineMode: boolean = false

  /**
   * link to parser instance
   */
  md: MarkdownIt

  constructor(src: string, md: MarkdownIt, env: any) {
    this.src = src
    this.env = env
    this.md = md
  }

  // re-export Token class to use in core rules
  Token = Token
}
