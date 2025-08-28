# markdown-fit

[![npm version][npm-version-src]][npm-version-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

A TypeScript rewrite of [markdown-it](https://github.com/markdown-it/markdown-it) with first-class typings, modern tooling, and enhancements.

## Compatibility & Differences

- **API compatibility:** Compatible with markdown-it `v14.1.0` and plugin API.
- **TypeScript:** Ship robust types, improve DX, and enable type-safe development.
- **Extensibility:** Provide a clean foundation for new features that are easier to prototype and maintain.
- **New features:** Track via [features](https://github.com/serkodev/markdown-fit/issues?q=is:issue%20label:features) for details.

## Quickstart

### Install

`v1+` (latest): All new features and may include breaking changes.

```bash
npm i markdown-fit
```

`v0.x` (legacy): Full compatibility with markdown-it usage while adding TypeScript support, bug fixes and performance improvements. ([v0](https://github.com/serkodev/markdown-fit/tree/v0) branch)

```bash
npm i markdown-fit@legacy
```

### Usage

#### Named import (recommended)

```ts
import { createMarkdownFit } from 'markdown-fit'

// factory helper
const md = createMarkdownFit()
md.render('# markdown-fit')
```

```ts
import { MarkdownFit } from 'markdown-fit'

// with the `new` keyword
const md = new MarkdownFit()
md.render('# markdown-fit')
```

#### Default import

> [!NOTE]
> Default export (with callable constructor support) is retained for markdown-it compatibility, but it may have drawbacks in module interop and tree-shaking.

<details>
<summary>Example</summary>

```ts
import MarkdownFit from 'markdown-fit'

// callable function
const md = MarkdownFit()
md.render('# markdown-fit')
```

```ts
// with the `new` keyword
const md = new MarkdownFit()
md.render('# markdown-fit')
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

[npm-version-src]: https://img.shields.io/npm/v/markdown-fit?style=flat&colorA=222&colorB=fff
[npm-version-href]: https://npmjs.com/package/markdown-fit
[bundle-src]: https://img.shields.io/bundlephobia/minzip/markdown-fit?style=flat&colorA=222&colorB=fff&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=markdown-fit
[license-src]: https://img.shields.io/github/license/serkodev/markdown-fit.svg?style=flat&colorA=222&colorB=fff
[license-href]: https://github.com/serkodev/markdown-fit/blob/main/LICENSE
