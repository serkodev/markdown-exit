# Migrate from markdown-it

## Migration Guide

**markdown-exit** is designed to be a drop-in replacement for [markdown-it](https://github.com/markdown-it/markdown-it) with several [enhancements](/guide/introduction.html#differences-from-markdown-it).

After [installing](/guide/quick-start.html#installation) **markdown-exit**, simply update your imports and everything should work as expected.

```diff
- import MarkdownIt from 'markdown-it'
+ import MarkdownExit from 'markdown-exit'
```

#### Named Import

markdown-it uses [default imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#default_import) by default. While **markdown-exit** is compatible with this approach, it’s recommended to use [named import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#named_import) instead, as they are more tree-shaking friendly.

```ts
import { createMarkdownExit } from 'markdown-exit'

// factory helper
const md = createMarkdownExit()
```

```ts
import { MarkdownExit } from 'markdown-exit'

// with the `new` keyword
const md = new MarkdownExit()
```

## Plugin Compatibility

Most [markdown-it](https://github.com/markdown-it/markdown-it) plugins should work seamlessly with **markdown-exit**.

```ts
import { full as emoji } from 'markdown-it-emoji'

md.use(emoji)
```

If a plugin is incompatible, please [submit an issue](https://github.com/serkodev/markdown-exit/issues/new/choose) or follow the Plugin Guide to add **markdown-exit** support.
