import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'markdown-exit',
  description: 'The Modern Toolkit for Markdown',
  markdown: {
    theme: { light: 'github-light', dark: 'vitesse-dark' },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: { src: '/logo.svg', height: 24 },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction.md', activeMatch: '/guide/' },
      { text: 'API Reference', link: '/reference/api/Interface.MarkdownExitOptions.md', activeMatch: '/reference/' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        base: '/guide',
        items: [
          { text: 'Introduction', link: '/introduction.md' },
          { text: 'Quick Start', link: '/quick-start.md' },
          { text: 'Migrate from markdown-it', link: '/migrate-from-markdown-it.md' },
        ],
      },

      {
        text: 'Guide',
        base: '/guide',
        items: [
          { text: 'Markdown Syntax', link: '/markdown-syntax.md' },
          { text: 'Rendering', link: '/rendering.md' },
          { text: 'Plugins', link: '/plugins.md' },
        ],
      },

      {
        text: ('API Reference'),
        base: `/reference`,
        items: [
          { text: ('Config Options'), link: '/api/Interface.MarkdownExitOptions.md' },
          { text: ('MarkdownExit Class'), link: '/api/Class.MarkdownExit.md' },
        ],
      },
    ],

    outline: 'deep',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/serkodev/markdown-exit' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/markdown-exit' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © Alex Kocharin, Vitaly Puzrin, SerKo',
    },
  },
})
