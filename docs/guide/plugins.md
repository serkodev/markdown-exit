# Plugins

You can extend the markdown syntax by adding custom rules or modifying existing ones by using plugins.

```ts {2,5}
import { createMarkdownExit } from 'markdown-exit'
import { plugin } from 'your-markdown-exit-plugin'

const md = createMarkdownExit()
md.use(plugin)
```

## Plugins from markdown-it

**markdown-exit** supports plugins and compatible with [markdown-it](https://github.com/markdown-it/markdown-it) plugins.

```ts {2,5}
import { createMarkdownExit } from 'markdown-exit'
import { full as emoji } from 'markdown-it-emoji'

const md = createMarkdownExit()
md.use(emoji)
```

Thanks to the [markdown-it](https://github.com/markdown-it) community has developed a wide range of plugins that extend the core markdown syntax. You can use them seamlessly with **markdown-exit**.

- [markdown-it-sub](https://github.com/markdown-it/markdown-it-sub)
- [markdown-it-sup](https://github.com/markdown-it/markdown-it-sup)
- [markdown-it-footnote](https://github.com/markdown-it/markdown-it-footnote)
- [markdown-it-deflist](https://github.com/markdown-it/markdown-it-deflist)
- [markdown-it-abbr](https://github.com/markdown-it/markdown-it-abbr)
- [markdown-it-emoji](https://github.com/markdown-it/markdown-it-emoji)
- [markdown-it-container](https://github.com/markdown-it/markdown-it-container)
- [markdown-it-ins](https://github.com/markdown-it/markdown-it-ins)
- [markdown-it-mark](https://github.com/markdown-it/markdown-it-mark)
- [markdown-it-kbd](https://github.com/markdown-it/markdown-it-kbd)

Browse all markdown-it plugins on the [npm](https://www.npmjs.org/browse/keyword/markdown-it-plugin).

## Plugin Development

As **markdown-it** plugins are supported, it’s recommended to read the [markdown-it architecture](https://github.com/markdown-it/markdown-it/blob/d2782d892a51201b25d3eeab172201ad5a53a24c/docs/architecture.md) before starting plugin development.

```ts
import type { MarkdownExit } from 'markdown-exit'

export function pluginCustom(md: MarkdownExit) {
  // add a custom inline rule after the image rule
  md.inline.ruler.after('image', 'custom_rule', (state, silent) => {
    // ... custom_rule implementation
    return false
  })
}
```

Release read the `MarkdownExit` class [properties](/reference/api/Class.MarkdownExit.html#properties) type definition for more details about the available plugin APIs.

### Async Render Rules

A nice feature of **markdown-exit** is its built-in support for [async rendering](/guide/rendering.html#async-rendering), allowing you to implement async render rules in your plugin.

```ts
import type { MarkdownExit } from 'markdown-exit'

export function pluginSizeImg(md: MarkdownExit) {
  // Example async render rule for images
  md.renderer.rules.image = async (tokens, idx) => {
    const src = tokens[idx].attrGet('src')
    const { width, height } = await fetchImageSize(src)
    return `<img src="${src}" width="${width}" height="${height}" />`
  }
}
```
