---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "markdown-exit"
  text: "The Modern\nToolkit for Markdown"
  tagline: Fast, Full CommonMark Support and Extensible
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/serkodev/markdown-exit

features:
  - title: Type Safety
    details: Ship robust types, improve DX, and enable type-safe development.
    icon: 🛡️
    link: /reference/api/Class.MarkdownExit.html
  - title: Async Rendering
    details: Support async rendering for all markdown elements including code blocks highlighting.
    icon: ⚡
    link: /guide/rendering.html#async-rendering
  - title: Plugin System
    details: Plugin-based architecture to extend and customize markdown parsing and rendering.
    icon: 🔌
    link: /guide/plugins.html
  - title: Compatibility
    details: Compatible with markdown-it and plugin API. Seamless migration from markdown-it.
    icon: 🤝
    link: /guide/migrate-from-markdown-it.html
