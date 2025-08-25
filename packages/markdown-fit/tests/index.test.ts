import { expect, it } from 'vitest'
import MarkdownIt from '../src'

it('basic', () => {
  const md = new MarkdownIt()
  const result = md.render('# markdown-it')
  expect(result).toEqual('<h1>markdown-it</h1>\n')
})
