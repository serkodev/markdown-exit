import { assert, describe, expect, it } from 'vitest'
import markdownit from '../src'

describe('parse reference-style links', () => {
  it('without env param (issue #6)', () => {
    const md = markdownit()
    const result = md.parse(`[hobbit-hole][1]

[1]: https://en.wikipedia.org/wiki/Hobbit#Lifestyle "Hobbit lifestyles"`)
    expect(result).toBeTruthy()
  })

  it('able to write input env', () => {
    const md = markdownit()
    const env = {}
    const result = md.parse(`[hobbit-hole][1]

[1]: https://en.wikipedia.org/wiki/Hobbit#Lifestyle "Hobbit lifestyles"`, env)
    expect(result).toBeTruthy()
    expect(env).toMatchInlineSnapshot(`
      {
        "references": {
          "1": {
            "href": "https://en.wikipedia.org/wiki/Hobbit#Lifestyle",
            "title": "Hobbit lifestyles",
          },
        },
      }
    `)
  })
})
