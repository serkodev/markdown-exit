import { describe, expect, it } from 'vitest'
import MarkdownFit from '../src'

describe('callable and constructable', () => {
  it('is constructable', () => {
    const md = new MarkdownFit()
    const result = md.render('# markdown-fit')
    expect(result).toEqual('<h1>markdown-fit</h1>\n')
  })

  it('is callable', () => {
    const md = MarkdownFit()
    const result = md.render('# markdown-fit')
    expect(result).toEqual('<h1>markdown-fit</h1>\n')
  })

  it('works with both `new MarkdownFit()` and `MarkdownFit()`', () => {
    const a = new MarkdownFit()
    const b = MarkdownFit()

    expect(a).toBeInstanceOf(MarkdownFit)
    expect(b).toBeInstanceOf(MarkdownFit)
    expect(Object.getPrototypeOf(a)).toBe(Object.getPrototypeOf(b))
    expect(a).not.toBe(b)
  })

  it('shares the same instance prototype', () => {
    ;(MarkdownFit as any).prototype.__testMethod = function () {
      return 'ok'
    }

    const viaCall = MarkdownFit()
    const viaNew = new MarkdownFit()

    expect((viaCall as any).__testMethod()).toBe('ok')
    expect((viaNew as any).__testMethod()).toBe('ok')
  })

  it('inherits statics from the underlying class (_MarkdownFit)', () => {
    const Parent = Object.getPrototypeOf(MarkdownFit)
    expect(typeof Parent).toBe('function')

    Parent.__testStatic = () => 'static-ok'
    expect((MarkdownFit as any).__testStatic()).toBe('static-ok')
  })

  it('instanceof also matches the underlying class', () => {
    const Parent = Object.getPrototypeOf(MarkdownFit)
    const inst = MarkdownFit()
    expect(inst instanceof Parent).toBe(true)
  })

  it('instance.constructor points back to MarkdownFit', () => {
    const inst = MarkdownFit()
    expect(inst.constructor).toBe(MarkdownFit)
  })
})
