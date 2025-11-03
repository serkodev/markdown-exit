# Introduction

**markdown-exit** is a modern Markdown toolkit—parser + renderer. Fully CommonMark-compliant and easily extended with plugins. Built in TypeScript, shipping strong types for a smoother DX and type-safe development.

It is a TypeScript rewrite of [markdown-it](https://github.com/markdown-it/markdown-it), designed as a drop-in replacement with thoughtful enhancements.

### Differences from markdown-it

- TypeScript-first design
- Supports [async rendering](/guide/rendering.html#async-rendering)
- Tree-shaking friendly
- [Smaller bundle size](https://pkg-size.dev/markdown-exit) (~30% reduction)
- Bug fixes and [additional features](https://github.com/serkodev/markdown-exit/issues?q=is:issue%20label:features)

#### Why a separate codebase from markdown-it?

TypeScript offers better type safety and a superior development experience. It also makes the code easier to read and maintain.

For instance, while the TypeScript rewriting, I discovered several issues in the original JavaScript code that stemmed from the lack of type definitions.

Unfortunately, the author of markdown-it has [stated](https://github.com/markdown-it/markdown-it/issues/848#issuecomment-1039509242) that they do not use TypeScript and seems the repo is not actively maintained.

## Plugin Ecosystem

**markdown-exit** supports a plugin system that enables custom syntax and rendering. Create your own plugins or adopt community ones. It's compatible with [markdown-it](https://github.com/markdown-it/markdown-it) plugins and works out of the box, so migration stays simple.

For more details, see the [Plugin Guide](/guide/plugins).

## Credits

This project owes its foundation to the [markdown-it](https://github.com/markdown-it/markdown-it) community and all its [contributors](https://github.com/markdown-it/markdown-it/graphs/contributors).

**Authors of markdown-it**

- Alex Kocharin [github/rlidwka](https://github.com/rlidwka)
- Vitaly Puzrin [github/puzrin](https://github.com/puzrin)

**Special Thanks**

- [John MacFarlane](https://github.com/jgm) for the CommonMark spec and reference implementations.
- [Definition owners](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a26d35b5c331fbdb512ac7dfb1b846d282336c67/.github/CODEOWNERS#L4713C1-L4713C106) of [@types/markdown-it](https://www.npmjs.com/package/@types/markdown-it) for the type definitions reference.
- [Anthony Fu](https://github.com/antfu) for inspiring async rendering by [markdown-it-async](https://github.com/antfu/markdown-it-async).
