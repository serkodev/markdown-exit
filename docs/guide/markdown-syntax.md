# Markdown Syntax

**markdown-exit** supports a wide range of markdown syntax out of the box, following the [CommonMark](https://spec.commonmark.org/) specification with additional extensions.

## Presets and Options

When initializing an `MarkdownExit` instance, you can pass options or presets to it for customization.

**markdown-exit** offers various presets to customize the Markdown parsing and rendering behavior.

- [`default`](https://github.com/serkodev/markdown-exit/blob/main/packages/markdown-exit/src/presets/default.ts)
- [`commonmark`](https://github.com/serkodev/markdown-exit/blob/main/packages/markdown-exit/src/presets/commonmark.ts)
- [`zero`](https://github.com/serkodev/markdown-exit/blob/main/packages/markdown-exit/src/presets/zero.ts)

```ts
// default
const md = createMarkdownExit()

// commonmark preset
const md = createMarkdownExit('commonmark')
```

For more granular control, you can provide specific options:

```ts
const md = createMarkdownExit({
  // Enable HTML tags in source
  html: true,

  // Auto convert URL text to links
  linkify: true,

  // and more ...
})
```

For all available options, please refer to the [`MarkdownExitOptions`](/reference/api/Interface.MarkdownExitOptions.html) documentation.

## Parser Rules

Allows for easy customization and extension of the markdown syntax.

You can [`enable`](/reference/api/Class.MarkdownExit.html#enable) or [`disable`](/reference/api/Class.MarkdownExit.html#disable) rules for customizing the syntax according to your needs.

```ts
import { createMarkdownExit } from 'markdown-exit'

const md = createMarkdownExit()
  .disable(['link', 'image'])
  .enable(['link'])
  .enable('image')
```

### All Available Rules

| Rule             | Type                 | `default`                                                                             | `commonmark` | `zero` |
| ---------------- | -------------------- | ------------------------------------------------------------------------------------- | ------------ | ------ |
| `normalize`      | core                 | ✅                                                                                     | ✅            | ✅      |
| `block`          | core                 | ✅                                                                                     | ✅            | ✅      |
| `inline`         | core                 | ✅                                                                                     | ✅            | ✅      |
| `text_join`      | core                 | ✅                                                                                     | ✅            | ✅      |
| `replacements`   | core                 | Opt-in [`typographer`](/reference/api/Interface.MarkdownExitOptions.html#typographer) |              |        |
| `smartquotes`    | core                 | Opt-in [`typographer`](/reference/api/Interface.MarkdownExitOptions.html#typographer) |              |        |
| `linkify`        | core, inline         | Opt-in [`linkify`](/reference/api/Interface.MarkdownExitOptions.html#linkify)         |              |        |
| `table`          | block                | ✅                                                                                     |              |        |
| `code`           | block                | ✅                                                                                     | ✅            |        |
| `fence`          | block                | ✅                                                                                     | ✅            |        |
| `blockquote`     | block                | ✅                                                                                     | ✅            |        |
| `hr`             | block                | ✅                                                                                     | ✅            |        |
| `list`           | block                | ✅                                                                                     | ✅            |        |
| `reference`      | block                | ✅                                                                                     | ✅            |        |
| `heading`        | block                | ✅                                                                                     | ✅            |        |
| `lheading`       | block                | ✅                                                                                     | ✅            |        |
| `paragraph`      | block                | ✅                                                                                     | ✅            | ✅      |
| `html_block`     | block                | Opt-in [`html`](/reference/api/Interface.MarkdownExitOptions.html#html)               | ✅            |        |
| `html_inline`    | inline               | Opt-in [`html`](/reference/api/Interface.MarkdownExitOptions.html#html)               | ✅            |        |
| `text`           | inline               | ✅                                                                                     | ✅            | ✅      |
| `newline`        | inline               | ✅                                                                                     | ✅            |        |
| `escape`         | inline               | ✅                                                                                     | ✅            |        |
| `backticks`      | inline               | ✅                                                                                     | ✅            |        |
| `link`           | inline               | ✅                                                                                     | ✅            |        |
| `image`          | inline               | ✅                                                                                     | ✅            |        |
| `autolink`       | inline               | ✅                                                                                     | ✅            |        |
| `entity`         | inline               | ✅                                                                                     | ✅            |        |
| `strikethrough`  | inline, inline pairs | ✅                                                                                     |              |        |
| `emphasis`       | inline, inline pairs | ✅                                                                                     | ✅            |        |
| `balance_pairs`  | inline pairs         | ✅                                                                                     | ✅            | ✅      |
| `fragments_join` | inline pairs         | ✅                                                                                     | ✅            | ✅      |

## Syntax Extensions

Refer to the [Plugins](/guide/plugins.md) guide for detailed instructions on how to use or create plugins to enhance the markdown parsing and rendering capabilities.
