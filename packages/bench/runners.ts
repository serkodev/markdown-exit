import * as commonmark from 'commonmark'
import MarkdownExit from 'markdown-exit'
import MarkdownIt from 'markdown-it'
import { marked } from 'marked'

export function createMarkdownExit() {
  const mdExit = new MarkdownExit({
    html: true,
    linkify: true,
    typographer: true,
  })
  return (input: string): string => mdExit.render(input)
}

export function createMarkdownExitCommonMark() {
  const md = new MarkdownExit('commonmark')
  const encode = md.utils.lib.mdurl.encode
  md.normalizeLink = function (url) {
    return encode(url)
  }
  md.normalizeLinkText = function (str) {
    return str
  }
  return (input: string): string => md.render(input)
}

export function createMarkdownIt() {
  const mdIt = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  })
  return (input: string): string => mdIt.render(input)
}

export function createMarkdownItCommonMark() {
  const md = new MarkdownIt('commonmark')
  const encode = md.utils.lib.mdurl.encode
  md.normalizeLink = function (url) {
    return encode(url)
  }
  md.normalizeLinkText = function (str) {
    return str
  }
  return (input: string): string => md.render(input)
}

export function createMarked() {
  return (input: string): string => marked(input, { async: false })
}

export function createCommonmark() {
  const parser = new commonmark.Parser()
  const renderer = new commonmark.HtmlRenderer()
  return (input: string): string => renderer.render(parser.parse(input))
}

export function createRunners(): Record<string, Record<string, (input: string) => string>> {
  return {
    markdown: {
      'markdown-exit': createMarkdownExit(),
      'markdown-it': createMarkdownIt(),
      'marked': createMarked(),
    },
    commonmark: {
      'commonmark': createCommonmark(),
      'markdown-exit-commonmark': createMarkdownExitCommonMark(),
      'markdown-it-commonmark': createMarkdownItCommonMark(),
    },
  }
}
