// Token class

/**
 * -  `1` means the tag is opening
 * -  `0` means the tag is self-closing
 * - `-1` means the tag is closing
 */
export type Nesting = 1 | 0 | -1

export type HTMLAttribute = [name: string, value: string]

export type SourceMapLineRange = [line_begin: number, line_end: number]

export default class Token {
  /**
   * Type of the token, e.g. "paragraph_open"
   */
  type: string

  /**
   * HTML tag name, e.g. "p"
   */
  tag: string

  /**
   * HTML attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
   */
  attrs: HTMLAttribute[] | null = null

  /**
   * Source map info. Format: `[ line_begin, line_end ]`
   */
  map: SourceMapLineRange | null = null

  /**
   * Level change (number in {-1, 0, 1} set)
   */
  nesting: Nesting

  /**
   * Nesting level, the same as `state.level`
   */
  level: number = 0

  /**
   * An array of child nodes (inline and img tokens)
   */
  children: Token[] | null = null

  /**
   * In a case of self-closing tag (code, html, fence, etc.),
   * it has contents of this tag.
   */
  content: string = ''

  /**
   * '*' or '_' for emphasis, fence string for fence, etc.
   */
  markup: string = ''

  /**
   * - Info string for "fence" tokens
   * - The value "auto" for autolink "link_open" and "link_close" tokens
   * - The string value of the item marker for ordered-list "list_item_open" tokens
   */
  info: string = ''

  /**
   * A place for plugins to store an arbitrary data
   */
  meta: any = null

  /**
   * True for block-level tokens, false for inline tokens.
   * Used in renderer to calculate line breaks
   */
  block: boolean = false

  /**
   * If it's true, ignore this element when rendering. Used for tight lists
   * to hide paragraphs.
   */
  hidden: boolean = false

  /**
   * Create new token and fill passed properties.
   */
  constructor(type: string, tag: string, nesting: Nesting) {
    this.type = type
    this.tag = tag
    this.nesting = nesting
  }

  /**
   * Search attribute index by name.
   */
  attrIndex(name: string): number {
    if (!this.attrs) { return -1 }

    const attrs = this.attrs

    for (let i = 0, len = attrs.length; i < len; i++) {
      if (attrs[i][0] === name) { return i }
    }
    return -1
  }

  /**
   * Add `[ name, value ]` attribute to list. Init attrs if necessary
   */
  attrPush(attrData: HTMLAttribute): void {
    if (this.attrs) {
      this.attrs.push(attrData)
    } else {
      this.attrs = [attrData]
    }
  }

  /**
   * Set `name` attribute to `value`. Override old value if exists.
   */
  attrSet(name: string, value: string): void {
    const idx = this.attrIndex(name)
    const attrData: HTMLAttribute = [name, value]

    if (idx < 0) {
      this.attrPush(attrData)
    } else {
      this.attrs![idx] = attrData
    }
  }

  /**
   * Get the value of attribute `name`, or null if it does not exist.
   */
  attrGet(name: string): string | null {
    const idx = this.attrIndex(name)
    let value: string | null = null
    if (idx >= 0) {
      value = this.attrs[idx][1]
    }
    return value
  }

  /**
   * Join value to existing attribute via space. Or create new attribute if not
   * exists. Useful to operate with token classes.
   */
  attrJoin(name: string, value: string): void {
    const idx = this.attrIndex(name)

    if (idx < 0) {
      this.attrPush([name, value])
    } else {
      this.attrs[idx][1] = `${this.attrs[idx][1]} ${value}`
    }
  }
}
