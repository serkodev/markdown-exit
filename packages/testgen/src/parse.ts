export interface Fixture {
  type: string
  header: string
  first: {
    text: string
    range: number[]
  }
  second: {
    text: string
    range: number[]
  }
}

export interface ParseOptions {
  sep?: string | string[]
}

export interface ParseResult {
  meta?: string
  fixtures: Fixture[]
}

export function parse(input: string, { sep: _sep = ['.'] }: ParseOptions = {}): ParseResult | null {
  const lines = input.split(/\r?\n/g)
  const max = lines.length
  let min = 0
  let line = 0

  const result: ParseResult = {
    fixtures: [],
  }

  const sep: string[] = Array.isArray(_sep) ? _sep : _sep.split('')

  // Try to parse meta
  if (/^-{3,}$/.test(lines[0] || '')) {
    line++
    while (line < max && !/^-{3,}$/.test(lines[line])) {
      line++
    }

    // If meta end found - extract range
    if (line < max) {
      result.meta = lines.slice(1, line).join('\n')
      line++
      min = line
    } else {
      // if no meta closing - reset to start and try to parse data without meta
      line = 1
    }
  }

  let i
  let l

  // Scan fixtures
  while (line < max) {
    if (!sep.includes(lines[line])) {
      line++
      continue
    }

    const currentSep = lines[line]

    const fixture: Fixture = {
      type: currentSep,
      header: '',
      first: {
        text: '',
        range: [],
      },
      second: {
        text: '',
        range: [],
      },
    }

    line++
    let blockStart = line

    // seek end of first block
    while (line < max && lines[line] !== currentSep)
      line++

    if (line >= max)
      break

    fixture.first.text = fixLF(lines.slice(blockStart, line).join('\n'))
    fixture.first.range.push(blockStart, line)
    line++
    blockStart = line

    // seek end of second block
    while (line < max && lines[line] !== currentSep)
      line++
    if (line >= max)
      break

    fixture.second.text = fixLF(lines.slice(blockStart, line).join('\n'))
    fixture.second.range.push(blockStart, line)
    line++

    // Look back for header on 2 lines before texture blocks
    i = fixture.first.range[0] - 2
    while (i >= Math.max(min, fixture.first.range[0] - 3)) {
      l = lines[i]
      if (sep.includes(l))
        break

      if (l.trim().length) {
        fixture.header = l.trim()
        break
      }
      i--
    }

    result.fixtures.push(fixture)
  }

  return (result.meta || result.fixtures.length) ? result : null
}

function fixLF(str: string) {
  return str.length ? `${str}\n` : str
}
