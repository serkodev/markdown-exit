# Rendering

**markdown-exit** compatible with **markdown-it** render API and supports [async rendering](#async-rendering) out of the box.

### Basic Usage

```ts
import { createMarkdownExit } from 'markdown-exit'

const md = createMarkdownExit()
const html = md.render('# Hello World')
```

### Inline Rendering

Render inline markdown content without paragraph wrapping.

```ts
const html = md.renderInline('**markdown-exit** is awesome!')
```

### Syntax Highlighting

You can provide a custom syntax highlighter function via the [`highlight`](/reference/api/Interface.MarkdownExitOptions.html#highlight) option.

```ts {8-10}
const shiki = createHighlighterCoreSync({
  themes: [nord],
  langs: [js],
  engine: createJavaScriptRegexEngine()
})

const md = createMarkdownExit({
  highlight(str, lang) {
    return shiki.highlight(str, { lang, theme: 'nord' })
  }
})
```

Please refer to the [documentation](https://shiki.style/guide/sync-usage#synchronous-usage) for more details of Shiki's synchronous usage above.

## Async Rendering

If your [`highlight`](/reference/api/Interface.MarkdownExitOptions.html#highlight) or any render rules are asynchronous, you can use [`renderAsync`](/reference/api/Class.MarkdownExit.html#renderasync) or [`renderInlineAsync`](/reference/api/Class.MarkdownExit.html#renderinlineasync) to render markdown asynchronously for better performance.

For example, multiple code blocks highlighted with an async highlighter (like [Shiki](https://shiki.style/)) can be processed in parallel to speed up rendering.

```ts {4-6}
import { codeToHtml } from 'shiki'

const md = createMarkdownExit({
  async highlight(code, lang) {
    return await codeToHtml(code, { lang, theme: 'nord' })
  }
})

const html = await md.renderAsync(markdown)
```

Thanks [Anthony Fu](https://github.com/antfu) for inspiring async rendering by [markdown-it-async](https://github.com/antfu/markdown-it-async).
