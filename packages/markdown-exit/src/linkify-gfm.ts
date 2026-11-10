import type { LinkifyIt } from 'linkify-it'
import type { MarkdownExit } from './core'

// GFM autolink literals in plain text, found the way remark-gfm finds them:
// micromark-extension-gfm-autolink-literal 2.1.0, as published, reads `www.`, `http(s)://`
// and email literals while it parses, and mdast-util-gfm-autolink-literal
// 2.1.0 then searches the text between the links it found for what it
// missed, `mailto:` and `xmpp:` included. Both steps are here, on the text
// as one run with no other markdown in it. Characters are UTF-16 code units,
// as micromark reads them.

interface Link {
  /** `""` for a `www.` link, `http:` or `https:`, `mailto:` for an email, or `xmpp:`. */
  schema: string
  /** Where the link starts in the text. */
  index: number
  /** Where it ends. */
  lastIndex: number
  /** The link as written. */
  text: string
  /** Where it points: `http://` before `www.`, `mailto:` before an email. */
  url: string
}

const PUNCTUATION = /[\p{P}\p{S}]/u
const WHITESPACE = /\s/

// micromark's character classes, for a code unit, with -1 for no character.
const alpha = (c: number) => (c | 32) >= 97 && (c | 32) <= 122
const alnum = (c: number) => alpha(c) || (c >= 48 && c <= 57)
const atext = (c: number) => alnum(c) || c === 43 || c === 45 || c === 46 || c === 95
// A space, a tab or a line ending.
const space = (c: number) => c === 32 || c === 9 || c === 10 || c === 13
const whitespace = (c: number) => c > -1 && WHITESPACE.test(String.fromCharCode(c))
const punctuation = (c: number) => c > -1 && PUNCTUATION.test(String.fromCharCode(c))
const end = (c: number) => c < 0 || space(c) || whitespace(c)

// Trailing punctuation, which leaves a link when nothing but an end follows.
// `&` is one too when it starts a character reference, and `]` when an end,
// `(` or `[` follows it.
const TRAIL = new Set([33, 34, 39, 41, 42, 44, 46, 58, 59, 63, 95, 126])
// What a path checks for a trail at: those, `&`, `<` and `]`.
const PATH_TRAIL = new Set([...TRAIL, 38, 60, 93])

// The text being read. Nothing here calls out, so one at a time is enough.
let text = ''
let n = 0
const at = (i: number) => (i < n ? text.charCodeAt(i) : -1)

// Where the last trail that wasn't one stopped: a trail checked from before
// it, in the same domain or path, stops there too.
let failed = -1

/** Whether the punctuation at `i`, and what follows, is a trail before an end. */
function trail(i: number): boolean {
  if (i < failed)
    return false
  for (;;) {
    const c = at(i)
    if (TRAIL.has(c)) {
      i++
    } else if (c === 38) {
      if (!alpha(at(++i)))
        break
      while (alpha(at(i))) i++
      if (at(i) !== 59)
        break
      i++
    } else if (c === 93) {
      const d = at(++i)
      if (d === 40 || d === 91 || end(d))
        return true
    } else if (c === 60 || end(c)) {
      return true
    } else {
      break
    }
  }
  failed = i
  return false
}

/**
 * A domain from `i`: where it ends, or -1. The last two labels can't have an
 * underscore, and it needs one character.
 */
function domain(i: number): number {
  let last = false
  let before = false
  let seen = false
  failed = -1
  for (;;) {
    const c = at(i)
    if (c === 46 || c === 95) {
      if (trail(i))
        break
      if (c === 95)
        last = true
      else [before, last] = [last, false]
    } else if (end(c) || (c !== 45 && punctuation(c))) {
      break
    } else {
      seen = true
    }
    i++
  }
  return before || last || !seen ? -1 : i
}

/** A path from `i`, to its end. A closing parenthesis stays while it closes one opened in it. */
function path(i: number): number {
  let open = 0
  let closed = 0
  failed = -1
  for (;;) {
    const c = at(i)
    if (c === 40) {
      open++
    } else if (c === 41 && closed < open) {
      closed++
    } else if (PATH_TRAIL.has(c)) {
      if (trail(i))
        return i
      if (c === 41)
        closed++
    } else if (end(c)) {
      return i
    }
    i++
  }
}

/** An `http://` or `https://` link at `i`: its schema and end, or undefined. */
function protocol(i: number): [string, number] | undefined {
  let j = i
  while (alpha(at(j)) && j - i < 5) j++
  const scheme = text.slice(i, j).toLowerCase()
  if (
    (scheme !== 'http' && scheme !== 'https') ||
    at(j) !== 58 ||
    at(j + 1) !== 47 ||
    at(j + 2) !== 47
  ) {
    return
  }
  const c = at((j += 3))
  const host = c < 32 || c === 127 || space(c) || whitespace(c) || punctuation(c) ? -1 : domain(j)
  return host < 0 ? undefined : [`${scheme}:`, path(host)]
}

