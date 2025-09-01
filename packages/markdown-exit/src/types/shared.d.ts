export interface MarkdownExitEnv {
  references?: Record<string, {
    title: string
    href: string
  }>

  [key: string]: any
}
