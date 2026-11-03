# Quick Start

## Installation

**markdown-exit** `v2.0+` (latest) supports markdown-it `v15.0+` and its plugins, and adds new capabilities such as [async rendering](/guide/rendering.html#async-rendering) along with performance improvements.

::: code-group

```sh [npm]
npm install markdown-exit
```

```sh [pnpm]
pnpm add markdown-exit
```

```sh [yarn]
yarn add markdown-exit
```

```sh [bun]
bun add markdown-exit
```

```html [CDN]
<script type="module">
import { createMarkdownExit } from 'https://esm.sh/markdown-exit';

const md = createMarkdownExit();
const html = md.render('# markdown-exit');
</script>
```

:::

## Version Compatibility

| markdown-exit | markdown-it | Status |
| --- | --- | --- |
| `v2.0+` (latest) | `v15.0+` | Actively maintained |
| `v1.x` | `v14.x` | Superseded — see [Migration to v2](/guide/migration-v2.html) |
| `v0.x` (legacy) | `v14.3.0` | No longer maintained |

### Legacy Version (`v0.x`)

> [!WARNING] No longer maintained
> The [`legacy`](https://github.com/serkodev/markdown-exit/tree/legacy) branch (`v0.x`) is no longer maintained. Its final release is `v0.5.0`, which tracks markdown-it `v14.3.0`.

`v0.x` was created to bring TypeScript typings to markdown-it. Since markdown-it has been rewritten in TypeScript as of `v15`, you can now use markdown-it directly if native typings are all you need.

If you are looking for markdown-it `v15.0+` support together with async rendering, other new features and performance improvements, upgrade to **markdown-exit** `v2.0+` instead.

The final legacy release is still available on npm:

::: code-group

```sh [npm]
npm install markdown-exit@legacy
```

```sh [pnpm]
pnpm add markdown-exit@legacy
```

```sh [yarn]
yarn add markdown-exit@legacy
```

```sh [bun]
bun add markdown-exit@legacy
```

```html [CDN]
<script type="module">
import { createMarkdownExit } from 'https://esm.sh/markdown-exit@legacy';

const md = createMarkdownExit();
const html = md.render('# markdown-exit');
</script>
```

:::

## Usage

**Named import (recommended)**

Use [`createMarkdownExit`](/reference/api/Function.createMarkdownExit.html) to create an instance:

```ts
import { createMarkdownExit } from 'markdown-exit'

// factory helper
const md = createMarkdownExit()
md.render('# markdown-exit')
```

> [!TIP] Rendering
> Please refer to the [Rendering](/guide/rendering.html) guide for more details on rendering Markdown content.

If you prefer using the [`MarkdownExit`](/reference/api/Class.MarkdownExit.html) class with `new`, you can do so as follows:

```ts
import { MarkdownExit } from 'markdown-exit'

// with the `new` keyword
const md = new MarkdownExit()
```

[Default import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#default_import) (with callable constructor support) is retained for **markdown-it** compatibility, but it may have drawbacks in module interop and tree-shaking. We do not recommend using it in modern codebases.

```ts
import MarkdownExit from 'markdown-exit'

// callable function
const md = MarkdownExit()

// OR with the `new` keyword
const md = new MarkdownExit()
```