// mdast-util-gfm-autolink-literal's searches, in its order.
const URL = /(?<![\da-z])(https?:\/\/|www(?=\.))([\w-]*\.[\w\-.]*)([^\t\n\r ]*)/gi
const XMPP =
  /(?<![\w+\-.@])xmpp:([\w+\-.]+)@([\w-]+(?:\.[\w-]+)+)(\/(?:[\w\-/]|\.(?=[\dA-Za-z]))*)?/g
const MAILTO = /(?<![\w+\-.@])mailto:([\w+\-.]+)@([\w-]+(?:\.[\w-]+)+)/g
const EMAIL = /(?<![\w+\-.]|(?:^|[^\d@A-Za-z])(?:mailto|xmpp):)([\w+\-.]+)@([\w-]+(?:\.[\w-]+)+)/g
const SEARCHES = [URL, XMPP, MAILTO, EMAIL]

const badLabel = (label = '') => !!label && (label.includes('_') || !/[\dA-Z]/i.test(label))

/** The URL without trailing punctuation, keeping closing parentheses while it has more opening ones. */
function trim(url: string): string {
  let i = url.length
  while (i > 0 && '!"&\'),.:;<>?]}'.includes(url[i - 1]!)) i--
  if (i === url.length)
    return url
  let rest = url.slice(i)
  url = url.slice(0, i)
  const open = url.split('(').length - 1
  let closed = url.split(')').length - 1
  for (let close = rest.indexOf(')'); close !== -1 && open > closed; close = rest.indexOf(')')) {
    url += rest.slice(0, close + 1)
    rest = rest.slice(close + 1)
    closed++
  }
  return url
}

/**
 * Every GFM autolink literal in `value`, in order. `www` and `email` set
 * whether `www.` links and emails without `mailto:` count. With `first`, it
 * stops at the first link it finds, which says whether there is one.
 */
function find(value: string, www = true, email = true, first = false): Link[] {
  text = value
  n = value.length
  const links: Link[] = []
  const add = (schema: string, index: number, lastIndex: number, prefix = '') => {
    const raw = value.slice(index, lastIndex)
    links.push({ schema, index, lastIndex, text: raw, url: prefix + raw })
  }
  // What each kind of link needs somewhere in the text, so text without it
  // isn't searched for that kind.
  const hasAt = value.includes('@')
  const hasScheme = value.includes('://')
  const hasWww = www && /www\./i.test(value)
  email &&= hasAt

  // micromark's step, at every position: an email that starts with a
  // letter, digit, `+`, `-`, `.` or `_` after none of those or `/`, then
  // `http(s)://` at an `h` not after a letter, or `www.` at a `w` at the
  // start or after whitespace, `(`, `*`, `_`, `[`, `]` or `~`.
  for (let i = 0; i < (email || hasScheme || hasWww ? n : 0);) {
    const c = at(i)
    const previous = i ? at(i - 1) : -1
    let stop = -1
    if (email && atext(c) && !atext(previous) && previous !== 47) {
      let j = i
      while (atext(at(j))) j++
      if (at(j) === 64) {
        let data = false
        let dot = false
        for (let d = at(++j); ; d = at(++j)) {
          if (d === 46 && alnum(at(j + 1)))
            dot = true
          else if (d === 45 || d === 95 || alnum(d))
            data = true
          else break
        }
        if (data && dot && alpha(at(j - 1)))
          add('mailto:', i, (stop = j), 'mailto:')
      }
    }
    if (stop < 0 && hasScheme && (c | 32) === 104 && !alpha(previous)) {
      const found = protocol(i)
      if (found)
        add(found[0], i, (stop = found[1]))
    }
    if (
      stop < 0 &&
      hasWww &&
      (c | 32) === 119 &&
      (at(i + 1) | 32) === 119 &&
      (at(i + 2) | 32) === 119 &&
      at(i + 3) === 46 &&
      i + 4 < n &&
      (previous < 0 || space(previous) || [40, 42, 95, 91, 93, 126].includes(previous))
    ) {
      const host = domain(i)
      if (host >= 0)
        add('', i, (stop = path(host)), 'http://')
    }
    if (first && stop >= 0)
      return links
    i = stop < 0 ? i + 1 : stop
  }

  // mdast-util-gfm-autolink-literal's search, of the text between links:
  // URLs, then xmpp:, mailto: and emails, each through the text the one
  // before left. A match it turns down, it searches again from the next
  // character.
  const needs = [hasScheme || hasWww, value.includes('xmpp:'), value.includes('mailto:'), hasAt]
  for (let s = 0; s < 4; s++) {
    const search = SEARCHES[s]!
    if (!needs[s])
      continue
    links.sort((a, b) => a.index - b.index)
    const gaps: number[] = []
    let from = 0
    for (const link of links) {
      if (link.index > from)
        gaps.push(from, link.index)
      from = link.lastIndex
    }
    if (from < n)
      gaps.push(from, n)
    for (let g = 0; g < gaps.length; g += 2) {
      const start = gaps[g]!
      const run = value.slice(start, gaps[g + 1])
      search.lastIndex = 0
      for (let m = search.exec(run); m; m = search.exec(run)) {
        const index = start + m.index
        const [whole, a = '', b = '', rest] = m
        let ok = !/[\d\-_]$/.test(b)
        if (search === URL) {
          const c = run.charCodeAt(m.index - 1)
          let host = b
          let scheme = a
          let prefix = ''
          if (/^w/i.test(scheme)) {
            host = scheme + host
            scheme = ''
            prefix = 'http://'
          }
          const labels = host.split('.')
          ok =
            (!m.index || whitespace(c) || punctuation(c)) &&
            (www || !prefix) &&
            !punctuation(host.charCodeAt(0)) &&
            labels.length > 1 &&
            !badLabel(labels.at(-1)) &&
            !badLabel(labels.at(-2))
          if (ok) {
            add(
              scheme.slice(0, -2).toLowerCase(),
              index,
              index + scheme.length + trim(host + rest).length,
              prefix,
            )
          }
        } else if (search === XMPP) {
          ok &&= !(rest && (!/[A-Z]$/i.test(rest) || run[m.index + whole.length] === '@'))
          if (ok)
            add('xmpp:', index, index + whole.length)
        } else if (search === MAILTO) {
          if (ok)
            add('mailto:', index, index + whole.length)
        } else {
          ok = ok && email
          if (ok)
            add('mailto:', index, index + whole.length, 'mailto:')
        }
        if (!ok)
          search.lastIndex = m.index + 1
        else if (first)
          return links
      }
    }
  }
  return links.sort((a, b) => a.index - b.index)
}

