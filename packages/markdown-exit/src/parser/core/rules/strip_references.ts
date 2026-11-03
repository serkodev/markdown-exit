// Drop `reference_definition` tokens to keep the stream backward compatible
//
// Those tokens mark places link definitions took in the source. They are new,
// and plugins walking block tokens may not expect them, so by default the
// stream stays as it always was. Disable this rule to opt in.
//

import type StateCore from '../state_core'

export default function strip_references(state: StateCore) {
  const tokens = state.tokens
  let last = 0

  for (let curr = 0; curr < tokens.length; curr++) {
    if (tokens[curr].type === 'reference_definition')
      continue

    if (curr !== last)
      tokens[last] = tokens[curr]

    last++
  }

  if (tokens.length !== last) {
    tokens.length = last
  }
}
