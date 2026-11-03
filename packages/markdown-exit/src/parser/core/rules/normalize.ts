// Normalize input string

import type StateCore from '../state_core'

// https://spec.commonmark.org/0.29/#line-ending
const UNNORMALIZED_NEWLINE_RE = /\r\n?/g
const NULL_RE = /\0/g

export default function normalize(state: StateCore) {
  let str = state.src
  const hasCR = str.includes('\r')
  const hasNull = str.includes('\0')

  if (!hasCR && !hasNull)
    return

  // Normalize newlines
  if (hasCR) {
    str = str.replace(UNNORMALIZED_NEWLINE_RE, '\n')
  }

  // Replace NULL characters
  if (hasNull) {
    str = str.replace(NULL_RE, '\uFFFD')
  }

  state.src = str
}
