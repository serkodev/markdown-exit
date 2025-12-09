import { bench, describe } from 'vitest'
import { createRunners } from './runners'

const fixtures = import.meta.glob<string>('./samples/*', { query: '?raw', import: 'default', eager: true })
const contents = Object.values(fixtures)

const runners = createRunners()

for (const [category, runnerGroup] of Object.entries(runners)) {
  describe(`category: ${category}`, () => {
    for (const [name, runner] of Object.entries(runnerGroup)) {
      bench(name, () => {
        for (const content of contents) {
          runner(content)
        }
      }, { time: 1000, warmupTime: 200 })
    }
  })
}
