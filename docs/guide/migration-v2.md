# Migration to v2

**markdown-exit** `v2.0` syncs the whole parser with [markdown-it `v15.0.0`](https://github.com/markdown-it/markdown-it/blob/master/CHANGELOG.md), a major upstream release with breaking changes. This guide covers upgrading from **markdown-exit** `v1.x`.

Despite the length of this page, most users should be able to upgrade without changes — the public API (imports, `render()`, options, presets and the plugin system) stays the same.

> [!NOTE]
> This page is about upgrading **markdown-exit** `v1.x` → `v2.0`.
>
> - Coming from markdown-it itself? See [Migrate from markdown-it](/guide/migrate-from-markdown-it.html).
> - markdown-it's own [migration to v15 guide](https://github.com/markdown-it/markdown-it/blob/master/docs/migration/migration_v15.md) is a good companion read, but several points differ for **markdown-exit** — types were already bundled, parser classes were already exported, and reference tokens behave differently. The differences are called out below.

## For Users

### Imports and TypeScript — No Changes

Everything from `v1.x` keeps working: the callable default export, [named imports](/guide/migrate-from-markdown-it.html#named-import) such as `createMarkdownExit()` and `new MarkdownExit()`, and bundled TypeScript types. Unlike markdown-it `v15`, there is no `@types/*` package to remove — **markdown-exit** has always shipped its own types.

### Linkification

`linkify-it` has been upgraded from `v5` to [`v6`](https://github.com/markdown-it/linkify-it/blob/master/CHANGELOG.md), which no longer recognizes fuzzy links such as `example.com` or `www.example.com` by default. If you rely on this behavior, enable it explicitly:

```ts
import { createMarkdownExit } from 'markdown-exit'

const md = createMarkdownExit({ linkify: true })
md.linkify.set({ fuzzyLink: true })
```

`linkify-it` `v6` also changes a few other things — see its changelog for the full list:

- Matching of authentication data in URLs is disabled by default: `http://user:pass@example.com/` now only matches up to `http://user`. Restore the old behavior with `md.linkify.set({ urlAuth: true })`.
- Unicode punctuation now terminates a link, which significantly improves CJK support.
- The `pretest()` method was removed — code calling `md.linkify.pretest(text)` (a common pattern copied from the core linkify rule) should use `md.linkify.test(text)` instead.

### Rendered Output Changes

`v2.0` picks up markdown-it `v15`'s CommonMark conformance fixes. The rendered HTML may change for the following inputs:

- **Named entities require a terminating semicolon** in all decoding paths, which now includes link destinations and titles. There, invalid names that begin with a valid entity previously had their prefix decoded and now stay literal — for example, a link title of `&notit;` rendered as `¬it;` in `v1.x` and stays `&notit;` now. Entity references in regular text already required the semicolon and are unchanged.
- **A backslash before a space in a link destination** is a literal backslash, and the space ends the destination (CommonMark 6.3). `[a](/url\ )` now parses as a link to `/url%5C` instead of staying plain text.
- **Lowercase declarations are recognized as HTML blocks** (CommonMark 4.6), so with `html: true`, `<!doctype html>` is now passed through as an HTML block just like `<!DOCTYPE html>` — and can now interrupt a paragraph.
- **Image `alt` text now includes inline code content** as plain text, and escapes/entities inside `alt` are normalized. ``![foo *bar* `baz`](image.png)`` now renders `alt="foo bar baz"` — `v1.x` dropped the code span's content entirely, rendering `alt="foo bar "` with a trailing space. Two related plugin-facing details: `renderer.renderInlineAsText()` (the public method behind `alt` rendering) now emits `code_inline` content for every caller, and the `text_join` core rule now also runs over an `image` token's `children`, so plugins inspecting them see `text_special` tokens converted and adjacent text tokens merged.

## Reference Tokens

This is the biggest token-stream change in `v2.0`, and it differs from what markdown-it users experienced — markdown-it `v14` emitted no tokens for reference definitions, while **markdown-exit** `v1.x` emitted a visible `reference` token for each one.

In `v2.0`, following markdown-it `v15`:

- The token type is renamed from `reference` to `reference_definition`, and it is now a `hidden` token that renders to nothing. The default renderer rule `reference` has been removed, and custom `renderer.rules.reference` handlers will no longer be called.
- A new core rule `strip_references` removes these tokens from the parsed stream **by default**, so `md.parse()` output matches markdown-it and plugins that walk block tokens see the stream they expect. The rule is enabled in all presets, including `commonmark` and `zero`.

If you relied on `v1.x` reference tokens (for example, to locate definitions in the source), opt back in by disabling the rule:

```ts
const md = createMarkdownExit()
md.core.ruler.disable('strip_references')

const tokens = md.parse('[foo]: /url\n\ntext', {})
const ref = tokens.find(t => t.type === 'reference_definition')
// ref.info => 'FOO'          (normalized label)
// ref.meta => { label: 'FOO', title: '', href: '/url' }
// ref.map  => [0, 1]
// ref.hidden => true
```

Note that `token.meta` gained a `label` property (`v1.x` only had `{ title, href }`), and the definitions themselves are still collected into `env.references` in both versions.

Parser-created `meta` objects (on `reference_definition`, `link_open` and `image` tokens) are now prototype-less (`Object.create(null)`), so `Object.prototype` methods such as `meta.hasOwnProperty(...)` are not available on them — use `Object.hasOwn(meta, key)` instead.

### Reference Labels on Links and Images

Reference-style links and images now record which label they resolved through: `link_open` and `image` tokens carry `meta.label` with the normalized label. This is new in `v2.0` (synced from markdown-it `v15`) and is useful for plugins that need to map rendered links back to their definitions.

```ts
const tokens = md.parse('[text][foo]\n\n[foo]: /url', {})
const inline = tokens.find(t => t.type === 'inline')
// inline.children[0].meta => { label: 'FOO' }
```

Only reference-style links and images (full, collapsed and shortcut forms) carry `meta.label` — for inline links like `[a](/url)`, `meta` is still `null`, so don't assume it is always present on `link_open` tokens.

## For Plugin Developers

### Removed Utilities

Three legacy helpers were removed from `md.utils`, matching markdown-it `v15`:

| Removed | Replacement |
| --- | --- |
| `md.utils.assign(obj, ...sources)` | `Object.assign()` |
| `md.utils.has(object, key)` | `Object.hasOwn()` or `Object.prototype.hasOwnProperty.call()` |
| `md.utils.isString(value)` | `typeof value === 'string'` |

A new helper `md.utils.callable(Class)` was added — it wraps a class so it can be constructed with or without `new` (it is what powers the callable default export).

markdown-it plugins that still call the removed helpers (typically `v14`-era plugins) will throw at runtime. Update them to a markdown-it `v15`-compatible release, or ask the plugin author for support.

### Parser Classes as Statics

For compatibility with markdown-it `v15` plugins, the internal parser classes are now also available as static properties on the class (and therefore on the default export):

```ts
import MarkdownExit from 'markdown-exit'

const Token = MarkdownExit.Token
const StateBlock = MarkdownExit.StateBlock
// Also: Ruler, Renderer, ParserCore, StateCore,
//       ParserBlock, ParserInline, StateInline
```

The named exports from the package root that existed in `v1.x` are unchanged and remain the recommended, tree-shaking-friendly form:

```ts
import { StateBlock, Token } from 'markdown-exit'
```

### Other Changes

- **`StateBlock#ddIndent` was removed** (synced from markdown-it `v15`). It only existed for old versions of `markdown-it-deflist` — update the plugin to a `v15`-compatible release.
- **`validateLink`, `normalizeLink` and `normalizeLinkText` moved from instance properties to prototype methods.** Overriding them per instance (`md.validateLink = url => true`) still works exactly as before, but they are no longer own enumerable properties — copying an instance with `Object.assign({}, md)` or object spread no longer picks them up.
- **`md.configure(preset)` now replaces `md.options`** with a fresh copy of the preset's options instead of merging into the current object (matching markdown-it `v15`). Custom keys you attached to `md.options` do not survive a later `configure()` call, and references to the old `md.options` object become stale.
- **Subclassing the default export now works.** `class MyMd extends MarkdownExit {}` behaves correctly even when `MarkdownExit` is the callable default export. As a side effect, `instance.constructor` now points to the `MarkdownExit` class rather than the callable wrapper.
- **`MarkdownExitEnv` accepts `symbol` index keys**, so plugins can namespace their `env` state without type errors.

## Dependencies

| Package | `v1.x` | `v2.0` |
| --- | --- | --- |
| `entities` | `^7.0.0` | `^8.0.0` |
| `linkify-it` | `^5.0.1` | `^6.0.0` |
| `uc.micro` | `^2.1.0` | `^3.0.0` |
| `mdurl` | `^2.0.0` | `^2.1.0` |
| `@types/linkify-it`, `@types/mdurl` | dependency | removed |

`@types/linkify-it` and `@types/mdurl` are no longer needed — `linkify-it` `v6` ships its own types (note that `LinkifyIt` is now a named export of that package) and `mdurl` is typed as well. If your project depended on these `@types` packages transitively, add them to your own dependencies or drop the usage.

## Trouble?

If you hit a problem that this guide doesn't cover, please [open an issue](https://github.com/serkodev/markdown-exit/issues/new/choose) — it likely affects other users too.
