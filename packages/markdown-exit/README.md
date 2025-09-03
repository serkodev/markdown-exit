![markdown-exit banner](https://markdown-exit.pages.dev/banner.svg)

# markdown-exit

[![npm version][npm-version-src]][npm-version-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

A TypeScript rewrite of [markdown-it](https://github.com/markdown-it/markdown-it) with first-class typings, modern tooling, and enhancements.

## Compatibility & Differences

- **API compatibility:** Compatible with markdown-it `v14.1.0` and plugin API.
- **TypeScript:** Ship robust types, improve DX, and enable type-safe development.
- **Extensibility:** Provide a clean foundation for new features that are easier to prototype and maintain.
- **New features:** Track via [features](https://github.com/serkodev/markdown-exit/issues?q=is:issue%20label:features) for details.

## Quickstart

### Install

`v1+` (latest): All new features and may include breaking changes.

```bash
npm i markdown-exit
```

`v0.x` (legacy): Full compatibility with markdown-it usage while adding TypeScript support, bug fixes and performance improvements. ([v0](https://github.com/serkodev/markdown-exit/tree/v0) branch)

```bash
npm i markdown-exit@legacy
```

### Usage

#### Named import (recommended)

```ts
import { createMarkdownExit } from 'markdown-exit'

// factory helper
const md = createMarkdownExit()
md.render('# markdown-exit')
```

```ts
import { MarkdownExit } from 'markdown-exit'

// with the `new` keyword
const md = new MarkdownExit()
md.render('# markdown-exit')
```

#### Default import

> [!NOTE]
> Default export (with callable constructor support) is retained for markdown-it compatibility, but it may have drawbacks in module interop and tree-shaking.

<details>
<summary>Example</summary>

```ts
import MarkdownExit from 'markdown-exit'

// callable function
const md = MarkdownExit()
md.render('# markdown-exit')
```

```ts
// with the `new` keyword
const md = new MarkdownExit()
md.render('# markdown-exit')
```
</details>

#### Documentation

Visit markdown-it [API Documentation](https://markdown-it.github.io/markdown-it/) for more info and examples.

## References / Thanks

This project owes its foundation to the [markdown-it](https://github.com/markdown-it/markdown-it) community and all its [contributors](https://github.com/markdown-it/markdown-it/graphs/contributors).

### Authors of markdown-it
- Alex Kocharin [github/rlidwka](https://github.com/rlidwka)
- Vitaly Puzrin [github/puzrin](https://github.com/puzrin)

### Special Thanks

- [John MacFarlane](https://github.com/jgm) for the CommonMark spec and reference implementations.

- [Definition owners](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a26d35b5c331fbdb512ac7dfb1b846d282336c67/.github/CODEOWNERS#L4713C1-L4713C106) of [@types/markdown-it](https://www.npmjs.com/package/@types/markdown-it) for the type definitions reference.

## License

[MIT License](./LICENSE) © [Alex Kocharin](https://github.com/rlidwka), [Vitaly Puzrin](https://github.com/puzrin), [SerKo](https://github.com/serkodev)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/markdown-exit?style=flat&colorA=00AF6B&colorB=000
[npm-version-href]: https://npmjs.com/package/markdown-exit
[bundle-src]: https://img.shields.io/bundlephobia/minzip/markdown-exit?style=flat&colorA=00AF6B&colorB=000&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=markdown-exit
[license-src]: https://img.shields.io/github/license/serkodev/markdown-exit.svg?style=flat&colorA=00AF6B&colorB=000
[license-href]: https://github.com/serkodev/markdown-exit/blob/main/LICENSE
