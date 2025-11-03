# Quick Start

> [!WARNING]🚧 Beta Software
> **markdown-exit** v1 is currently in **public beta** (`v1.0.0-beta.*`). Breaking changes may occur until a stable `v1.0.0` is released.

## Installation

`v1+` (latest): All new features and may include breaking changes from [markdown-it](https://github.com/markdown-it/markdown-it).

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

**Legacy Version**

`v0.x` (legacy): Full compatibility with markdown-it usage while adding TypeScript support, bug fixes and performance improvements. ([v0](https://github.com/serkodev/markdown-exit/tree/v0) branch)

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
