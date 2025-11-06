import type { createMarkdownExit } from './core'
import { MarkdownExit } from './core'

export * from './core'
export * from './parser'
export * from './renderer'
export * from './token'

// hybrid types callable construct signatures hack

/**
 * Make class callable without `new` operator.
 */
function createCallableClass<T extends new (...args: any) => any>(Class: T) {
  function callable(...args: ConstructorParameters<T>): InstanceType<T> {
    return new Class(...args)
  }

  // bridge statics
  Object.setPrototypeOf(callable, MarkdownExit)

  // share the same instance prototype
  ;(callable as any).prototype = MarkdownExit.prototype
  ;(callable as any).prototype.constructor = callable

  return callable as unknown as T
}

// type and default const variable name must be the same
// for correct d.ts generation
type MarkdownExitConstructor = InstanceType<typeof MarkdownExit>

// eslint-disable-next-line ts/no-redeclare
const MarkdownExitConstructor = createCallableClass(MarkdownExit) as unknown as (typeof createMarkdownExit & typeof MarkdownExit)

export default MarkdownExitConstructor
