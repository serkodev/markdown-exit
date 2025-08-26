import { describe, expect, it } from 'vitest'
import MarkdownIt from '../src'

describe('callable and constructable', () => {
  it('is constructable', () => {
    const md = new MarkdownIt()
    const result = md.render('# markdown-it')
    expect(result).toEqual('<h1>markdown-it</h1>\n')
  })

  it('is callable', () => {
    const md = MarkdownIt()
    const result = md.render('# markdown-it')
    expect(result).toEqual('<h1>markdown-it</h1>\n')
  })

  it('works with both `new MarkdownIt()` and `MarkdownIt()`', () => {
    const a = new MarkdownIt()
    const b = MarkdownIt()

    expect(a).toBeInstanceOf(MarkdownIt)
    expect(b).toBeInstanceOf(MarkdownIt)
    expect(Object.getPrototypeOf(a)).toBe(Object.getPrototypeOf(b))
    expect(a).not.toBe(b)
  })

  it('shares the same instance prototype', () => {
    ;(MarkdownIt as any).prototype.__testMethod = function () {
      return 'ok'
    }

    const viaCall = MarkdownIt()
    const viaNew = new MarkdownIt()

    expect((viaCall as any).__testMethod()).toBe('ok')
    expect((viaNew as any).__testMethod()).toBe('ok')
  })

  it('inherits statics from the underlying class (_MarkdownIt)', () => {
    const Parent = Object.getPrototypeOf(MarkdownIt)
    expect(typeof Parent).toBe('function')

    Parent.__testStatic = () => 'static-ok'
    expect((MarkdownIt as any).__testStatic()).toBe('static-ok')
  })

  it('instanceof also matches the underlying class', () => {
    const Parent = Object.getPrototypeOf(MarkdownIt)
    const inst = MarkdownIt()
    expect(inst instanceof Parent).toBe(true)
  })

  it('instance.constructor points back to MarkdownIt', () => {
    const inst = MarkdownIt()
    expect(inst.constructor).toBe(MarkdownIt)
  })
})
