![markdown-exit banner](https://markdown-exit.pages.dev/banner.svg)

# markdown-exit

[![npm version][npm-version-src]][npm-version-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]
[![CodSpeed][codspeed-src]][codspeed-href]

A TypeScript rewrite of [markdown-it](https://github.com/markdown-it/markdown-it) with first-class typings, modern tooling, and enhancements.

## Features

- 🛡️ **Type Safety:** Ship robust types, improve DX, and enable type-safe development.
- ⚡ **New features:** [Async rendering](https://markdown-exit.pages.dev/guide/rendering.html#async-rendering) for all rules includeing syntax highlighting and [more](https://github.com/serkodev/markdown-exit/issues?q=is:issue%20label:features).
- 🔌 **Extensibility:** Extend the markdown syntax, custom rendering with [Plugins](https://markdown-exit.pages.dev/guide/plugins.html).
- 🤝 **Compatibility:** Compatible with markdown-it `v14.1.0` and plugin API.

## Documentation

Read the [documentation](https://markdown-exit.pages.dev/) for more details.

## Installation

v1+ [`@latest`](https://www.npmjs.com/package/markdown-exit/v/latest): All new features and may include breaking changes.

> [!IMPORTANT]
> 🚧 **markdown-exit** v1 is currently in **public beta** (`v1.0.0-beta.*`).  
> Breaking changes may occur until a stable `v1.0.0` is released.

```bash
npm i markdown-exit
```

<details>
<summary>v0.x <a href="https://www.npmjs.com/package/markdown-exit/v/legacy"><code>@legacy</code></a></summary>

Full compatibility with markdown-it usage while adding TypeScript support, bug fixes and performance improvements. ([v0](https://github.com/serkodev/markdown-exit/tree/v0) branch)

```bash
npm i markdown-exit@legacy
```

</details>

## Usage

```ts
import { createMarkdownExit } from 'markdown-exit'

// factory helper
const md = createMarkdownExit()
const html = md.render('# markdown-exit')
```

```ts
import { MarkdownExit } from 'markdown-exit'

// with the `new` keyword
const md = new MarkdownExit()
const html = md.render('# markdown-exit')
```

<details>
<summary>Default import</summary>

> [!NOTE]
> Default export (with callable constructor support) is retained for markdown-it compatibility, but it may have drawbacks in module interop and tree-shaking.

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

### Guides

- [Markdown Syntax](https://markdown-exit.pages.dev/guide/markdown-syntax.html)
- [Redering](https://markdown-exit.pages.dev/guide/rendering.html)
- [Plugins](https://markdown-exit.pages.dev/guide/plugins.html)

## Migrate from markdown-it

Drop-in replacement for markdown-it with enhancements, see [Migration Guide](https://markdown-exit.pages.dev/guide/migrate-from-markdown-it.html) for details.

```diff
- import MarkdownIt from 'markdown-it'
+ import MarkdownExit from 'markdown-exit'
```

## Credits

This project owes its foundation to the [markdown-it](https://github.com/markdown-it/markdown-it) community and all its [contributors](https://github.com/markdown-it/markdown-it/graphs/contributors).

### Authors of markdown-it
- Alex Kocharin [github/rlidwka](https://github.com/rlidwka)
- Vitaly Puzrin [github/puzrin](https://github.com/puzrin)

### Special Thanks

- [John MacFarlane](https://github.com/jgm) for the CommonMark spec and reference implementations.
- [Definition owners](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a26d35b5c331fbdb512ac7dfb1b846d282336c67/.github/CODEOWNERS#L4713C1-L4713C106) of [@types/markdown-it](https://www.npmjs.com/package/@types/markdown-it) for the type definitions reference.
- [Anthony Fu](https://github.com/antfu) for inspiring async rendering by [markdown-it-async](https://github.com/antfu/markdown-it-async).

## License

[MIT License](./LICENSE) © [Alex Kocharin](https://github.com/rlidwka), [Vitaly Puzrin](https://github.com/puzrin), [SerKo](https://github.com/serkodev)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/markdown-exit?style=flat&colorA=00AF6B&colorB=000
[npm-version-href]: https://npmjs.com/package/markdown-exit
[bundle-src]: https://img.shields.io/bundlephobia/minzip/markdown-exit?style=flat&colorA=00AF6B&colorB=000&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=markdown-exit
[license-src]: https://img.shields.io/github/license/serkodev/markdown-exit.svg?style=flat&colorA=00AF6B&colorB=000
[license-href]: https://github.com/serkodev/markdown-exit/blob/main/LICENSE
[codspeed-src]: https://img.shields.io/badge/CodSpeed-benchmark-blue
[codspeed-href]: https://codspeed.io/serkodev/markdown-exit?utm_source=badge
