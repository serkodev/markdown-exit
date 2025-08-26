// Core state object
//

import type { MarkdownFit } from '..'
import Token from '../token'

export default class StateCore {
  src: string
  env: any
  tokens: Token[] = []
  inlineMode: boolean = false

  /**
   * link to parser instance
   */
  md: MarkdownFit

  constructor(src: string, md: MarkdownFit, env: any) {
    this.src = src
    this.env = env
    this.md = md
  }

  // re-export Token class to use in core rules
  Token = Token
}
