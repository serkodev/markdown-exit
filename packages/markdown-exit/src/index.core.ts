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

// Marked pure so bundlers can drop `MarkdownExit` with its renderer and presets
// when an app imports only `Parser` or other parser exports.
// eslint-disable-next-line ts/no-redeclare
const MarkdownExitConstructor = /* @__PURE__ */ callable(MarkdownExit) as unknown as (typeof createMarkdownExit & typeof MarkdownExit)

export default MarkdownExitConstructor
