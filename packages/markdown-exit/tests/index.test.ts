import { describe, expect, expectTypeOf, it } from 'vitest'
import MarkdownExit, { createMarkdownExit, MarkdownExit as MarkdownExitClass } from '../src'

describe('callable and constructable', () => {
  it('is constructable', () => {
    const md = new MarkdownExit()
    const result = md.render('# markdown-exit')
    expect(result).toEqual('<h1>markdown-exit</h1>\n')
  })

  it('is callable', () => {
    const md = MarkdownExit()
    const result = md.render('# markdown-exit')
    expect(result).toEqual('<h1>markdown-exit</h1>\n')
  })

  it('works with both `new MarkdownExit()` and `MarkdownExit()`', () => {
    const a = new MarkdownExit()
    const b = MarkdownExit()

    expect(a).toBeInstanceOf(MarkdownExit)
    expect(b).toBeInstanceOf(MarkdownExit)
    expect(Object.getPrototypeOf(a)).toBe(Object.getPrototypeOf(b))
    expect(a).not.toBe(b)
  })

  it('shares the same instance prototype', () => {
    ;(MarkdownExit as any).prototype.__testMethod = function () {
      return 'ok'
    }

    const viaCall = MarkdownExit()
    const viaNew = new MarkdownExit()

    expect((viaCall as any).__testMethod()).toBe('ok')
    expect((viaNew as any).__testMethod()).toBe('ok')
  })

  it('inherits statics from the underlying class (_MarkdownExit)', () => {
    const Parent = Object.getPrototypeOf(MarkdownExit)
    expect(typeof Parent).toBe('function')

    Parent.__testStatic = () => 'static-ok'
    expect((MarkdownExit as any).__testStatic()).toBe('static-ok')
  })

  it('instanceof also matches the underlying class', () => {
    const Parent = Object.getPrototypeOf(MarkdownExit)
    const inst = MarkdownExit()
    expect(inst instanceof Parent).toBe(true)
  })

  it('instance.constructor points back to the MarkdownExit class', () => {
    const inst = MarkdownExit()
    expect(inst.constructor).toBe(MarkdownExitClass)
  })

  it('supports subclassing via the default export', () => {
    class My extends MarkdownExit {
      hello() {
        return 'hi'
      }
    }

    const m = new My()
    expect(m).toBeInstanceOf(My)
    expect(m).toBeInstanceOf(MarkdownExit)
    expect(m.hello()).toBe('hi')
    expect(m.render('# markdown-exit')).toBe('<h1>markdown-exit</h1>\n')
  })

  it('exposes callable via md.utils', () => {
    const md = MarkdownExit()
    expect(typeof md.utils.callable).toBe('function')
  })

  it('createMarkdownExit is not equal to MarkdownExit', () => {
    expect(createMarkdownExit).not.toEqual(MarkdownExit)
  })

  it('types are correct', () => {
    // newable
    expectTypeOf(MarkdownExit).toBeConstructibleWith('commonmark')

    // callable
    expectTypeOf(MarkdownExit).toBeCallableWith('commonmark')

    const a = new MarkdownExit()
    const b = MarkdownExit()
    expectTypeOf(a).toEqualTypeOf(b)

    // direct use as type
    expectTypeOf(a).toEqualTypeOf<MarkdownExit>()

    expectTypeOf(a).toHaveProperty('use')
    expectTypeOf(a.use).parameter(0).toBeFunction()
  })
})
