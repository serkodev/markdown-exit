// Core state object
//

import type { MarkdownExit } from '..'
import Token from '../token'

export default class StateCore {
  src: string
  env: any
  tokens: Token[] = []
  inlineMode: boolean = false

  /**
   * link to parser instance
   */
  md: MarkdownExit

  constructor(src: string, md: MarkdownExit, env: any) {
    this.src = src
    this.env = env
    this.md = md
  }

  // re-export Token class to use in core rules
  Token = Token
}
