import { defineConfig } from 'vitepress'
import { createMarkdownExit } from '../../packages/markdown-exit/src'

const title = 'markdown-exit'
const description = 'The Modern Toolkit for Markdown'
const docsUrl = 'https://markdown-exit.pages.dev/'
const ogImage = `${docsUrl}og-image.png`

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'markdown-exit',
  description: 'The Modern Toolkit for Markdown',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo-mini.svg' }],
    ['meta', { name: 'theme-color', content: '#00AF6B' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: docsUrl }],
    ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:image', content: ogImage }],
  ],
  markdown: {
    theme: { light: 'github-light', dark: 'vitesse-dark' },
    // HACK: replace vitepress markdown-it instance with markdown-exit
    // reference: https://github.com/vuejs/vitepress/blob/be260fda6efc1d6c4b56219d7a17a19ab7a4ba76/src/node/markdown/markdown.ts#L263-L266
    preConfig: (md) => {
      const exit = createMarkdownExit(md.options)
      exit.linkify.set({ fuzzyLink: false })

      // use restoreEntities plugin from vitepress
      const textJoinRule = md.core.ruler.getRules('').find(r => r.name === 'text_join')
      const textRenderRule = md.renderer.rules.text
      if (!textJoinRule || !textRenderRule)
        throw new Error('Cannot find restoreEntities plugin from vitepress ')
      exit.core.ruler.at('text_join', textJoinRule as any)
      exit.renderer.rules.text = textRenderRule as any

      Object.assign(md, exit)
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: { src: '/logo-mini.svg', height: 24 },
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
