// Parse backticks

import type StateInline from '../state_inline'

// Position of the last backtick run of each length. Derived from the string in
// one pass, so unlike an incremental cache it never depends on how the parser
// walks it, and stays valid across lookaheads and narrowed ranges.
function buildLastRuns(src: string) {
  const lastRuns: Record<string, number> = {}
  let pos = 0

  while (true) {
    pos = src.indexOf('`', pos)
    if (pos === -1)
      break

    const start = pos
    while (src.charCodeAt(++pos) === 0x60/* ` */) {
      // scan run length
    }
    lastRuns[pos - start] = start
  }

  return lastRuns
}

export default function backtick(state: StateInline, silent: boolean) {
  const start = state.pos
  const src = state.src

  if (src.charCodeAt(start) !== 0x60/* ` */)
    return false

  const max = state.posMax
  let pos = start + 1

  // scan marker length
  while (pos < max && src.charCodeAt(pos) === 0x60/* ` */) {
    pos++
  }

  const marker = src.slice(start, pos)
  const openerLength = marker.length

  if (!state.backticksScanned) {
    state.backticks = buildLastRuns(src)
    state.backticksScanned = true
  }

  // Nothing of the same length left in the string, so no closer can exist
  if ((state.backticks[openerLength] ?? -1) >= pos) {
    let matchEnd = pos

    while (true) {
      const matchStart = src.indexOf('`', matchEnd)
      if (matchStart === -1 || matchStart >= max)
        break

      // Measure the whole run, not just its part inside the current range,
      // otherwise a run straddling `max` would be mistaken for a shorter one
      matchEnd = matchStart + 1
      while (src.charCodeAt(matchEnd) === 0x60/* ` */) {
        matchEnd++
      }

      if (matchEnd > max)
        break

      if (matchEnd - matchStart === openerLength) {
        if (!silent) {
          const token = state.push('code_inline', 'code', 0)
          token.markup = marker
          let content = src.slice(pos, matchStart).replace(/\n/g, ' ')

          // Strip one space from each side, unless the content is all spaces
          if (content.startsWith(' ') && content.endsWith(' ') && /[^ ]/.test(content)) {
            content = content.slice(1, -1)
          }

          token.content = content
        }
        state.pos = matchEnd
        return true
      }
    }
  }

  if (!silent)
    state.pending += marker
  state.pos = pos
  return true
}
