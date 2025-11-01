import { bench, describe } from 'vitest'
import { createRunners } from './runners'

const fixtures = import.meta.glob<string>('./samples/*', { query: '?raw', import: 'default', eager: true })
const contents = Object.values(fixtures)

describe('all samples', () => {
  const runners = createRunners()
  for (const [name, runner] of Object.entries(runners)) {
    bench(name, () => {
      for (const content of contents) {
        runner(content)
      }
    })
  }
})
