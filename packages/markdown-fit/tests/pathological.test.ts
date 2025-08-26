import crypto from 'node:crypto'
import { describe, expect, it } from 'vitest'
import MarkdownFit from '../src/index'

function test_pattern(str: string) {
  expect(MarkdownFit().render(str)).toBeTruthy()
}

/* eslint-disable prefer-template */
describe('cmark', () => {
  it.runIf(process.env.TEST_CMARK_SOURCE)('verify original source crc (run if TEST_CMARK_SOURCE=1)', async () => {
    const url = 'https://raw.githubusercontent.com/commonmark/cmark/master/test/pathological_tests.py'
    const response = await fetch(url)
    const src = await response.text()
    const src_md5 = crypto.createHash('md5').update(src).digest('hex')
    expect(src_md5).toMatchInlineSnapshot(`"80e12450752e4667b3656fa2cd12e9d5"`)
  })

  it('nested inlines', () => {
    test_pattern('*'.repeat(60000) + 'a' + '*'.repeat(60000))
  })

  it('nested strong emph', () => {
    test_pattern('*a **a '.repeat(5000) + 'b' + ' a** a*'.repeat(5000))
  })

  it('many emph closers with no openers', () => {
    test_pattern('a_ '.repeat(30000))
  })

  it('many emph openers with no closers', () => {
    test_pattern('_a '.repeat(30000))
  })

  it('many link closers with no openers', () => {
    test_pattern('a]'.repeat(10000))
  })

  it('many link openers with no closers', () => {
    test_pattern('[a'.repeat(10000))
  })

  it('mismatched openers and closers', () => {
    test_pattern('*a_ '.repeat(50000))
  })

  it('commonmark/cmark#389', () => {
    test_pattern('*a '.repeat(20000) + '_a*_ '.repeat(20000))
  })

  it('openers and closers multiple of 3', () => {
    test_pattern('a**b' + ('c* '.repeat(50000)))
  })

  it('link openers and emph closers', () => {
    test_pattern('[ a_'.repeat(10000))
  })

  it('pattern [ (]( repeated', () => {
    test_pattern('[ (]('.repeat(40000))
  })

  it('pattern ![[]() repeated', () => {
    test_pattern('![[]()'.repeat(20000))
  })

  it('nested brackets', () => {
    test_pattern('['.repeat(20000) + 'a' + ']'.repeat(20000))
  })

  it('nested block quotes', () => {
    test_pattern('> '.repeat(50000) + 'a')
  })

  it('deeply nested lists', () => {
    test_pattern(Array.from({ length: 1000 }).fill(0).map((_, x) => '  '.repeat(x) + '* a\n').join(''))
  })

  it('u+0000 in input', () => {
    test_pattern('abc\u0000de\u0000'.repeat(100000))
  })

  it('backticks', () => {
    test_pattern(Array.from({ length: 3000 }).fill(0).map((_, x) => 'e' + '`'.repeat(x)).join(''))
  })

  it('unclosed links A', () => {
    test_pattern('[a](<b'.repeat(30000))
  })

  it('unclosed links B', () => {
    test_pattern('[a](b'.repeat(30000))
  })

  it('unclosed <!--', () => {
    test_pattern('</' + '<!--'.repeat(100000))
  })

  it('empty lines in deeply nested lists', () => {
    test_pattern('- '.repeat(30000) + 'x' + '\n'.repeat(30000))
  })

  it('empty lines in deeply nested lists in blockquote', () => {
    test_pattern('> ' + '- '.repeat(30000) + 'x\n' + '>\n'.repeat(30000))
  })

  it('emph in deep blockquote', () => {
    test_pattern('>'.repeat(100000) + 'a*'.repeat(100000))
  })
})

describe('markdown-it', () => {
  it('emphasis **_* pattern', () => {
    test_pattern('**_* '.repeat(50000))
  })

  it('backtick ``\\``\\`` pattern', () => {
    test_pattern('``\\'.repeat(50000))
  })

  it('autolinks <<<<...<<> pattern', () => {
    test_pattern('<'.repeat(400000) + '>')
  })

  it('hardbreak whitespaces pattern', () => {
    test_pattern('x' + ' '.repeat(150000) + 'x  \nx')
  })
})
