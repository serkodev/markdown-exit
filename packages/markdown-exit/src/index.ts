import type { createMarkdownExit } from './core'
import { callable } from './common/utils'
import { MarkdownExit } from './core'

export * from './core'
export * from './parser'
export * from './renderer'
export * from './token'

// type and default const variable name must be the same
// for correct d.ts generation
type MarkdownExitConstructor = InstanceType<typeof MarkdownExit>

// eslint-disable-next-line ts/no-redeclare
const MarkdownExitConstructor = callable(MarkdownExit) as unknown as (typeof createMarkdownExit & typeof MarkdownExit)

export default MarkdownExitConstructor
