// Normalize input string

import type StateCore from '../state_core'

// https://spec.commonmark.org/0.29/#line-ending
const NEWLINES_RE = /\r\n?|\n/g
const NULL_RE = /\0/g

export default function normalize(state: StateCore) {
  let str

  // Normalize newlines
  str = state.src.replace(NEWLINES_RE, '\n')

  // Replace NULL characters
  str = str.replace(NULL_RE, '\uFFFD')

  state.src = str
}
