import { expect, it } from 'vitest'
import { myFunction } from '../src'

it('myFunction', () => {
  expect(myFunction()).toBe('Hello, world!')
})