/** The `http://` or `https://` link at the start of `value`, if there's one. */
function findAtStart(value: string): Link | undefined {
  text = value
  n = value.length
  if ((at(0) | 32) !== 104)
    return
  const found = protocol(0)
  if (!found)
    return
  const raw = value.slice(0, found[1])
  return { schema: found[0], index: 0, lastIndex: found[1], text: raw, url: raw }
}

// What every link has: `www.`, `://`, or an address character before an `@`.
const PRETEST = /www\.|:\/\/|[\w+.-]@/i

export interface GfmLinkifyOptions {
  /** Link `www.` URLs. Default `true`. */
  fuzzyLink?: boolean
  /** Link emails without `mailto:`. Default `true`. */
  fuzzyEmail?: boolean
}

export interface GfmLinkifyMatch extends Link {
  /** The link as written, the same as `text`. */
  raw: string
}

function toMatch({ schema, index, lastIndex, text, url }: Link): GfmLinkifyMatch {
  return { schema, index, lastIndex, raw: text, text, url }
}

/**
 * Finds links the way GitHub does, with the methods markdown-exit calls on
 * `md.linkify`. It has no TLD list and no custom schemas, so `tlds` and `add`
 * throw.
 */
export class GfmLinkify {
  private fuzzyLink = true
  private fuzzyEmail = true
  // markdown-exit tests a text and then matches it, so the links of the last
  // text are kept for the match.
  private last: { text: string, links: Link[] } | undefined

  constructor(options?: GfmLinkifyOptions) {
    if (options)
      this.set(options)
  }

  set(options: GfmLinkifyOptions): this {
    this.fuzzyLink = options.fuzzyLink ?? this.fuzzyLink
    this.fuzzyEmail = options.fuzzyEmail ?? this.fuzzyEmail
    this.last = undefined
    return this
  }

  test(text: string): boolean {
    if (this.last?.text === text)
      return this.last.links.length > 0
    return PRETEST.test(text) && find(text, this.fuzzyLink, this.fuzzyEmail, true).length > 0
  }

  match(text: string): GfmLinkifyMatch[] | null {
    if (this.last?.text !== text)
      this.last = { text, links: PRETEST.test(text) ? find(text, this.fuzzyLink, this.fuzzyEmail) : [] }
    return this.last.links.length ? this.last.links.map(toMatch) : null
  }

  matchAtStart(text: string): GfmLinkifyMatch | null {
    const link = findAtStart(text)
    return link ? toMatch(link) : null
  }

  tlds(): never {
    throw new Error('GfmLinkify has no TLD list: GFM links only `www.`, `http(s)://` and email addresses.')
  }

  add(): never {
    throw new Error('GfmLinkify has no custom schemas: GFM links only `www.`, `http(s)://` and email addresses.')
  }
}

/**
 * Plugin: links URLs and emails in text the way GitHub does.
 *
 * ```ts
 * import { createMarkdownExit } from 'markdown-exit/core'
 * import linkifyGfm from 'markdown-exit/linkify-gfm'
 *
 * const md = createMarkdownExit().use(linkifyGfm)
 * ```
 */
export default function linkifyGfm(md: MarkdownExit, options?: GfmLinkifyOptions): void {
  md.linkify = new GfmLinkify(options) as unknown as LinkifyIt
  md.set({ linkify: true })
}
