/**
 * markdown-exit notes:
 * - remove md if it's unused
 */

// Inline parser state

import type { MarkdownExit } from '..'
import type { Nesting } from '../token'
import type { MarkdownExitEnv } from '../types/shared'
import { isMdAsciiPunct, isPunctChar, isWhiteSpace } from '../common/utils'
import Token from '../token'

export interface Scanned {
  can_open: boolean
  can_close: boolean
  length: number
}

export interface Delimiter {
  marker: number
  length: number
  token: number
  end: number
  open: boolean
  close: boolean
}

export interface TokenMeta {
  delimiters: Delimiter[]
}

export default class StateInline {
  src: string
  env: MarkdownExitEnv
  md: MarkdownExit
  tokens: Token[]
  tokens_meta: Array<TokenMeta | null>

  pos: number = 0
  posMax: number
  level: number = 0
  pending: string = ''
  pendingLevel: number = 0

  /**
   * Stores { start: end } pairs. Useful for backtrack
   * optimization of pairs parse (emphasis, strikes).
   */
  cache: Record<string, number> = {}

  /**
   * List of emphasis-like delimiters for current tag
   */
  delimiters: Delimiter[] = []

  /**
   * Stack of delimiter lists for upper level tags
   */
  _prev_delimiters: Delimiter[][] = []

  /**
   * backtick length => last seen position
   */
  backticks: Record<string, number> = {}
  backticksScanned: boolean = false

  /**
   * Counter used to disable inline linkify-it execution
   * inside <a> and markdown links
   */
  linkLevel: number = 0

  constructor(src: string, md: MarkdownExit, env: MarkdownExitEnv, outTokens: Token[]) {
    this.src = src
    this.env = env
    this.md = md
    this.tokens = outTokens
    this.tokens_meta = Array.from({ length: outTokens.length })
    this.posMax = this.src.length
  }

  /**
   * Flush pending text
   */
  pushPending(): Token {
    const token = new Token('text', '', 0)
    token.content = this.pending
    token.level = this.pendingLevel
    this.tokens.push(token)
    this.pending = ''
    return token
  }

  /**
   * Push new token to "stream".
   * If pending text exists - flush it as text token
   */
  push(type: string, tag: string, nesting: Nesting): Token {
    if (this.pending) {
      this.pushPending()
    }

    const token = new Token(type, tag, nesting)
    let token_meta: TokenMeta | null = null

    if (nesting < 0) {
      // closing tag
      this.level--
      this.delimiters = this._prev_delimiters.pop() ?? []
    }

    token.level = this.level

    if (nesting > 0) {
      // opening tag
      this.level++
      this._prev_delimiters.push(this.delimiters)
      this.delimiters = []
      token_meta = { delimiters: this.delimiters }
    }

    this.pendingLevel = this.level
    this.tokens.push(token)
    this.tokens_meta.push(token_meta)
    return token
  }

  /**
   * Scan a sequence of emphasis-like markers, and determine whether
   * it can start an emphasis sequence or end an emphasis sequence.
   *
   *  - start - position to scan from (it should point at a valid marker);
   *  - canSplitWord - determine if these markers can be found inside a word
   */
  scanDelims(start: number, canSplitWord: boolean) {
    const max = this.posMax
    const marker = this.src.charCodeAt(start)

    // treat beginning of the line as a whitespace
    const lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 0x20

    let pos = start
    while (pos < max && this.src.charCodeAt(pos) === marker) {
      pos++
    }

    const count = pos - start

    // treat end of the line as a whitespace
    const nextChar = pos < max ? this.src.charCodeAt(pos) : 0x20

    const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar))
    const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar))

    const isLastWhiteSpace = isWhiteSpace(lastChar)
    const isNextWhiteSpace = isWhiteSpace(nextChar)

    const left_flanking =
      !isNextWhiteSpace && (!isNextPunctChar || isLastWhiteSpace || isLastPunctChar)
    const right_flanking =
      !isLastWhiteSpace && (!isLastPunctChar || isNextWhiteSpace || isNextPunctChar)

    const can_open = left_flanking && (canSplitWord || !right_flanking || isLastPunctChar)
    const can_close = right_flanking && (canSplitWord || !left_flanking || isNextPunctChar)

    return { can_open, can_close, length: count }
  }

  // re-export Token class to use in block rules
  Token = Token
}
