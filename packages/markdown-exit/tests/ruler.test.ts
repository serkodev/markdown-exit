import { assert, describe, it } from 'vitest'
import { Ruler } from '../src/ruler'

describe('ruler', () => {
  it('should replace rule (.at)', () => {
    const ruler = new Ruler()
    let res = 0

    ruler.push('test', () => {
      res = 1
    })
    ruler.at('test', () => {
      res = 2
    })

    const rules = ruler.getRules('')

    assert.strictEqual(rules.length, 1)
    rules[0]()
    assert.strictEqual(res, 2)
  })

  it('should inject before/after rule', () => {
    const ruler = new Ruler()
    let res = 0

    ruler.push('test', () => {
      res = 1
    })
    ruler.before('test', 'before_test', () => {
      res = -10
    })
    ruler.after('test', 'after_test', () => {
      res = 10
    })

    const rules = ruler.getRules('')

    assert.strictEqual(rules.length, 3)
    rules[0]()
    assert.strictEqual(res, -10)
    rules[1]()
    assert.strictEqual(res, 1)
    rules[2]()
    assert.strictEqual(res, 10)
  })

  it('should enable/disable rule', () => {
    const ruler = new Ruler()
    let rules

    ruler.push('test', () => {})
    ruler.push('test2', () => {})

    rules = ruler.getRules('')
    assert.strictEqual(rules.length, 2)

    ruler.disable('test')
    rules = ruler.getRules('')
    assert.strictEqual(rules.length, 1)
    ruler.disable('test2')
    rules = ruler.getRules('')
    assert.strictEqual(rules.length, 0)

    ruler.enable('test')
    rules = ruler.getRules('')
    assert.strictEqual(rules.length, 1)
    ruler.enable('test2')
    rules = ruler.getRules('')
    assert.strictEqual(rules.length, 2)
  })

  it('should enable/disable multiple rule', () => {
    const ruler = new Ruler()
    let rules

    ruler.push('test', () => {})
    ruler.push('test2', () => {})

    ruler.disable(['test', 'test2'])
    rules = ruler.getRules('')
    assert.strictEqual(rules.length, 0)
    ruler.enable(['test', 'test2'])
    rules = ruler.getRules('')
    assert.strictEqual(rules.length, 2)
  })

  it('should enable rules by whitelist', () => {
    const ruler = new Ruler()

    ruler.push('test', () => {})
    ruler.push('test2', () => {})

    ruler.enableOnly('test')
    const rules = ruler.getRules('')
    assert.strictEqual(rules.length, 1)
  })

  it('should support multiple chains', () => {
    const ruler = new Ruler()
    let rules

    ruler.push('test', () => {})
    ruler.push('test2', () => {}, { alt: ['alt1'] })
    ruler.push('test2', () => {}, { alt: ['alt1', 'alt2'] })

    rules = ruler.getRules('')
    assert.strictEqual(rules.length, 3)
    rules = ruler.getRules('alt1')
    assert.strictEqual(rules.length, 2)
    rules = ruler.getRules('alt2')
    assert.strictEqual(rules.length, 1)
  })

  it('should fail on invalid rule name', () => {
    const ruler = new Ruler()

    ruler.push('test', () => {})

    assert.throws(() => {
      ruler.at('invalid name', () => {})
    })
    assert.throws(() => {
      // @ts-expect-error throw
      ruler.before('invalid name', () => {})
    })
    assert.throws(() => {
      // @ts-expect-error throw
      ruler.after('invalid name', () => {})
    })
    assert.throws(() => {
      ruler.enable('invalid name')
    })
    assert.throws(() => {
      ruler.disable('invalid name')
    })
  })

  it('should not fail on invalid rule name in silent mode', () => {
    const ruler = new Ruler()

    ruler.push('test', () => {})

    assert.doesNotThrow(() => {
      ruler.enable('invalid name', true)
    })
    assert.doesNotThrow(() => {
      ruler.enableOnly('invalid name', true)
    })
    assert.doesNotThrow(() => {
      ruler.disable('invalid name', true)
    })
  })
})
